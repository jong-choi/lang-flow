"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TemplateDeleteButton } from "@/features/flow/components/section/header/ui/template-delete-button";
import { TemplateSaveButton } from "@/features/flow/components/section/header/ui/template-save-button";
import { TemplateUpdateButton } from "@/features/flow/components/section/header/ui/template-update-button";

interface WorkflowMeta {
  isOwner: boolean;
  isLicensed: boolean;
}

export const HeaderActions = () => {
  const params = useParams<Record<string, string | string[]>>();
  const workflowIdParam = params?.workflowId;
  const workflowId = Array.isArray(workflowIdParam)
    ? workflowIdParam[0]
    : workflowIdParam ?? null;

  const [meta, setMeta] = useState<WorkflowMeta | null>(null);
  const [isMetaLoading, setIsMetaLoading] = useState(Boolean(workflowId));

  useEffect(() => {
    if (!workflowId) {
      setMeta(null);
      setIsMetaLoading(false);
      return;
    }

    let cancelled = false;
    const fetchMeta = async () => {
      setIsMetaLoading(true);
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (!response.ok) {
          if (!cancelled) {
            setMeta(null);
          }
          return;
        }

        const payload = await response.json();
        if (cancelled) return;

        const nextMeta: WorkflowMeta = {
          isOwner: Boolean(payload.workflow?.isOwner),
          isLicensed: Boolean(payload.workflow?.isLicensed),
        };
        setMeta(nextMeta);
      } catch (error) {
        console.error("워크플로우 메타데이터 조회 실패", error);
        if (!cancelled) {
          setMeta(null);
        }
      } finally {
        if (!cancelled) {
          setIsMetaLoading(false);
        }
      }
    };

    void fetchMeta();

    return () => {
      cancelled = true;
    };
  }, [workflowId]);

  const isExistingWorkflow = Boolean(workflowId);
  const isOwner = Boolean(meta?.isOwner);
  const showOwnerActions = isExistingWorkflow && (isMetaLoading || isOwner);

  return (
    <div className="flex items-center gap-3">
      {!isExistingWorkflow ? <TemplateSaveButton label="저장" /> : null}
      {showOwnerActions ? (
        <>
          <TemplateUpdateButton
            workflowId={workflowId}
            disabled={isMetaLoading}
          />
          <TemplateDeleteButton
            workflowId={workflowId}
            disabled={isMetaLoading}
          />
        </>
      ) : null}
      {isExistingWorkflow ? (
        <TemplateSaveButton label="다른 이름으로 저장" />
      ) : null}
    </div>
  );
};
