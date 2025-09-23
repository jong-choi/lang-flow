"use client";

import { useMemo } from "react";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { selectVisibleTemplates } from "@/features/store/stores/slices/filters-slice";
import { cn } from "@/utils/cn";
import { FiltersPanel } from "./sidebar/filters-panel";
import { StoreHeader } from "./store-header";
import { TemplateCard } from "./template-card";

export function StoreMain() {
  const showFilters = useStoreStore.use.showFilters();
  const viewMode = useStoreStore.use.viewMode();
  const templates = useStoreStore.use.templates();
  const filters = useStoreStore.use.filters();
  const searchQuery = useStoreStore.use.searchQuery();

  const visibleTemplates = useMemo(
    () => selectVisibleTemplates(templates, filters, searchQuery),
    [filters, searchQuery, templates],
  );

  const templateIds = useMemo(
    () => visibleTemplates.map((template) => template.id),
    [visibleTemplates],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="container mx-auto flex h-full gap-6 px-4">
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <FiltersPanel className="sticky top-0 h-full self-start overflow-hidden" />
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-auto py-8">
          <div className="mb-8">
            <StoreHeader />
          </div>

          <div>
            {templateIds.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-xl font-semibold">
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
                    ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4",
                )}
              >
                {templateIds.map((templateId) => (
                  <TemplateCard key={templateId} templateId={templateId} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
