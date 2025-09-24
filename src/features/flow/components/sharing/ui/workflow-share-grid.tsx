import type { ReactNode } from "react";

export interface WorkflowShareGridProps {
  children: ReactNode;
}

export function WorkflowShareGrid({ children }: WorkflowShareGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
  );
}

