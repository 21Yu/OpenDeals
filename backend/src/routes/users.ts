import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';
import { authenticateJWT } from '../middleware/auth.js';
import type { ShoppingItem, AuthenticatedRequest } from '../types/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const userRouter = Router();

type PriceSnapshot = {
  item_id: number;
  price: string;
  recorded_at: Date;
};

function buildDealAnalytics(snapshots: PriceSnapshot[]) {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const current = snapshots.at(-1);
  const currentPrice = current ? Number(current.price) : null;
  const prices = snapshots.map((snapshot) => Number(snapshot.price));
  const recentPrices = snapshots
    .filter((snapshot) => snapshot.recorded_at.getTime() >= thirtyDaysAgo)
    .map((snapshot) => Number(snapshot.price));
  const average30Day = recentPrices.length > 0
    ? recentPrices.reduce((total, price) => total + price, 0) / recentPrices.length
    : null;
  const historicLow = prices.length > 1 && currentPrice !== null
    ? currentPrice <= Math.min(...prices)
    : false;
  const droppedToday = snapshots.length > 1 && current
    ? current.recorded_at.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
      && Number(current.price) < Number(snapshots.at(-2)?.price)
    : false;
  const averageDiscount = average30Day && currentPrice !== null
    ? Math.floor(((average30Day - currentPrice) / average30Day) * 100)
    : 0;
  const badges: string[] = [];

  if (historicLow) badges.push('Historic Low!');
  if (averageDiscount >= 15) badges.push(`${averageDiscount}% Below 30-Day Avg`);
  if (droppedToday) badges.push('Price Dropped Today');

  return {
    currentPrice,
    average30Day,
    historicLow,
    droppedToday,
    badges,
  };
}

userRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password_hash) 
      VALUES ($1, $2) 
      RETURNING id, email, created_at
    `;
    const result = await pool.query(query, [email, hashedPassword]);

    res.status(201).json({ user: result.rows[0]});
  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.code === '23505') { // Unique constraint violation in pg
      res.status(409).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600000, 
    });

    const returnUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }

    res.status(200).json({ user: returnUser });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [req.user?.userId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

userRouter.post('/add-item', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const item: ShoppingItem = req.body;

  if (!item || !item.title || item.extracted_price === undefined) {
    res.status(400).json({ message: 'Title and extracted_price are required' });
    return;
  }

  try {
    if (item.product_id) {
      const existingItem = await pool.query(
        'SELECT * FROM shopping_items WHERE user_id = $1 AND product_id = $2',
        [userId, item.product_id]
      );

      if (existingItem.rows.length > 0) {
        res.status(200).json({ item: existingItem.rows[0] });
        return;
      }
    }

    const insertQuery = `
      INSERT INTO shopping_items (
        user_id, position, title, product_id, product_link, source,
        source_icon, multiple_sources, price, extracted_price,
        rating, reviews, snippet, extensions, thumbnail, delivery
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *
    `;

    const values = [
      userId,
      item.position,
      item.title,
      item.product_id || null,
      item.product_link || null,
      item.source || null,
      item.source_icon || null,
      item.multiple_sources ?? false,
      item.price,
      item.extracted_price,
      item.rating || null,
      item.reviews || null,
      item.snippet || null,
      item.extensions || null,
      item.thumbnail || null,
      item.delivery || null,
    ];

    const result = await pool.query(insertQuery, values);

    await pool.query(
      'INSERT INTO price_history (item_id, price) VALUES ($1, $2)',
      [result.rows[0].id, item.extracted_price]
    );
    
    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    console.error('Failed to add item:', error);
    res.status(500).json({ message: 'Error adding item to user' });
  }
});

userRouter.get('/allitems', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const query = `
      SELECT *
      FROM shopping_items
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    const itemIds = result.rows.map((item) => item.id);
    const historyResult = itemIds.length > 0
      ? await pool.query<PriceSnapshot>(
        `SELECT item_id, price, recorded_at
         FROM price_history
         WHERE item_id = ANY($1::int[])
         ORDER BY item_id ASC, recorded_at ASC, id ASC`,
        [itemIds]
      )
      : { rows: [] as PriceSnapshot[] };
    const historyByItem = new Map<number, PriceSnapshot[]>();

    for (const snapshot of historyResult.rows) {
      const itemHistory = historyByItem.get(snapshot.item_id) || [];
      itemHistory.push(snapshot);
      historyByItem.set(snapshot.item_id, itemHistory);
    }

    res.json({
      items: result.rows.map((item) => ({
        ...item,
        analytics: buildDealAnalytics(historyByItem.get(item.id) || []),
      })),
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ message: 'Error fetching user items' });
  }
});

userRouter.delete('/deleteitem/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const itemId = req.params.id;

  try {
    const query = `
      DELETE FROM shopping_items
      WHERE id = $1 AND user_id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [itemId, userId]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Item not found or unauthorized' });
      return;
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ message: 'Error deleting item from user' });
  }
});

export default userRouter;