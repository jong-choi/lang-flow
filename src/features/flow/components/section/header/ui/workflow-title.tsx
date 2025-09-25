"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlowGeneratorStore } from "@/features/flow/providers/flow-store-provider";

export const WorkflowTitle = () => {
  const [editing, setEditing] = useState(false);
  const workflowName = useFlowGeneratorStore.use.workflowName();
  const setWorkflowName = useFlowGeneratorStore.use.setWorkflowName();
  const name = workflowName ?? "새 템플릿";

  const handleSubmit = () => {
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        aria-label="workflow-name"
        value={name}
        onChange={(event) => setWorkflowName(event.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") {
            handleSubmit();
          }
        }}
        className="w-48 rounded-md border px-2 py-1 text-base font-semibold"
        data-testid="flow-name-input"
        autoFocus
      />
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => setEditing(true)}
          className="text-base font-semibold text-gray-900 hover:underline"
          data-testid="flow-name-button"
        >
          {name}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>클릭하여 수정</p>
      </TooltipContent>
    </Tooltip>
  );
};
