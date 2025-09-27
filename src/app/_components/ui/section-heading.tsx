"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string | ReactNode;
  description?: ReactNode;
  className?: string;
}
export function SectionHeading({
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("space-y-4 text-center", className)}
    >
      <div className="mx-auto max-w-3xl text-balance">
        <h2 className="bg-gradient-to-r from-slate-900 via-violet-900 to-indigo-900 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-lg leading-relaxed text-slate-600 md:text-xl">
            {description}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
