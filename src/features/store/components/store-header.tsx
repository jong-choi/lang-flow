import { Grid, List, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  resultsCount: number;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export function StoreHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  resultsCount,
}: StoreHeaderProps) {
  return (
    <div className="space-y-6">
      {/* 메인 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          워크플로우 템플릿 스토어
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          전문가들이 만든 검증된 워크플로우 템플릿을 구매하고, 업무 효율성을
          즉시 향상시켜보세요.
        </p>
      </div>

      {/* 검색바 */}
      <div className="relative max-w-2xl mx-auto w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="워크플로우 템플릿 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {resultsCount}개의 템플릿
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
