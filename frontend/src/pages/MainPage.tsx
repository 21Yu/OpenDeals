import { useEffect, useState } from "react";
import SearchForm from "../components/forms/SearchForm";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/SideBar";
import type { SearchFormValues } from "../components/forms/SearchForm";
import type { ShoppingResult } from "../models/types";
import { fetchItems } from "../services/api";

export default function MainPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFormValues>({
    query: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "1",
  });
  const [items, setItems] = useState<ShoppingResult[]>([]);

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
        setItems(data);
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
      <main className="flex flex-col md:flex-row p-12 gap-8">
        <section className="flex-1">
          <SearchForm onFormSubmit={setFilters} loading={loading} />
          {error && <p className="px-10 text-red-500 text-sm">{error}</p>}
        </section>
        <section className="flex-1">
          <Sidebar results={items} loading={loading} />
        </section>
      </main>
    </Layout>
  );
}