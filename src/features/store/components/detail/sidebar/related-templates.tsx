import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";

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
      .filter((item) => item.id !== templateId && item.category === template.category)
      .slice(0, 3);
  }, [template, templates, templateId]);

  if (!template || relatedTemplates.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">관련 템플릿</h3>
      <div className="space-y-3">
        {relatedTemplates.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex-shrink-0 flex items-center justify-center text-sm font-semibold text-gray-500">
              {item.title.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.title}</p>
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
