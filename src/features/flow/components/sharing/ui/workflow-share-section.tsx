import type { ReactNode } from "react";

export interface WorkflowShareSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function WorkflowShareSection({
  title,
  description,
  children,
}: WorkflowShareSectionProps) {
  return (
    <section className="space-y-3 rounded-3xl border bg-background p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

