"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PromptInputModal } from "@/features/flow/components/prompt-input-modal";

interface RunControlsProps {
  canStart: boolean;
  isRunning: boolean;
  failedCount: number;
  tooltip?: string | null;
  onStart: (prompt: string) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onRetry: () => void | Promise<void>;
}

export function RunControls({
  canStart,
  isRunning,
  failedCount,
  tooltip,
  onStart,
  onCancel,
  onRetry,
}: RunControlsProps) {
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleStartClick = () => {
    setShowPromptModal(true);
  };

  const handlePromptSubmit = async (prompt: string) => {
    await onStart(prompt);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleStartClick}
          disabled={!canStart || isRunning}
          title={tooltip ?? undefined}
        >
          {isRunning ? "실행 중..." : "시작하기"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={!isRunning}>
          중단
        </Button>
        <button
          className="px-3 h-9 rounded-md bg-secondary text-secondary-foreground disabled:opacity-50"
          onClick={onRetry}
          disabled={isRunning || failedCount === 0}
          title={
            failedCount > 0 ? `${failedCount}개 재시도` : "재시도할 항목 없음"
          }
        >
          재시도
        </button>
      </div>

      <PromptInputModal
        open={showPromptModal}
        onOpenChange={setShowPromptModal}
        onSubmit={handlePromptSubmit}
      />
    </>
  );
}
