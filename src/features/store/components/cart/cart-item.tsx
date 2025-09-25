import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";
import { useStoreStore } from "@/features/store/providers/store-store-provider";

interface CartItemProps {
  templateId: string;
}

export function CartItem({ templateId }: CartItemProps) {
  const router = useRouter();
  const template = useTemplateById(templateId);
  const removeFromCart = useStoreStore.use.removeFromCart();
  const setSelectedTemplateId = useStoreStore.use.setSelectedTemplateId();

  if (!template) {
    return null;
  }

  const handleRemove = () => removeFromCart(templateId);

  const handleNavigate = () => {
    setSelectedTemplateId(templateId);
    router.push(`/store/${templateId}`);
  };

  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <button
          type="button"
          className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100"
          onClick={handleNavigate}
        >
          <span className="text-xl font-bold text-gray-400">
            {template.title.charAt(0)}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <button
                type="button"
                className="mb-1 text-left text-lg font-semibold hover:text-primary"
                onClick={handleNavigate}
              >
                {template.title}
              </button>
              <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                {template.description}
              </p>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  작성자: {template.author.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {template.price} 크레딧
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
