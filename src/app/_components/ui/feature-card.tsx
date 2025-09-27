"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentGradient: string;
  backgroundGradient: string;
}
export function FeatureCard({
  icon,
  title,
  description,
  accentGradient,
  backgroundGradient,
}: FeatureCardProps) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.1, ease: "easeOut" },
      }}
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm transition-all duration-300",
        backgroundGradient,
      )}
    >
      <div
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-105",
          accentGradient,
        )}
      >
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}
