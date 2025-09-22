"use client";

import { FlowSection } from "@/features/flow/components/flow-section";
import FlowHeader from "@/features/flow/components/header/flow-header";
import { FlowGeneratorStoreProvider } from "@/features/flow/providers/flow-store-provider";

export default function FlowGeneratePage() {
  return (
    <FlowGeneratorStoreProvider>
      <FlowHeader />
      <FlowSection />
    </FlowGeneratorStoreProvider>
  );
}
