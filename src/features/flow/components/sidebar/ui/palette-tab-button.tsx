"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface PaletteTabButtonProps {
  view: "nodes" | "workflows";
  isActive: boolean;
  onSelect: (view: "nodes" | "workflows") => void;
  children: ReactNode;
}

export const PaletteTabButton = ({
  view,
  isActive,
  onSelect,
  children,
}: PaletteTabButtonProps) => {
  return (
    <button
      className={cn(
        "flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors",
        isActive
          ? "bg-slate-900 text-white"
          : "bg-transparent text-slate-500 hover:bg-slate-100",
      )}
      onClick={() => onSelect(view)}
      type="button"
    >
      {children}
    </button>
  );
};
