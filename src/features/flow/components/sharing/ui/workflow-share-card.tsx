import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkflowShareSummary } from "@/features/flow/types/workflow-sharing";

const formatCredits = (value: number) => {
  if (!value) return "무료";
  return `${value.toLocaleString()} 크레딧`;
};

export interface WorkflowShareCardProps {
  share: WorkflowShareSummary;
  onDetail?: (share: WorkflowShareSummary) => void;
  onActivate?: (share: WorkflowShareSummary) => void;
  isOwner?: boolean;
}

export function WorkflowShareCard({
  share,
  onDetail,
  onActivate,
  isOwner = false,
}: WorkflowShareCardProps) {
  const handleDetail = () => {
    if (onDetail) onDetail(share);
  };

  const handleActivate = () => {
    if (onActivate) onActivate(share);
  };

  const ownerInitial = share.owner.name?.charAt(0) ?? "";

  return (
    <Card className="h-full justify-between">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg font-semibold">
              {share.workflowName}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {share.summary || "소개 내용이 아직 작성되지 않았습니다."}
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            {isOwner ? <Badge variant="outline">내 워크플로우</Badge> : null}
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {share.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {share.tags.map((tag) => (
              <Badge key={`${share.shareId}-${tag}`} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCredits(share.priceInCredits)}</span>
          <span>{`사용자수 ${share.userCount}명`}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t pt-6">
        <div className="flex items-center gap-3">
          {share.owner.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={share.owner.image}
              alt={share.owner.name ?? share.owner.id}
              className="size-10 rounded-full border object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div
              className="flex size-10 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-muted-foreground uppercase"
              aria-hidden="true"
            >
              {ownerInitial || "?"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {share.owner.name ?? "이름 미정"}
            </span>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {share.workflowDescription ?? "설명이 없습니다."}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={handleDetail}>
            자세히 보기
          </Button>
          {!isOwner && onActivate ? (
            <Button onClick={handleActivate}>활성화 하기</Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
