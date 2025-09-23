"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { NodeData } from "@/features/flow/types/nodes";

const DEFAULT_MESSAGE_TEMPLATE = "기본 메시지: {input}";

export interface NodeEditFormValues {
  label: string;
  template?: string;
}

const createEditNodeSchema = (isMessageNode: boolean) =>
  z
    .object({
      label: z.string().min(1, "노드 이름을 입력해주세요."),
      template: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (!isMessageNode) {
        return;
      }

      if (!values.template || values.template.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["template"],
          message: "메시지 템플릿을 입력해주세요.",
        });
      }
    });

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeData: NodeData | null;
  onSubmit: (values: NodeEditFormValues) => void;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onOpenChange,
  nodeData,
  onSubmit,
}) => {
  const isMessageNode = nodeData?.nodeType === "messageNode";
  const schema = useMemo(
    () => createEditNodeSchema(isMessageNode),
    [isMessageNode],
  );

  const template =
    typeof nodeData?.template === "string"
      ? nodeData.template
      : isMessageNode
        ? DEFAULT_MESSAGE_TEMPLATE
        : undefined;

  const form = useForm<NodeEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: nodeData?.label ?? "",
      template,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      label: nodeData?.label ?? "",
      template,
    });
  }, [form, nodeData, open, template]);

  const handleSubmit = form.handleSubmit((values) => {
    const trimmedTemplate = values.template?.trim();
    onSubmit({
      label: values.label,
      template: isMessageNode ? trimmedTemplate : undefined,
    });
  });

  const dialogTitle = isMessageNode ? "메시지 노드 편집" : "노드 편집";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMessageNode ? "max-w-md" : undefined}>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>노드 이름</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="노드 이름" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isMessageNode && (
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>메시지 템플릿</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="메시지 템플릿을 입력해주세요"
                        className="min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      <span className="block space-y-1">
                        <span className="block font-medium">
                          템플릿 사용법:
                        </span>
                        <span className="block">
                          •{" "}
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {"{input}"}
                          </code>
                          을 사용하면 이전 노드의 출력 내용으로 자동 치환됩니다
                        </span>
                        <span className="block">
                          • 예시 - 질문: {"{input}"} 답변을 요약해줘
                        </span>
                        <span className="block">
                          • 여러 개의{" "}
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {"{input}"}
                          </code>
                          을 사용할 수 있습니다
                        </span>
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                저장
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

EditDialog.displayName = "EditDialog";
