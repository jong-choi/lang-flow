export type StoreViewMode = "grid" | "list";

export interface PriceRange {
  min: number;
  max: number;
}

export type StoreSortOption =
  | "popular"
  | "newest"
  | "price-low"
  | "price-high"
  | "rating";

export interface StoreFilters {
  category?: string;
  priceRange?: PriceRange;
  rating?: number;
  tags?: string[];
  sortBy?: StoreSortOption;
}
