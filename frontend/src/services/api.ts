import type { ShoppingResult } from "../components/ProductSearch";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export async function fetchItems(searchQuery: string): Promise<ShoppingResult[]> {
    const res = await fetch(`${baseURL}/shopping/?${searchQuery}`)

    if (!res.ok) {
        throw new Error('Failed to fetch items');
    }

    return res.json()
}