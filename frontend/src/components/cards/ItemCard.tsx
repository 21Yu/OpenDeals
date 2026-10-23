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
    <li className="item-card">
      <article className="item-card-inner">
        <div className="item-card-heading">
          <h3 title={item.title}>
            {item.title}
          </h3>
          <button
            type="button"
            onClick={handleBookmark}
            disabled={!user || isSaving}
            aria-label={user ? (isSaved ? "Remove bookmark" : "Bookmark item") : "Log in to bookmark item"}
            title={user ? (isSaved ? "Remove bookmark" : "Bookmark item") : "Log in to bookmark item"}
            className="bookmark-button"
          >
            {isSaved ? "★" : "☆"}
          </button>
          {item.source && (
            <span className="item-source">
              {item.source_icon && (
                <img src={item.source_icon} alt="" />
              )}
              {item.source}
            </span>
          )}
        </div>

        <div className="item-card-body">
          {item.thumbnail && (
            <div className="item-image">
              <img
                src={item.thumbnail}
                alt={item.title}
                className=""
              />
            </div>
          )}

          <div className="item-details">
            <div className="item-metrics">
              <div>
                <p className="metric-label">Price</p>
                <p className="item-price">{item.price}</p>
              </div>

              {item.rating && (
                <div>
                  <p className="metric-label">Rating</p>
                  <p className="item-rating">
                    ★ {item.rating}{" "}
                    {item.reviews && (
                      <span className="review-count">
                        ({item.reviews.toLocaleString()})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {item.snippet && (
              <div>
                <p className="metric-label">Details</p>
                <p className="item-snippet">{item.snippet}</p>
              </div>
            )}

          </div>
        </div>

        {item.product_link && (
          <a
            href={item.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="product-link"
          >
            View Product Details <span aria-hidden="true">↗</span>
          </a>
        )}
      </article>
    </li>
  );
}