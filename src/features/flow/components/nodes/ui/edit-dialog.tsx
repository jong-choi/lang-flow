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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CHAT_MODELS,
  CHAT_MODEL_VALUES,
  DEFAULT_CHAT_MODEL,
} from "@/features/flow/constants/chat-models";
import type { NodeData } from "@/features/flow/types/graph";

const DEFAULT_MESSAGE_TEMPLATE = "기본 메시지: {input}";

export interface NodeEditFormValues {
  label: string;
  template?: string;
  model?: string;
}

const createEditNodeSchema = (isMessageNode: boolean, isChatNode: boolean) =>
  z
    .object({
      label: z.string().min(1, "노드 이름을 입력해주세요."),
      template: z.string().optional(),
      model: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (isMessageNode) {
        if (!values.template || values.template.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["template"],
            message: "메시지 템플릿을 입력해주세요.",
          });
        }
      }

      if (isChatNode) {
        const model = values.model?.trim();
        if (!model) {
          ctx.addIssue({
            code: "custom",
            path: ["model"],
            message: "모델을 선택해주세요.",
          });
          return;
        }

        if (!CHAT_MODEL_VALUES.includes(model)) {
          ctx.addIssue({
            code: "custom",
            path: ["model"],
            message: "유효하지 않은 모델입니다.",
          });
        }
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
  const isChatNode = nodeData?.nodeType === "chatNode";
  const schema = useMemo(
    () => createEditNodeSchema(isMessageNode, isChatNode),
    [isMessageNode, isChatNode],
  );

  const template =
    typeof nodeData?.template === "string"
      ? nodeData.template
      : isMessageNode
        ? DEFAULT_MESSAGE_TEMPLATE
        : undefined;

  const model =
    isChatNode && typeof nodeData?.model === "string" && nodeData.model.length > 0
      ? nodeData.model
      : isChatNode
        ? DEFAULT_CHAT_MODEL
        : undefined;

  const form = useForm<NodeEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: nodeData?.label ?? "",
      template,
      model,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      label: nodeData?.label ?? "",
      template,
      model,
    });
  }, [form, model, nodeData, open, template]);

  const handleSubmit = form.handleSubmit((values) => {
    const trimmedTemplate = values.template?.trim();
    const selectedModel = values.model?.trim();
    onSubmit({
      label: values.label,
      template: isMessageNode ? trimmedTemplate : undefined,
      model:
        isChatNode && selectedModel && CHAT_MODEL_VALUES.includes(selectedModel)
          ? selectedModel
          : undefined,
    });
  });

  const dialogTitle = isMessageNode ? "메시지 노드 편집" : "노드 편집";
  const isCompactDialog = isMessageNode || isChatNode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isCompactDialog ? "max-w-md" : undefined}>
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
            {isChatNode && (
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용 모델</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full justify-between">
                          <SelectValue placeholder="모델 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHAT_MODELS.map((chatModel) => (
                            <SelectItem
                              key={chatModel.value}
                              value={chatModel.value}
                            >
                              {chatModel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
