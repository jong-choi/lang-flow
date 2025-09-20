"use client";

import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SHARED_STYLES } from "@/features/flow/constants/node-config";
import type { NodeConfig, NodeData } from "@/features/flow/types/nodes";

export const NodeContent: React.FC<{ data: NodeData; config: NodeConfig }> = ({ data, config }) => (
  <div className={SHARED_STYLES.nodeContent}>
    <div className={`${SHARED_STYLES.emojiCircle} ${config.emojiGradient}`}>
      {data.emoji}
    </div>
    <div className={SHARED_STYLES.nodeInfo}>
      <div className={SHARED_STYLES.nodeTitle}>{data.label}</div>
      <div className={`${SHARED_STYLES.nodeJob} ${config.iconColor}`}>
        {data.job}
      </div>
    </div>
    {data.runStatus === "running" && (
      <Loader2 className="ml-2 h-4 w-4 animate-spin text-violet-600" />
    )}
    {data.runStatus === "success" && (
      <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-600" />
    )}
  </div>
);
