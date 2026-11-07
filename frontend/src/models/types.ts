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
  analytics?: DealAnalytics;
}

export interface DealAnalytics {
  currentPrice: number | null;
  average30Day: number | null;
  historicLow: boolean;
  droppedToday: boolean;
  badges: string[];
}

export interface PriceHistoryEntry {
  price: number;
  recorded_at: string;
}

export interface ProductHistoryResponse {
  item: Pick<ShoppingItemResponse, "id" | "title" | "price" | "extracted_price" | "product_link" | "thumbnail">;
  history: PriceHistoryEntry[];
}