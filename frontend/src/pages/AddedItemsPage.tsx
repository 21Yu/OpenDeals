import { useEffect, useState } from 'react';
import { fetchUserItems } from '../services/api';
import type { ShoppingItemResponse } from '../models/types';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/cards/ItemCard';
import Layout from '../components/layout/Layout';

export function AddedItemsPage () {
  const [items, setItems] = useState<ShoppingItemResponse[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchSavedListings = async () => {
      try {
        const data = await fetchUserItems();
        setItems(data.items);
      } catch (error) {
        console.error("Failed to load saved listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedListings();
  }, [user]);

  return (
    <Layout>
      {!user ? (
        <div className="p-8 text-center text-lg min-h-screen flex items-center justify-center">Please login to see saved listings</div>
      ) : loading ? (
        <div className="p-8">Loading saved listings...</div>
      ) : (
        <div className="p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Your Saved Listings</h1>
          {items.length === 0 ? (
            <p className="text-gray-500">You haven't saved any listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  savedItem={item}
                  onBookmarkChange={(savedItem) => {
                    if (!savedItem) {
                      setItems((current) => current.filter((saved) => saved.id !== item.id));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}