"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StoreFilters } from "@/features/store/components/store-filters";
import { StoreHeader } from "@/features/store/components/store-header";
import { TemplateCard } from "@/features/store/components/template-card";
import { useCart } from "@/features/store/hooks/use-cart";
import { useStoreFilters } from "@/features/store/hooks/use-store-filters";
import type { WorkflowTemplate } from "@/types/store";
import { cn } from "@/utils/cn";

interface StoreMainProps {
  onTemplateSelect: (template: WorkflowTemplate) => void;
  onTemplatePurchase: (template: WorkflowTemplate) => void;
}

export function StoreMain({
  onTemplateSelect,
  onTemplatePurchase,
}: StoreMainProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);

  const { filters, filteredTemplates, updateFilters, resetFilters } =
    useStoreFilters();
  const { addToCart, isInCart } = useCart();

  // 검색 기능
  const searchedTemplates = filteredTemplates.filter(
    (template) =>
      searchQuery === "" ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddToCart = (template: WorkflowTemplate) => {
    const result = addToCart(template);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="container mx-auto px-4 h-full flex gap-6">
        {/* 사이드바 - 고정 너비 */}
        <div className="w-80 flex-shrink-0">
          <StoreFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            className="sticky top-0 self-start h-full overflow-hidden"
          />
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex-1 min-w-0 overflow-auto py-8">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <StoreHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultsCount={searchedTemplates.length}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
            />
          </div>

          {/* 컨텐츠 섹션 */}
          <div>
            {searchedTemplates.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-muted-foreground">
                  다른 검색어나 필터를 사용해보세요.
                </p>
              </div>
            ) : (
              <div
                className={cn(
                  "transition-all duration-300",
                  viewMode === "grid"
                    ? "grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4",
                )}
              >
                {searchedTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPurchase={onTemplatePurchase}
                    onViewDetails={onTemplateSelect}
                    onAddToCart={handleAddToCart}
                    isInCart={isInCart(template.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
