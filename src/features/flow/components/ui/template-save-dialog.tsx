"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";
import type { TemplateActionState } from "@/features/flow/stores/slices/builder-ui-slice";
import {
  deserializeWorkflowDetail,
  serializeEdgeForApi,
  serializeNodeForApi,
  toWorkflowSummary,
} from "@/features/flow/utils/workflow-transformers";

const templateSchema = z.object({
  name: z.string().min(1, "템플릿 이름을 입력해주세요."),
  description: z.string().optional().nullable(),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

export const TemplateSaveDialog = () => {
  const router = useRouter();
  const workflowName = useFlowGeneratorStore.use.workflowName();
  const initialName = workflowName ?? "새 템플릿";
  const canvasNodes = useFlowGeneratorStore.use.canvasNodes();
  const canvasEdges = useFlowGeneratorStore.use.canvasEdges();
  const upsertTemplate = useFlowGeneratorStore.use.upsertTemplate();
  const cacheTemplateDetail = useFlowGeneratorStore.use.cacheTemplateDetail();
  const fetchTemplates = useFlowGeneratorStore.use.fetchTemplates();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialName,
      description: "",
    },
  });

  const isTemplateModalOpen = useFlowGeneratorStore.use.isTemplateModalOpen();
  const setTemplateModalOpen = useFlowGeneratorStore.use.setTemplateModalOpen();
  const isSavingTemplate = useFlowGeneratorStore.use.isSavingTemplate();

  const setIsSavingTemplate = useFlowGeneratorStore.use.setIsSavingTemplate();

  const navigationAfterSave = useFlowGeneratorStore.use.navigationAfterSave();
  const setNavigationAfterSave =
    useFlowGeneratorStore.use.setNavigationAfterSave();

  const navigateToTemplate = useCallback(
    (action: TemplateActionState) => {
      const search = new URLSearchParams({ action: action.action }).toString();
      router.push(`/flow/${action.template.id}${search ? `?${search}` : ""}`);
    },
    [router],
  );

  const handleTemplateSubmit = useCallback(
    async (values: TemplateFormValues) => {
      if (canvasNodes.length === 0) {
        toast.error("캔버스에 노드가 없습니다.");
        return;
      }

      setIsSavingTemplate(true);
      try {
        const response = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            description: values.description ?? null,
            nodes: canvasNodes.map(serializeNodeForApi),
            edges: canvasEdges.map(serializeEdgeForApi),
          }),
        });

        if (!response.ok) {
          toast.error("템플릿 저장에 실패했습니다.");
          return;
        }

        const payload = await response.json();
        const detail = deserializeWorkflowDetail(payload.workflow);
        cacheTemplateDetail(detail);
        upsertTemplate(toWorkflowSummary(payload.workflow));
        toast.success("템플릿이 저장되었습니다.");
        setTemplateModalOpen(false);
        void fetchTemplates();

        if (navigationAfterSave) {
          navigateToTemplate(navigationAfterSave);
          setNavigationAfterSave(null);
        }
      } catch (error) {
        console.error("템플릿 저장 실패", error);
        toast.error("템플릿 저장 중 오류가 발생했습니다.");
      } finally {
        setIsSavingTemplate(false);
      }
    },
    [
      cacheTemplateDetail,
      canvasEdges,
      canvasNodes,
      fetchTemplates,
      navigateToTemplate,
      navigationAfterSave,
      setIsSavingTemplate,
      setNavigationAfterSave,
      setTemplateModalOpen,
      upsertTemplate,
    ],
  );

  const open = isTemplateModalOpen;
  const onOpenChange = setTemplateModalOpen;
  const onSubmit = handleTemplateSubmit;
  const isSubmitting = isSavingTemplate;

  useEffect(() => {
    if (!open) return;
    form.reset({ name: initialName, description: "" });
  }, [form, initialName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>템플릿으로 저장</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="template-save-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => onSubmit(values))}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>템플릿 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="템플릿 이름" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="템플릿에 대한 설명을 입력하세요."
                      className="min-h-[120px]"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="template-save-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
