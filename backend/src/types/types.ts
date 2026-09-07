export interface UserPayload {
  userId: number;
  email: string;
}

export interface ShoppingQueryParams {
  q: string;
  min_price?: string;
  max_price?: string;
  sort_by?: '1' | '2';
}

export interface ShoppingItem {
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

