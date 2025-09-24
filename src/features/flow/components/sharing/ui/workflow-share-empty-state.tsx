import { Button } from "@/components/ui/button";

export interface WorkflowShareEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function WorkflowShareEmptyState({
  title = "공유된 워크플로우가 없습니다.",
  description = "새로운 워크플로우를 등록해보세요.",
  actionLabel = "워크플로우 등록하기",
  onAction,
}: WorkflowShareEmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/30 p-10 text-center">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}

