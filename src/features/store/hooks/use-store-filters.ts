import { useMemo, useState } from "react";
import { mockTemplates } from "@/features/store/mock-data";
import type { StoreFilters } from "@/types/store";

export const useStoreFilters = () => {
  const [filters, setFilters] = useState<StoreFilters>({
    sortBy: "popular",
  });

  const filteredTemplates = useMemo(() => {
    let filtered = [...mockTemplates];

    // 카테고리 필터
    if (filters.category && filters.category !== "전체") {
      filtered = filtered.filter(
        (template) => template.category === filters.category,
      );
    }

    // 가격 범위 필터
    if (filters.priceRange) {
      filtered = filtered.filter(
        (template) =>
          template.price >= filters.priceRange!.min &&
          template.price <= filters.priceRange!.max,
      );
    }

    // 평점 필터
    if (filters.rating) {
      filtered = filtered.filter(
        (template) => template.rating >= filters.rating!,
      );
    }

    // 태그 필터
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((template) =>
        filters.tags!.some((tag) => template.tags.includes(tag)),
      );
    }

    // 정렬
    switch (filters.sortBy) {
      case "popular":
        filtered.sort((a, b) => {
          // 인기도 우선 (isPopular), 그 다음 리뷰 수
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.reviewCount - a.reviewCount;
        });
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [filters]);

  const updateFilters = (newFilters: Partial<StoreFilters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({ sortBy: "popular" });
  };

  return {
    filters,
    filteredTemplates,
    updateFilters,
    resetFilters,
  };
};
