import { Router, Request, Response } from 'express';
import { pool } from '../db/index.js';

const cronRouter = Router();
const batchSize = 100;

interface TrackedItem {
  id: number;
  user_id: number;
  title: string;
  product_id: string;
  previous_price: string | null;
}

async function fetchCurrentPrice(productId: string): Promise<number> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error('SERPAPI_KEY must be configured');
  }

  const params = new URLSearchParams({
    engine: 'google_product',
    product_id: productId,
    api_key: apiKey,
  });
  const response = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!response.ok) {
    throw new Error(`SerpApi responded with status ${response.status}`);
  }

  const data = await response.json() as {
    product_results?: { extracted_price?: number; price?: string };
  };
  const product = data.product_results;
  const extractedPrice = Number(product?.extracted_price);
  if (Number.isFinite(extractedPrice) && extractedPrice > 0) {
    return extractedPrice;
  }

  const parsedPrice = Number(product?.price?.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    throw new Error('SerpApi did not return a valid product price');
  }
  return parsedPrice;
}

cronRouter.get('/check-prices', async (req: Request, res: Response): Promise<void> => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { rows: items } = await pool.query<TrackedItem>(`
      SELECT si.id, si.user_id, si.title, si.product_id,
        (
          SELECT ph.price
          FROM price_history ph
          WHERE ph.item_id = si.id
          ORDER BY ph.recorded_at DESC, ph.id DESC
          LIMIT 1
        ) AS previous_price
      FROM shopping_items si
      WHERE si.product_id IS NOT NULL
        ORDER BY (
          SELECT MAX(ph.recorded_at)
          FROM price_history ph
          WHERE ph.item_id = si.id
        ) NULLS FIRST, si.id
      LIMIT ${batchSize}
    `);

    let checked = 0;
    let priceDrops = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const currentPrice = await fetchCurrentPrice(item.product_id);
        const previousPrice = item.previous_price === null ? null : Number(item.previous_price);

        if (previousPrice !== null && currentPrice < previousPrice) {
          await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [item.user_id, `${item.title} dropped to $${currentPrice.toFixed(2)}.`]
          );
          priceDrops += 1;
        }

        await pool.query(
          'INSERT INTO price_history (item_id, price) VALUES ($1, $2)',
          [item.id, currentPrice]
        );
        checked += 1;
      } catch (error) {
        failed += 1;
        console.error(`Price check failed for saved item ${item.id}:`, error);
      }
    }

    res.status(200).json({ success: true, checked, priceDrops, failed });
  } catch (error) {
    console.error('Cron price check failed:', error);
    res.status(500).json({ error: 'Cron execution failed' });
  }
});

export default cronRouter;