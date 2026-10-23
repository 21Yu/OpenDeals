import { useEffect, useState } from "react";
import SearchForm from "../components/forms/SearchForm";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/SideBar";
import type { SearchFormValues } from "../components/forms/SearchForm";
import type { ShoppingItem } from "../models/types";
import { fetchItems } from "../services/api";
import { fetchUserItems } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { ShoppingItemResponse } from "../models/types";

export default function MainPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFormValues>({
    query: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "1",
  });
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [savedItems, setSavedItems] = useState<ShoppingItemResponse[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchUserItems().then((data) => setSavedItems(data.items)).catch((err) => {
      console.error("Failed to load bookmarks", err);
    });
  }, [user]);

  useEffect(() => {
    // Prevent fetching if query is empty
    if (!filters.query.trim()) return;

    const getItems = async () => {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        q: filters.query,
        ...(filters.minPrice && { min_price: filters.minPrice }),
        ...(filters.maxPrice && { max_price: filters.maxPrice }),
        sort_by: filters.sortBy,
      });

      try {
        const data = await fetchItems(searchParams.toString());
        setItems(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    getItems();
  }, [filters]);

  return (
    <Layout>
      <div className="marketplace-page">
        <section className="search-column">
          <div className="page-intro">
            <p className="eyebrow">THE GOOD FINDS, GATHERED</p>
            <h1>Find your next<br /><em>great deal.</em></h1>
            <p className="intro-copy">Search the web's best offers, all in one place.</p>
          </div>
          <SearchForm onFormSubmit={setFilters} loading={loading} />
          {error && <p className="search-error" role="alert">{error}</p>}
        </section>
        <section className="results-column">
          <Sidebar
            results={items}
            loading={loading}
            savedItems={user ? savedItems : []}
            onBookmarkChange={(savedItem, productId) => {
              if (!productId) return;
              setSavedItems((current) => [
                ...current.filter((item) => item.product_id !== productId),
                ...(savedItem ? [savedItem] : []),
              ]);
            }}
          />
        </section>
      </div>
    </Layout>
  );
}