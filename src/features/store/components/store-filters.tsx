import { Filter, Star, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { categories, popularTags } from "@/features/store/mock-data";
import type { StoreFilters } from "@/types/store";
import { cn } from "@/utils/cn";

interface StoreFiltersProps {
  filters: StoreFilters;
  onFiltersChange: (filters: Partial<StoreFilters>) => void;
  onReset: () => void;
  className?: string;
}

export function StoreFilters({
  filters,
  onFiltersChange,
  onReset,
  className,
}: StoreFiltersProps) {
  const priceRanges = [
    { label: "전체", value: undefined },
    { label: "무료 (0 크레딧)", value: { min: 0, max: 0 } },
    { label: "저가 (1-3 크레딧)", value: { min: 1, max: 3 } },
    { label: "중가 (4-6 크레딧)", value: { min: 4, max: 6 } },
    { label: "고가 (7-10 크레딧)", value: { min: 7, max: 10 } },
  ];

  const ratingOptions = [
    { label: "전체", value: undefined },
    { label: "4.5점 이상", value: 4.5 },
    { label: "4.0점 이상", value: 4.0 },
    { label: "3.5점 이상", value: 3.5 },
    { label: "3.0점 이상", value: 3.0 },
  ];

  const sortOptions = [
    { label: "인기순", value: "popular" as const },
    { label: "최신순", value: "newest" as const },
    { label: "가격 낮은순", value: "price-low" as const },
    { label: "가격 높은순", value: "price-high" as const },
    { label: "평점순", value: "rating" as const },
  ];

  const hasActiveFilters =
    filters.category !== "전체" ||
    filters.priceRange !== undefined ||
    filters.rating !== undefined ||
    (filters.tags && filters.tags.length > 0);

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({ tags: newTags.length > 0 ? newTags : undefined });
  };

  return (
    <Card className={cn("p-6 h-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">필터</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="w-4 h-4 mr-1" />
            초기화
          </Button>
        )}
      </div>
      {/* 스크롤될 영역: 부모(Card)에서 고정 높이를 받으므로 여기만 스크롤합니다 */}
      <div className="space-y-6 overflow-auto max-h-full pr-2">
        {/* 정렬 */}
        <div>
          <Label className="text-sm font-medium mb-3 block">정렬</Label>
          <Select
            value={filters.sortBy || "popular"}
            onValueChange={(value) =>
              onFiltersChange({ sortBy: value as StoreFilters["sortBy"] })
            }
          >
            <option value="">정렬 선택</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* 카테고리 */}
        <div>
          <Label className="text-sm font-medium mb-3 block">카테고리</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  filters.category === category ||
                    (category === "전체" && !filters.category)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
                onClick={() =>
                  onFiltersChange({
                    category: category === "전체" ? undefined : category,
                  })
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 가격 범위 */}
        <div>
          <Label className="text-sm font-medium mb-3 block">가격 범위</Label>
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <button
                key={index}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  (filters.priceRange?.min === range.value?.min &&
                    filters.priceRange?.max === range.value?.max) ||
                    (!filters.priceRange && !range.value)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
                onClick={() => onFiltersChange({ priceRange: range.value })}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* 평점 */}
        <div>
          <Label className="text-sm font-medium mb-3 block">평점</Label>
          <div className="space-y-2">
            {ratingOptions.map((option, index) => (
              <button
                key={index}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                  filters.rating === option.value ||
                    (!filters.rating && !option.value)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
                onClick={() => onFiltersChange({ rating: option.value })}
              >
                <Star className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 태그 */}
        <div>
          <Label className="text-sm font-medium mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            인기 태그
          </Label>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags?.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
