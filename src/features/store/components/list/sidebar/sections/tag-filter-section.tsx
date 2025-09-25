import { Tag } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { popularTags } from "@/features/store/mock-data";
import { useStoreStore } from "@/features/store/providers/store-store-provider";

export function TagFilterSection() {
  const selectedTags = useStoreStore.use.filters(
    useShallow((filters) => filters.tags ?? []),
  );
  const updateFilters = useStoreStore.use.updateFilters();

  const handleTagClick = (tag: string) => {
    const hasTag = selectedTags.includes(tag);
    const nextTags = hasTag
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];
    updateFilters({ tags: nextTags.length > 0 ? nextTags : undefined });
  };

  return (
    <div>
      <Label className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Tag className="h-4 w-4" />
        인기 태그
      </Label>
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
