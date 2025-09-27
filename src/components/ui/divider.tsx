import * as React from "react";
import { cn } from "@/utils/cn";

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative py-2 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase",
          className,
        )}
        {...props}
      >
        <span className="absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-border" />
        {children}
      </div>
    );
  },
);

Divider.displayName = "Divider";

const DividerLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("relative bg-background px-3", className)}
      {...props}
    >
      {children}
    </span>
  );
});

DividerLabel.displayName = "DividerLabel";

export { Divider, DividerLabel };
