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

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface ShoppingItemResponse extends ShoppingItem {
  id: number;
  user_id?: number;
  created_at?: string;
}