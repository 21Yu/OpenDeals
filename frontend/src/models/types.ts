export interface ShoppingResult {
  position: number;
  title: string;
  product_id?: string;
  product_link?: string;
  source?: string;
  source_icon?: string;
  multiple_sources?: boolean;
  price: string;
  extracted_price: number;
  rating?: number;
  reviews?: number;
  snippet?: string;
  extensions?: string[];
  thumbnail?: string;
  delivery?: string;
}