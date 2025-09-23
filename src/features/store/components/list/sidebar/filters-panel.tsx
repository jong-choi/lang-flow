import { useMemo } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { cn } from "@/utils/cn";
import { CategoryFilterSection } from "./sections/category-filter-section";
import { PriceFilterSection } from "./sections/price-filter-section";
import { RatingFilterSection } from "./sections/rating-filter-section";
import { SortFilterSection } from "./sections/sort-filter-section";
import { TagFilterSection } from "./sections/tag-filter-section";

interface FiltersPanelProps {
  className?: string;
}

export function FiltersPanel({ className }: FiltersPanelProps) {
  const filters = useStoreStore.use.filters();
  const resetFilters = useStoreStore.use.resetFilters();

  const hasActiveFilters = useMemo(() => {
    if (filters.category && filters.category !== "전체") return true;
    if (filters.priceRange) return true;
    if (filters.rating) return true;
    if (filters.tags && filters.tags.length > 0) return true;
    return false;
  }, [filters]);

  return (
    <Card className={cn("py-6 h-full gap-0", className)}>
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">필터</h3>
        </div>
        <SortFilterSection />
      </div>

      <div className="space-y-6 overflow-auto max-h-full flex flex-col pt-4 px-6">
        <CategoryFilterSection />
        <PriceFilterSection />
        <RatingFilterSection />
        <TagFilterSection />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => resetFilters()}>
            <X className="w-4 h-4 ml-auto" />
            필터 초기화
          </Button>
        )}
      </div>
    </Card>
  );
}
