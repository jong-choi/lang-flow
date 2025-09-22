"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (prompt: string) => Promise<void>;
}

export function PromptInputModal({
  open,
  onOpenChange,
  onSubmit,
}: PromptInputModalProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    void onSubmit(prompt.trim());
    setPrompt("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setPrompt("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>플로우 실행</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">프롬프트를 입력하세요</Label>
            <Textarea
              id="prompt"
              placeholder="예: 오늘 날씨에 대해 알려주세요"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit">실행하기</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
