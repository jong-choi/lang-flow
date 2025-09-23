import { Crown, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";

interface DetailHeaderProps {
  templateId: string;
}

export function DetailHeader({ templateId }: DetailHeaderProps) {
  const template = useTemplateById(templateId);

  if (!template) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">{template.category}</Badge>
            {template.isFeatured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Crown className="mr-1 h-3 w-3" />
                추천
              </Badge>
            )}
            {template.isPopular && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                인기
              </Badge>
            )}
          </div>
          <h1 className="mb-2 text-3xl font-bold">{template.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{template.rating}</span>
              <span>({template.reviewCount}개 리뷰)</span>
            </div>
            <span>•</span>
            <span>{template.createdAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-semibold">
            {template.price} 크레딧
          </Badge>
        </div>
      </div>
    </div>
  );
}
