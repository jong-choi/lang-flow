"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  type WorkflowLicenseRequest,
  type WorkflowLicenseRequestFormValues,
  workflowLicenseRequestSchema,
} from "@/features/flow/types/workflow-sharing";
import { api } from "@/lib/api-client";

interface WorkflowLicenseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  workflowTitle: string;
  onSuccess?: (license: WorkflowLicenseRequest) => void;
}

interface LicenseRequestResponse {
  license: WorkflowLicenseRequest;
}

export function WorkflowLicenseRequestDialog({
  open,
  onOpenChange,
  workflowId,
  workflowTitle,
  onSuccess,
}: WorkflowLicenseRequestDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<WorkflowLicenseRequestFormValues>({
    resolver: zodResolver(workflowLicenseRequestSchema),
    defaultValues: {
      message: "해당 워크플로우를 사용하고 싶습니다.",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      const response = await api.post<LicenseRequestResponse>(
        `/api/flow/sharing/${workflowId}`,
        values,
      );
      toast.success("라이선스 요청을 전송했습니다.");
      onSuccess?.(response.license);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "라이선스 요청에 실패했습니다.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>라이선스 요청</DialogTitle>
          <DialogDescription>
            {workflowTitle} 워크플로우 사용을 요청합니다.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="workflow-license-request"
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요청 메세지</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="사용 목적이나 필요한 이유를 작성해주세요"
                      className="min-h-[140px]"
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
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="workflow-license-request"
            disabled={submitting}
          >
            {submitting ? "전송 중..." : "요청 보내기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
