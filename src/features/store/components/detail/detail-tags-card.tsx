import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";

interface DetailTagsCardProps {
  templateId: string;
}

export function DetailTagsCard({ templateId }: DetailTagsCardProps) {
  const template = useTemplateById(templateId);

  if (!template) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">태그</h2>
      <div className="flex flex-wrap gap-2">
        {template.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-3 py-1">
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
