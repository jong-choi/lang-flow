"use client";

import { FlowBuilderScreen } from "@/features/flow/components/flow-builder-screen";
import { FlowGeneratorStoreProvider } from "@/features/flow/providers/flow-store-provider";

export default function FlowGeneratePage() {
  return (
    <FlowGeneratorStoreProvider>
      <FlowBuilderScreen />
    </FlowGeneratorStoreProvider>
  );
}
