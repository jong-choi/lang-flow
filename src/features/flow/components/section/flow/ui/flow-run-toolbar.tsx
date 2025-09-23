"use client";

import { GitBranch, MessageSquare, Play, RotateCw, Square } from "lucide-react";
import { cn } from "@/utils/cn";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

type ViewTab = "graph" | "results";

const iconSize = "size-4" as const;

const RunStartButton = () => {
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();
  const setPromptDialogOpen = useFlowGeneratorStore.use.setPromptDialogOpen();

  const disabled = !canRun;
  const title = disabled ? runDisabledReason ?? undefined : undefined;

  return (
    <button
      className="inline-flex h-9 items-center gap-1 rounded-md bg-slate-900 px-3 text-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => setPromptDialogOpen(true)}
      disabled={disabled}
      title={title}
    >
      <Play className={iconSize} /> 시작
    </button>
  );
};

const RunStopButton = () => {
  const isRunning = useFlowGeneratorStore.use.isRunning();
  const requestCancel = useFlowGeneratorStore.use.requestCancel();

  return (
    <button
      className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      onClick={() => requestCancel()}
      disabled={!isRunning}
    >
      <Square className={iconSize} /> 중단
    </button>
  );
};

const RunRetryButton = () => {
  const isRunning = useFlowGeneratorStore.use.isRunning();
  const canRetry = useFlowGeneratorStore.use.canRetry();
  const requestRetry = useFlowGeneratorStore.use.requestRetry();

  const disabled = isRunning || !canRetry;

  return (
    <button
      className="inline-flex h-9 items-center gap-1 rounded-md bg-slate-100 px-3 text-slate-900 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100"
      onClick={() => requestRetry()}
      disabled={disabled}
      title={disabled ? "재시도할 항목 없음" : undefined}
    >
      <RotateCw className={iconSize} /> 재시도
    </button>
  );
};

const ViewTabButton = ({
  tab,
  icon: Icon,
  label,
}: {
  tab: ViewTab;
  icon: typeof GitBranch;
  label: string;
}) => {
  const activeTab = useFlowGeneratorStore.use.activeTab();
  const setActiveTab = useFlowGeneratorStore.use.setActiveTab();

  const isActive = activeTab === tab;

  return (
    <button
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-md border px-3",
        isActive
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300",
      )}
      onClick={() => setActiveTab(tab)}
    >
      <Icon className={iconSize} /> {label}
    </button>
  );
};

const RunDisabledNotice = () => {
  const canRun = useFlowGeneratorStore.use.canRun();
  const runDisabledReason = useFlowGeneratorStore.use.runDisabledReason();

  if (canRun || !runDisabledReason) {
    return null;
  }

  return (
    <span className="ml-3 text-sm text-slate-600 dark:text-slate-300">
      시작 불가: {runDisabledReason}
    </span>
  );
};

export const FlowRunToolbar = () => {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/60 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <RunStartButton />
          <RunStopButton />
          <RunRetryButton />
        </div>
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
        <nav className="flex items-center gap-1">
          <ViewTabButton tab="graph" icon={GitBranch} label="그래프" />
          <ViewTabButton tab="results" icon={MessageSquare} label="결과물" />
        </nav>
        <RunDisabledNotice />
      </div>
    </div>
  );
};
