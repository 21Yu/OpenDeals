import type { ShoppingResult } from "../models/types";
import ItemCard from "./cards/ItemCard";

type ProductSidebarProps = {
  results: ShoppingResult[];
  loading: boolean;
};

export default function Sidebar({
  results,
  loading,
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
                <ItemCard key={id} item={item}/>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}