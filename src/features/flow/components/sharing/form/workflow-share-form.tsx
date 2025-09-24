"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import type { WorkflowShareFormSchema } from "@/features/flow/utils/workflow-sharing-schemas";
import { workflowShareFormSchema } from "@/features/flow/utils/workflow-sharing-schemas";

export interface ShareableWorkflowOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface WorkflowShareFormProps {
  formId?: string;
  defaultValues?: Partial<WorkflowShareFormSchema>;
  workflow: ShareableWorkflowOption;
  isSubmitting?: boolean;
  onSubmit: (values: WorkflowShareFormSchema) => Promise<void> | void;
  onCancel?: () => void;
  onBack?: () => void;
}

const renderStringList = (value: unknown): string => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

export function WorkflowShareForm({
  formId = "workflow-share-form",
  defaultValues,
  workflow,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onBack,
}: WorkflowShareFormProps) {
  const form = useForm<WorkflowShareFormSchema>({
    resolver: zodResolver(workflowShareFormSchema),
    defaultValues: {
      workflowId: workflow.id,
      summary: defaultValues?.summary ?? "",
      tags: defaultValues?.tags ?? [],
      priceInCredits: defaultValues?.priceInCredits ?? 0,
    },
  });

  useEffect(() => {
    form.reset({
      workflowId: workflow.id,
      summary: defaultValues?.summary ?? "",
      tags: defaultValues?.tags ?? [],
      priceInCredits: defaultValues?.priceInCredits ?? 0,
    });
  }, [workflow, defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
        <input type="hidden" value={workflow.id} {...form.register("workflowId")} />
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">선택한 워크플로우</p>
          <div className="rounded-xl border bg-muted/20 p-4">
            <h3 className="text-base font-semibold text-foreground">{workflow.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
              {workflow.description ?? "워크플로우 설명이 없습니다."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {onBack ? (
            <Button type="button" variant="ghost" onClick={onBack}>
              이전 단계
            </Button>
          ) : <span />}
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              취소
            </Button>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>한 줄 소개</FormLabel>
              <FormControl>
                <Input
                  placeholder="사용자가 한 눈에 이해할 수 있도록 요약해주세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>태그</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="쉼표 또는 줄바꿈으로 태그를 구분하세요"
                  value={renderStringList(field.value)}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceInCredits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>가격 (크레딧)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={field.value ?? 0}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
