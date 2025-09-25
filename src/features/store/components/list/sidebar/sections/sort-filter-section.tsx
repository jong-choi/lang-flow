import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import type { StoreSortOption } from "@/features/store/types";

const SORT_OPTIONS: Array<{ label: string; value: StoreSortOption }> = [
  { label: "인기순", value: "popular" },
  { label: "최신순", value: "newest" },
  { label: "가격 낮은순", value: "price-low" },
  { label: "가격 높은순", value: "price-high" },
  { label: "평점순", value: "rating" },
];

export function SortFilterSection() {
  const sortBy = useStoreStore.use.filters(
    (filters) => filters.sortBy ?? "popular",
  );
  const updateFilters = useStoreStore.use.updateFilters();

  const handleValueChange = (value: string) => {
    updateFilters({ sortBy: value as StoreSortOption });
  };

  return (
    <div className="flex justify-between p-1">
      <Select value={sortBy} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="정렬 선택" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
