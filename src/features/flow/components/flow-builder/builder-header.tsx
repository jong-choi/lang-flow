import { GitBranch, MessageSquare, Play, RotateCw, Square } from "lucide-react";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

const PlayIcon = <Play className="size-4" />;
const SquareIcon = <Square className="size-4" />;
const RotateCwIcon = <RotateCw className="size-4" />;
const GitBranchIcon = <GitBranch className="size-4" />;
const MessageSquareIcon = <MessageSquare className="size-4" />;
export function BuilderHeader() {
  const activeTab = useFlowGeneratorStore.use.activeTab();
  const setActiveTab = useFlowGeneratorStore.use.setActiveTab();
  const requestCancel = useFlowGeneratorStore.use.requestCancel();
  const requestRetry = useFlowGeneratorStore.use.requestRetry();
  const isRunning = useFlowGeneratorStore.use.isRunning();
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const canRetry = useFlowGeneratorStore.use.canRetry();
  const setPromptDialogOpen = useFlowGeneratorStore.use.setPromptDialogOpen();

  const startDisabled = !canRun;
  const startTitle = runDisabledReason ?? "";
  const stopDisabled = !isRunning;
  const retryDisabled = isRunning || !canRetry;
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/60 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-1 rounded-md bg-slate-900 px-3 text-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setPromptDialogOpen(true)}
            disabled={startDisabled}
            title={startTitle}
          >
            {PlayIcon} 시작
          </button>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            onClick={() => requestCancel()}
            disabled={stopDisabled}
          >
            {SquareIcon} 중단
          </button>
          <button
            className="inline-flex h-9 items-center gap-1 rounded-md bg-slate-100 px-3 text-slate-900 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100"
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
            className={`inline-flex h-8 items-center gap-1 rounded-md border px-3 ${
              activeTab === "graph"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            }`}
            onClick={() => setActiveTab("graph")}
          >
            {GitBranchIcon} 그래프
          </button>
          <button
            className={`inline-flex h-8 items-center gap-1 rounded-md border px-3 ${
              activeTab === "results"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
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
  );
}
