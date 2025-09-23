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
import { Textarea } from "@/components/ui/textarea";

const templateSchema = z.object({
  name: z.string().min(1, "템플릿 이름을 입력해주세요."),
  description: z.string().optional().nullable(),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TemplateFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialName?: string;
}

export const TemplateSaveDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialName = "새 템플릿",
}: TemplateSaveDialogProps) => {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialName,
      description: "",
    },
  });

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
