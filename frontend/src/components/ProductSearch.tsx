import React, { useState } from 'react';

// Types matching SerpApi's exact shopping_results item structure
export interface ShoppingResult {
  position: number;
  title: string;
  product_id?: string;
  product_link?: string;
  source?: string;
  source_icon?: string;
  multiple_sources?: boolean;
  price: string;
  extracted_price: number;
  rating?: number;
  reviews?: number;
  snippet?: string;
  extensions?: string[];
  thumbnail?: string;
  delivery?: string;
}

export const ProductSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('iPhone');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'1' | '2'>('1');

  const [results, setResults] = useState<ShoppingResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const searchParams = new URLSearchParams({
      q: query,
      ...(minPrice && { min_price: minPrice }),
      ...(maxPrice && { max_price: maxPrice }),
      sort_by: sortBy,
    });

    try {
      const response = await fetch(`/api/shopping?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to retrieve product data');
      }

      const data: ShoppingResult[] = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Google Shopping Search</h2>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          style={{ padding: '8px', flex: '1 1 200px' }}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: '8px', width: '100px' }}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: '8px', width: '100px' }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as '1' | '2')} style={{ padding: '8px' }}>
          <option value="1">Price: Low to High</option>
          <option value="2">Price: High to Low</option>
        </select>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.map((item) => (
          <div
            key={item.product_id || item.position}
            style={{
              display: 'flex',
              gap: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fff',
            }}
          >
            {/* Thumbnail */}
            {item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={item.title}
                style={{ width: '120px', height: '120px', objectFit: 'contain' }}
              />
            )}

            {/* Content Details */}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                <a href={item.product_link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1a0dab' }}>
                  {item.title}
                </a>
              </h3>

              {/* Price & Merchant */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.price}</span>
                {item.source && (
                  <span style={{ color: '#5f6368', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    from {item.source_icon && <img src={item.source_icon} alt="" width={16} height={16} />}
                    {item.source}
                  </span>
                )}
              </div>

              {/* Rating & Reviews */}
              {item.rating && (
                <div style={{ color: '#e3a008', fontSize: '0.9rem', marginBottom: '6px' }}>
                  ★ {item.rating} {item.reviews && <span style={{ color: '#5f6368' }}>({item.reviews.toLocaleString()} reviews)</span>}
                </div>
              )}

              {/* Snippet / Features */}
              {item.snippet && <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#3c4043' }}>{item.snippet}</p>}

              {/* Delivery and Location Extensions */}
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#188038' }}>
                {item.delivery && <span>🚚 {item.delivery}</span>}
                {item.extensions?.map((ext, i) => (
                  <span key={i} style={{ color: '#70757a' }}>📍 {ext}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};