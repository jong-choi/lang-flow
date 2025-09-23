import type { StateCreator } from "zustand";
import type {
  StoreFilters,
  StoreSortOption,
  StoreViewMode,
  WorkflowTemplate,
} from "@/features/store/types";

const defaultFilters: StoreFilters = {
  sortBy: "popular",
};

export const sortTemplates = (
  templates: WorkflowTemplate[],
  sortBy: StoreSortOption = "popular",
) => {
  const sorted = [...templates];
  switch (sortBy) {
    case "popular":
      sorted.sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return b.reviewCount - a.reviewCount;
      });
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "price-low":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }
  return sorted;
};

export const filterTemplates = (
  templates: WorkflowTemplate[],
  filters: StoreFilters,
  searchQuery: string,
) => {
  return templates.filter((template) => {
    if (filters.category && filters.category !== "전체") {
      if (template.category !== filters.category) {
        return false;
      }
    }

    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (template.price < min || template.price > max) {
        return false;
      }
    }

    if (filters.rating) {
      if (template.rating < filters.rating) {
        return false;
      }
    }

    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        template.tags.includes(tag),
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (searchQuery) {
      const keyword = searchQuery.toLowerCase();
      const matchesKeyword =
        template.title.toLowerCase().includes(keyword) ||
        template.description.toLowerCase().includes(keyword) ||
        template.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
        template.category.toLowerCase().includes(keyword);

      if (!matchesKeyword) {
        return false;
      }
    }

    return true;
  });
};

export const selectVisibleTemplates = (
  templates: WorkflowTemplate[],
  filters: StoreFilters,
  searchQuery: string,
) =>
  sortTemplates(
    filterTemplates(templates, filters, searchQuery),
    filters.sortBy,
  );

export interface FiltersSlice {
  filters: StoreFilters;
  searchQuery: string;
  viewMode: StoreViewMode;
  showFilters: boolean;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: StoreViewMode) => void;
  toggleFilters: (force?: boolean) => void;
  updateFilters: (filters: Partial<StoreFilters>) => void;
  resetFilters: () => void;
}

export const createFiltersSlice: StateCreator<FiltersSlice> = (set) => ({
  filters: defaultFilters,
  searchQuery: "",
  viewMode: "grid",
  showFilters: true,
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
  toggleFilters: (force) => {
    set((state) => ({
      showFilters: typeof force === "boolean" ? force : !state.showFilters,
    }));
  },
  updateFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },
  resetFilters: () => {
    set({ filters: defaultFilters });
  },
});
