"use client";

import { type ReactNode } from "react";

export function AuthAlert({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-200/60 bg-emerald-50/80 text-emerald-900"
      : "border-red-200/60 bg-red-50/80 text-red-900";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}
