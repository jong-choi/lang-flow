import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { cn } from "@/utils/cn";

const RATING_OPTIONS = [
  { label: "전체", value: undefined },
  { label: "4.5점 이상", value: 4.5 },
  { label: "4.0점 이상", value: 4.0 },
  { label: "3.5점 이상", value: 3.5 },
  { label: "3.0점 이상", value: 3.0 },
] as const;

export function RatingFilterSection() {
  const rating = useStoreStore.use.filters((filters) => filters.rating);
  const updateFilters = useStoreStore.use.updateFilters();

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">평점</Label>
      <div className="space-y-2">
        {RATING_OPTIONS.map((option, index) => (
          <button
            key={index}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
              rating === option.value || (!rating && !option.value)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
            onClick={() => updateFilters({ rating: option.value })}
          >
            <Star className="w-4 h-4" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
