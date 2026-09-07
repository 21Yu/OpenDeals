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
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-6 p-8"
      >
        <div className="w-full">
          <label className="text-[16px] font-bold block mb-1">
            Search Keywords
          </label>
          <input
            type="text"
            name="query"
            placeholder="Search items..."
            value={formData.query}
            onChange={handleChange}
            required
            className="appearance-none w-full border p-3"
          />
        </div>

        <div className="w-full">
          <label className="text-[16px] font-bold block mb-1">
            Min Price ($)
          </label>
          <input
            type="number"
            name="minPrice"
            placeholder="0"
            min="0"
            value={formData.minPrice}
            onChange={handleChange}
            className="appearance-none w-full border p-3"
          />
        </div>

        <div className="w-full">
          <label className="text-[16px] font-bold block mb-1">
            Max Price ($)
          </label>
          <input
            type="number"
            name="maxPrice"
            placeholder="1000"
            min="0"
            value={formData.maxPrice}
            onChange={handleChange}
            className="appearance-none w-full border p-3"
          />
        </div>

        <div className="w-full">
          <label className="text-[16px] font-bold block mb-1">Sort By</label>
          <select
            name="sortBy"
            value={formData.sortBy}
            onChange={handleChange}
            className="appearance-none w-full border p-3"
          >
            <option value="1">Price: Low to High</option>
            <option value="2">Price: High to Low</option>
          </select>
        </div>

        <div className="w-full">
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 font-bold bg-rose-300 hover:bg-rose-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>
    </div>
  );
}