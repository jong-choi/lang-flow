import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStoreStore } from "@/features/store/providers/store-store-provider";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";

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
          className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
          onClick={handleNavigate}
        >
          <span className="text-xl font-bold text-gray-400">
            {template.title.charAt(0)}
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <button
                type="button"
                className="font-semibold text-lg mb-1 text-left hover:text-primary"
                onClick={handleNavigate}
              >
                {template.title}
              </button>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {template.description}
              </p>
              <div className="flex items-center gap-2 mb-2">
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
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
