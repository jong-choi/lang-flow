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
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="container mx-auto px-4 h-full flex gap-6">
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <FiltersPanel className="sticky top-0 self-start h-full overflow-hidden" />
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-auto py-8">
          <div className="mb-8">
            <StoreHeader />
          </div>

          <div>
            {templateIds.length === 0 ? (
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
