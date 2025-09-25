import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";

interface DetailAuthorCardProps {
  templateId: string;
}

export function DetailAuthorCard({ templateId }: DetailAuthorCardProps) {
  const template = useTemplateById(templateId);

  if (!template) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">작성자</h2>
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          {template.author.avatar ? (
            <Image
              src={template.author.avatar}
              alt={template.author.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              {template.author.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{template.author.name}</h3>
          <p className="text-sm text-muted-foreground">워크플로우 전문가</p>
          <Button variant="outline" size="sm" className="mt-2">
            다른 템플릿 보기
          </Button>
        </div>
      </div>
    </Card>
  );
}
