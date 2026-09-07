import { useState } from "react";
import type { ShoppingItem, ShoppingItemResponse } from "../../models/types";
import { useAuth } from "../../context/AuthContext";
import { addUserItem, deleteUserItem } from "../../services/api";

type ItemCardProps = {
  item: ShoppingItem;
  savedItem?: ShoppingItemResponse;
  onBookmarkChange?: (savedItem: ShoppingItemResponse | undefined) => void;
};

export default function ItemCard({ item, savedItem, onBookmarkChange }: ItemCardProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = Boolean(savedItem);

  const handleBookmark = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      if (savedItem) {
        await deleteUserItem(savedItem.id);
        onBookmarkChange?.(undefined);
      } else {
        const response = await addUserItem(item);
        onBookmarkChange?.(response.item);
      }
    } catch (error) {
      console.error("Failed to update bookmark", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="mb-6 list-none">
      <div
        className={`border-1`}
      >
        <div className="p-3 flex justify-between items-center border-b">
          <h3 className="text-[16px] font-bold" title={item.title}>
            {item.title}
          </h3>
          <button
            type="button"
            onClick={handleBookmark}
            disabled={!user || isSaving}
            aria-label={user ? (isSaved ? "Remove bookmark" : "Bookmark item") : "Log in to bookmark item"}
            title={user ? (isSaved ? "Remove bookmark" : "Bookmark item") : "Log in to bookmark item"}
            className="text-xl leading-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaved ? "★" : "☆"}
          </button>
          {item.source && (
            <span className="text-[12px] px-2 py-1 text-gray-500 flex items-center gap-1">
              {item.source_icon && (
                <img src={item.source_icon} alt="" className="w-4 h-4 object-contain" />
              )}
              {item.source}
            </span>
          )}
        </div>

        <div className="p-4 flex gap-4">
          {item.thumbnail && (
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div className="flex gap-8">
              <div>
                <p className="text-[12px] text-gray-400">Price</p>
                <p className="font-bold">{item.price}</p>
              </div>

              {item.rating && (
                <div>
                  <p className="text-[12px] text-gray-400">Rating</p>
                  <p className="text-yellow-600">
                    ★ {item.rating}{" "}
                    {item.reviews && (
                      <span className="text-gray-400 text-xs">
                        ({item.reviews.toLocaleString()})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {item.snippet && (
              <div>
                <p className="text-[12px] text-gray-400">Details</p>
                <p className="text-sm text-gray-600 line-clamp-2">{item.snippet}</p>
              </div>
            )}

          </div>
        </div>

        {item.product_link && (
          <a
            href={item.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex p-3 font-bold justify-center hover:text-rose-300"
          >
            <h3>View Product Details</h3>
          </a>
        )}
      </div>
    </li>
  );
}