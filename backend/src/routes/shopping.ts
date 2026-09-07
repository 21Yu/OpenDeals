import { Router, Request, Response } from 'express';
import { ShoppingQueryParams, ShoppingItem } from '../types/types';

const shoppingRouter = Router();

shoppingRouter.get('/', async (
  req: Request<{}, {}, {}, ShoppingQueryParams>,
  res: Response<{ items: ShoppingItem[] } | { error: string }>
) => {
  try {
    const { q, min_price, max_price, sort_by } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query "q" is required' });
    }

    // REMOVE json_restrictor here so SerpApi returns raw data reliably
    const serpApiParams = new URLSearchParams({
      engine: 'google_shopping',
      q,
      api_key: process.env.SERPAPI_KEY || '',
      ...(min_price && { min_price }),
      ...(max_price && { max_price }),
      ...(sort_by && { sort_by }),
    });

    const response = await fetch(`https://serpapi.com/search.json?${serpApiParams.toString()}`);

    if (!response.ok) {
      throw new Error(`SerpApi responded with status: ${response.status}`);
    }

    const data = await response.json();
    const rawResults = data.shopping_results || [];

    // Clean and transform data in Node: Strips out long token strings completely
    const cleanedResults: ShoppingItem[] = rawResults.map((item: any) => ({
      position: item.position,
      title: item.title,
      product_id: item.product_id,
      product_link: item.product_link,
      source: item.source,
      source_icon: item.source_icon,
      multiple_sources: item.multiple_sources,
      price: item.price,
      extracted_price: item.extracted_price,
      rating: item.rating,
      reviews: item.reviews,
      snippet: item.snippet,
      extensions: item.extensions,
      thumbnail: item.thumbnail,
      delivery: item.delivery,
    }));

    return res.json({ items: cleanedResults });
  } catch (error) {
    console.error('Error fetching shopping data:', error);
    return res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

export default shoppingRouter;