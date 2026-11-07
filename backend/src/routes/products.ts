import { Router, Response } from 'express';
import { pool } from '../db/index.js';
import { authenticateJWT } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/types.js';

const productsRouter = Router();

productsRouter.get('/:id/history', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const itemId = Number(req.params.id);

  if (!Number.isInteger(itemId) || itemId < 1) {
    res.status(400).json({ message: 'A valid product id is required' });
    return;
  }

  try {
    const itemResult = await pool.query(
      `SELECT id, title, price, extracted_price, product_link, thumbnail
       FROM shopping_items
       WHERE id = $1 AND user_id = $2`,
      [itemId, req.user?.userId]
    );

    if (itemResult.rows.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const historyResult = await pool.query(
      `SELECT price, recorded_at
       FROM price_history
       WHERE item_id = $1
       ORDER BY recorded_at ASC, id ASC`,
      [itemId]
    );

    res.json({
      item: itemResult.rows[0],
      history: historyResult.rows.map((entry) => ({
        price: Number(entry.price),
        recorded_at: entry.recorded_at,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch product history:', error);
    res.status(500).json({ message: 'Error fetching product history' });
  }
});

export default productsRouter;