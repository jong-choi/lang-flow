"use client";

import { useEffect } from "react";
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

const messageNodeSchema = z.object({
  label: z.string().min(1, "노드 이름을 입력해주세요."),
  template: z.string().min(1, "메시지 템플릿을 입력해주세요."),
});

export type MessageNodeFormValues = z.infer<typeof messageNodeSchema>;

interface MessageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeData: NodeData | null;
  onSubmit: (values: MessageNodeFormValues) => void;
}

export const MessageEditDialog: React.FC<MessageEditDialogProps> = ({
  open,
  onOpenChange,
  nodeData,
  onSubmit,
}) => {
  const form = useForm<MessageNodeFormValues>({
    resolver: zodResolver(messageNodeSchema),
    defaultValues: {
      label: nodeData?.label ?? "메시지 노드",
      template: (nodeData?.template as string) ?? "기본 메시지: {input}",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      label: nodeData?.label ?? "메시지 노드",
      template: (nodeData?.template as string) ?? "기본 메시지: {input}",
    });
  }, [form, nodeData, open]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>메시지 노드 편집</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>노드 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="노드 이름을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메시지 템플릿</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="메시지 템플릿을 입력해주세요"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-muted-foreground">
                    <span className="space-y-1 block">
                      <span className="font-medium block">템플릿 사용법:</span>
                      <span className="block">
                        •{" "}
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          {"{input}"}
                        </code>
                        을 사용하면 이전 노드의 출력 내용으로 자동 치환됩니다
                      </span>
                      <span className="block">
                        • 예시 - 질문: {"{input}"} 답변을 요약해줘
                      </span>
                      <span className="block">
                        • 여러 개의{" "}
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
