"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

interface TemplateDeleteButtonProps {
  workflowId: string;
  disabled?: boolean;
}

export const TemplateDeleteButton = ({
  workflowId,
  disabled: disabledProp = false,
}: TemplateDeleteButtonProps) => {
  const removeTemplate = useFlowGeneratorStore.use.removeTemplate();
  const fetchTemplates = useFlowGeneratorStore.use.fetchTemplates();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const disabled = disabledProp || isDeleting;

  const handleDelete = useCallback(async () => {
    if (disabled) return;
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("워크플로우를 삭제할까요?");
      if (!confirmed) return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        toast.error(payload?.message ?? "워크플로우 삭제에 실패했습니다.");
        return;
      }

      removeTemplate(workflowId);
      void fetchTemplates();
      toast.success("워크플로우가 삭제되었습니다.");
      router.push("/flow/generate");
    } catch (error) {
      console.error("워크플로우 삭제 실패", error);
      toast.error("워크플로우 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }, [disabled, fetchTemplates, removeTemplate, router, workflowId]);

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-2 rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      data-testid="delete-btn"
      disabled={disabled}
    >
      {isDeleting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      삭제
    </button>
  );
};
