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
import type { NodeData } from "@/features/flow/types/nodes";

const AVAILABLE_MODELS = ["gemma-1b-it", "gemma-4b-it", "gemma-8b-it"] as const;

export const DEFAULT_MODEL = AVAILABLE_MODELS[0];

const editNodeSchema = z.object({
  label: z.string().min(1, "노드 이름을 입력해주세요."),
  prompt: z.string().optional(),
  model: z.string().optional(),
  template: z.string().optional(),
});

export type EditNodeFormValues = z.infer<typeof editNodeSchema>;

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeData: NodeData | null;
  onSubmit: (values: EditNodeFormValues) => void;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onOpenChange,
  nodeData,
  onSubmit,
}) => {
  const template =
    typeof nodeData?.template === "string" ? nodeData.template : undefined;
  const form = useForm<EditNodeFormValues>({
    resolver: zodResolver(editNodeSchema),
    defaultValues: {
      label: nodeData?.label ?? "",
      prompt: nodeData?.prompt ?? "",
      model: nodeData?.model ?? DEFAULT_MODEL,
      template,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      label: nodeData?.label ?? "",
      prompt: nodeData?.prompt ?? "",
      model: nodeData?.model ?? DEFAULT_MODEL,
      template,
    });
  }, [form, nodeData, open, template]);

  const isProcessingNode = false; // custom 노드 제거: 처리 전용 필드 비활성화

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      label: values.label,
      prompt: undefined,
      model: undefined,
      template: values.template,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>노드 편집</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="노드 이름" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isProcessingNode && (
              <>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>프롬프트</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="모델에게 전달할 프롬프트를 입력하세요."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모델</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="모델을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_MODELS.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
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
