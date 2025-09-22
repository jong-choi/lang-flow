"use client";

import { createFlowGeneratorStore } from "@/features/flow/stores/flow-store";
import { createStoreProvider } from "@/utils/zustand";

const {
  StoreProvider: FlowGeneratorStoreProvider,
  useStore: useFlowGeneratorStore,
  StoreContext: FlowGeneratorStoreContext,
} = createStoreProvider(createFlowGeneratorStore, "FlowGenerator");

export {
  FlowGeneratorStoreProvider,
  useFlowGeneratorStore,
  FlowGeneratorStoreContext,
};
export type FlowGeneratorStoreApi = ReturnType<typeof createFlowGeneratorStore>;
