"use client";

import { FlowSection } from "@/features/flow/components/flow-section";
import { FlowGeneratorStoreProvider } from "@/features/flow/providers/flow-store-provider";

export default function FlowGeneratePage() {
  return (
    <FlowGeneratorStoreProvider>
      <FlowSection />
    </FlowGeneratorStoreProvider>
  );
}
