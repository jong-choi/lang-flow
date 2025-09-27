"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}
export function SectionBadge({ children, icon, className }: SectionBadgeProps) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm",
        "dark:border-white/10 dark:bg-white/10 dark:text-white/90",
        className,
      )}
    >
      {icon}
      {children}
    </motion.div>
  );
}
