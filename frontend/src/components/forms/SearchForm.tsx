import { useState } from "react";

export type SearchFormValues = {
  query: string;
  minPrice: string;
  maxPrice: string;
  sortBy: "1" | "2";
};

type SearchFormProps = {
  onFormSubmit: (data: SearchFormValues) => void;
  loading?: boolean;
};

export default function SearchForm({ onFormSubmit, loading }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchFormValues>({
    query: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "1",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onFormSubmit(formData);
  }

  return (
    <div className="search-form-wrap">
      <form
        onSubmit={handleSubmit}
        className="search-form"
      >
        <div className="field-group query-field">
          <label className="field-label">
            Search Keywords
          </label>
          <input
            type="text"
            name="query"
            placeholder="Search items..."
            value={formData.query}
            onChange={handleChange}
            required
            className="field-control"
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Min Price ($)
          </label>
          <input
            type="number"
            name="minPrice"
            placeholder="0"
            min="0"
            value={formData.minPrice}
            onChange={handleChange}
            className="field-control"
          />
        </div>

        <div className="field-group">
          <label className="field-label">
            Max Price ($)
          </label>
          <input
            type="number"
            name="maxPrice"
            placeholder="1000"
            min="0"
            value={formData.maxPrice}
            onChange={handleChange}
            className="field-control"
          />
        </div>

        <div className="field-group sort-field">
          <label className="field-label">Sort By</label>
          <select
            name="sortBy"
            value={formData.sortBy}
            onChange={handleChange}
            className="field-control"
          >
            <option value="1">Price: Low to High</option>
            <option value="2">Price: High to Low</option>
          </select>
        </div>

        <div className="submit-field">
          <button
            type="submit"
            disabled={loading}
            className="primary-button"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
    </div>
  );
}