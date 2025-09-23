import { Label } from "@/components/ui/label";
import { categories } from "@/features/store/mock-data";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { cn } from "@/utils/cn";

export function CategoryFilterSection() {
  const category = useStoreStore.use.filters((filters) => filters.category);
  const updateFilters = useStoreStore.use.updateFilters();

  return (
    <div>
      <Label className="text-sm font-medium mb-3 block">카테고리</Label>
      <div className="space-y-2">
        {categories.map((item) => (
          <button
            key={item}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              category === item || (item === "전체" && !category)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
            onClick={() =>
              updateFilters({
                category: item === "전체" ? undefined : item,
              })
            }
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
