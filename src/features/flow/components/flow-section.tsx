"use client";

import { useCallback, useState } from "react";
import { GitBranch, MessageSquare, Play, RotateCw, Square } from "lucide-react";
import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/features/flow/components/flow-canvas";
import { PromptInputModal } from "@/features/flow/components/prompt-input-modal";
import { Sidebar } from "@/features/flow/components/sidebar";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

const PlayIcon = <Play className="size-4" />;
const SquareIcon = <Square className="size-4" />;
const RotateCwIcon = <RotateCw className="size-4" />;
const GitBranchIcon = <GitBranch className="size-4" />;
const MessageSquareIcon = <MessageSquare className="size-4" />;

export const FlowSection = () => {
  const [activeTab, setActiveTab] = useState<"graph" | "results">("graph");
  const [showPromptModal, setShowPromptModal] = useState(false);
  const isRunning = useFlowGeneratorStore.use.isRunning();
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const canRetry = useFlowGeneratorStore.use.canRetry();
  const requestRun = useFlowGeneratorStore.use.requestRun();
  const requestCancel = useFlowGeneratorStore.use.requestCancel();
  const requestRetry = useFlowGeneratorStore.use.requestRetry();

  const startDisabled = !canRun;
  const startTitle = runDisabledReason ?? "";
  const stopDisabled = !isRunning;
  const retryDisabled = isRunning || !canRetry;

  const onSubmitPrompt = useCallback(
    async (prompt: string) => {
      requestRun(prompt);
    },
    [requestRun],
  );

  const onRunComplete = useCallback(() => {
    setActiveTab("results");
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="shrink-0 border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-slate-900 text-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowPromptModal(true)}
                disabled={startDisabled}
                title={startTitle}
              >
                {PlayIcon} 시작
              </button>
              <button
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                onClick={() => requestCancel()}
                disabled={stopDisabled}
              >
                {SquareIcon} 중단
              </button>
              <button
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                onClick={() => requestRetry()}
                disabled={!!retryDisabled}
                title={retryDisabled ? "재시도할 항목 없음" : undefined}
              >
                {RotateCwIcon} 재시도
              </button>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <nav className="flex items-center gap-1">
              <button
                className={`inline-flex items-center gap-1 px-3 h-8 rounded-md border ${
                  activeTab === "graph"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                }`}
                onClick={() => setActiveTab("graph")}
              >
                {GitBranchIcon} 그래프
              </button>
              <button
                className={`inline-flex items-center gap-1 px-3 h-8 rounded-md border ${
                  activeTab === "results"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                }`}
                onClick={() => setActiveTab("results")}
              >
                {MessageSquareIcon} 결과물
              </button>
            </nav>
            {startDisabled && startTitle ? (
              <span className="ml-3 text-sm text-slate-600 dark:text-slate-300">
                시작 불가: {startTitle}
              </span>
            ) : null}
          </div>
        </div>

        {/* 캔버스/결과 */}
        <ReactFlowProvider>
          <FlowCanvas activeTab={activeTab} onRunComplete={onRunComplete} />
        </ReactFlowProvider>

        {/* 프롬프트 모달 */}
        <PromptInputModal
          open={showPromptModal}
          onOpenChange={setShowPromptModal}
          onSubmit={onSubmitPrompt}
        />
      </div>
    </div>
  );
};

export const FlowBuilder = FlowSection;
