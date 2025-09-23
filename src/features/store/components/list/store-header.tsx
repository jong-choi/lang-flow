"use client";

import { useMemo } from "react";
import { Filter, Grid, List, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { selectVisibleTemplates } from "@/features/store/stores/slices/filters-slice";

export function StoreHeader() {
  const searchQuery = useStoreStore.use.searchQuery();
  const setSearchQuery = useStoreStore.use.setSearchQuery();
  const viewMode = useStoreStore.use.viewMode();
  const setViewMode = useStoreStore.use.setViewMode();
  const toggleFilters = useStoreStore.use.toggleFilters();
  const filtersVisible = useStoreStore.use.showFilters();
  const templates = useStoreStore.use.templates();
  const filters = useStoreStore.use.filters();

  const resultsCount = useMemo(
    () => selectVisibleTemplates(templates, filters, searchQuery).length,
    [filters, searchQuery, templates],
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          워크플로우 템플릿 스토어
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          전문가들이 만든 검증된 워크플로우 템플릿을 구매하고, 업무 효율성을
          즉시 향상시켜보세요.
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="워크플로우 템플릿 검색..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {resultsCount}개의 템플릿
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFilters()}
            className="hidden md:inline-flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {filtersVisible ? "필터 숨기기" : "필터 보기"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
