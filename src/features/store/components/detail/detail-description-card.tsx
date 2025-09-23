import { Card } from "@/components/ui/card";
import { useTemplateById } from "@/features/store/hooks/use-template-by-id";

interface DetailDescriptionCardProps {
  templateId: string;
}

export function DetailDescriptionCard({
  templateId,
}: DetailDescriptionCardProps) {
  const template = useTemplateById(templateId);

  if (!template) {
    return null;
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">템플릿 설명</h2>
        <p className="text-muted-foreground leading-relaxed">
          {template.description}
        </p>
      </div>

      <div>
        <h3 className="font-medium mb-3">주요 기능:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 자동화된 워크플로우 실행</li>
          <li>• 실시간 모니터링 및 알림</li>
          <li>• 커스터마이징 가능한 설정</li>
          <li>• 상세한 실행 로그 제공</li>
          <li>• API 연동 지원</li>
        </ul>
      </div>
    </Card>
  );
}
