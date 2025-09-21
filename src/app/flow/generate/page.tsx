"use client";

import { FlowBuilder } from "@/features/flow/components/flow-canvas";
import { FlowGeneratorStoreProvider } from "@/features/flow/providers/flow-store-provider";

export default function FlowGeneratePage() {
  return (
    <FlowGeneratorStoreProvider>
      <FlowBuilder />
    </FlowGeneratorStoreProvider>
  );
}
