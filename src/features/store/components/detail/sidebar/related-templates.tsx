import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";
import { useStoreStore } from "@/features/store/providers/store-store-provider";

interface RelatedTemplatesProps {
  templateId: string;
}

export function RelatedTemplates({ templateId }: RelatedTemplatesProps) {
  const template = useTemplateById(templateId);
  const templates = useStoreStore.use.templates();
  const relatedTemplates = useMemo(() => {
    if (!template) {
      return [];
    }

    return templates
      .filter(
        (item) => item.id !== templateId && item.category === template.category,
      )
      .slice(0, 3);
  }, [template, templates, templateId]);

  if (!template || relatedTemplates.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold">관련 템플릿</h3>
      <div className="space-y-3">
        {relatedTemplates.map((item) => (
          <div
            key={item.id}
            className="flex cursor-pointer gap-3 rounded-lg p-3 hover:bg-muted"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-semibold text-gray-500">
              {item.title.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.price} 크레딧 · 평점 {item.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
