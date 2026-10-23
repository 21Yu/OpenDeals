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
        <div className="page-message">Please log in to see your saved finds.</div>
      ) : loading ? (
        <div className="page-message">Loading saved listings...</div>
      ) : (
        <div className="saved-page">
          <div className="page-intro compact-intro">
            <p className="eyebrow">YOUR PERSONAL SHORTLIST</p>
            <h1>Saved <em>finds.</em></h1>
            <p className="intro-copy">Good deals worth coming back to.</p>
          </div>
          {items.length === 0 ? (
            <p className="empty-state saved-empty">You haven't saved any listings yet.</p>
          ) : (
            <div className="saved-grid">
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