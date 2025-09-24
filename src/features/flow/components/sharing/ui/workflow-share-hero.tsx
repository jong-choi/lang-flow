import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { WorkflowShareDetail } from "@/features/flow/types/workflow-sharing";

const formatCredits = (value: number) => {
  if (!value) return "무료";
  return `${value.toLocaleString()} 크레딧`;
};

export interface WorkflowShareHeroProps {
  share: WorkflowShareDetail;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function WorkflowShareHero({
  share,
  primaryAction,
  secondaryAction,
}: WorkflowShareHeroProps) {
  return (
    <section className="rounded-3xl border bg-background p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">라이선스 {share.licenseCount}건</Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {share.workflowName}
            </h1>
            <p className="text-base text-muted-foreground">
              {share.summary || "소개 내용이 아직 등록되지 않았습니다."}
            </p>
            <p className="text-sm text-muted-foreground">
              {share.workflowDescription ?? "워크플로우 설명이 아직 작성되지 않았습니다."}
            </p>
          </div>
          {share.tags.length ? (
            <div className="flex flex-wrap gap-2">
              {share.tags.map((tag) => (
                <Badge key={`${share.shareId}-${tag}`} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex w-full max-w-xs flex-col gap-4 rounded-2xl border bg-muted/10 p-6">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">가격</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCredits(share.priceInCredits)}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>워크플로우 실행에 필요한 크레딧입니다.</span>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            {primaryAction}
            {secondaryAction}
          </div>
        </div>
      </div>
    </section>
  );
}
