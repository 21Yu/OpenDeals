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
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="text-[16px] font-bold">Results ({results.length})</h2>
      </div>

      <div id="sidebar-scroll-container" className="p-4 overflow-y-auto flex-1">
        {loading ? (
          <p className="text-[12px] text-gray-400">loading...</p>
        ) : results.length === 0 ? (
          <p className="text-[12px] text-gray-400">No data matching criteria</p>
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