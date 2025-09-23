import { Label } from "@/components/ui/label";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { cn } from "@/utils/cn";

const PRICE_RANGES = [
  { label: "전체", value: undefined },
  { label: "무료 (0 크레딧)", value: { min: 0, max: 0 } },
  { label: "저가 (1-3 크레딧)", value: { min: 1, max: 3 } },
  { label: "중가 (4-6 크레딧)", value: { min: 4, max: 6 } },
  { label: "고가 (7-10 크레딧)", value: { min: 7, max: 10 } },
] as const;

export function PriceFilterSection() {
  const priceRange = useStoreStore.use.filters((filters) => filters.priceRange);
  const updateFilters = useStoreStore.use.updateFilters();

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">가격 범위</Label>
      <div className="space-y-2">
        {PRICE_RANGES.map((range, index) => (
          <button
            key={index}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              (priceRange?.min === range.value?.min &&
                priceRange?.max === range.value?.max) ||
                (!priceRange && !range.value)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
            onClick={() => updateFilters({ priceRange: range.value })}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
