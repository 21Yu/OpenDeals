import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';
import { authenticateJWT } from '../middleware/auth.js';
import type { ShoppingItem } from '../types/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const cookieSameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

const userRouter = Router();

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: cookieSameSite,
      maxAge: 3600000, 
    });

    const returnUser = {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    }

    res.status(200).json({ user: returnUser });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.get('/me', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: cookieSameSite,
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

userRouter.post('/add-item', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
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
    
    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    console.error('Failed to add item:', error);
    res.status(500).json({ message: 'Error adding item to user' });
  }
});

userRouter.get('/allitems', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const query = `
      SELECT *
      FROM shopping_items
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    res.status(500).json({ message: 'Error fetching user items' });
  }
});

userRouter.delete('/deleteitem/:id', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
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