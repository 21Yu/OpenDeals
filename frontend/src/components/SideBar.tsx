import type { ShoppingItem, ShoppingItemResponse } from "../models/types";
import ItemCard from "./cards/ItemCard";

type ProductSidebarProps = {
  results: ShoppingItem[];
  loading: boolean;
  savedItems: ShoppingItemResponse[];
  onBookmarkChange: (item: ShoppingItemResponse | undefined, productId?: string) => void;
};

export default function Sidebar({
  results,
  loading,
  savedItems,
  onBookmarkChange,
}: ProductSidebarProps) {

  return (
    <div className="results-panel">
      <div className="results-heading">
        <div>
          <p className="eyebrow">LIVE SEARCH</p>
          <h2>Results <span>({results.length})</span></h2>
        </div>
      </div>

      <div id="sidebar-scroll-container" className="results-list">
        {loading ? (
          <p className="empty-state">Finding the best matches...</p>
        ) : results.length === 0 ? (
          <p className="empty-state">No matches yet. Try a different search.</p>
        ) : (
          <ul>
            {results.map((item) => {
              const id = item.product_id || item.position;
              return (
                <ItemCard
                  key={id}
                  item={item}
                  savedItem={savedItems.find((savedItem) => savedItem.product_id === item.product_id)}
                  onBookmarkChange={(savedItem) => onBookmarkChange(savedItem, item.product_id)}
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}