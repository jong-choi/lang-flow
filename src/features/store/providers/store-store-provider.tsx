"use client";

import { createStorefrontStore } from "@/features/store/stores/store-store";
import { createStoreProvider } from "@/utils/zustand";

const {
  StoreProvider: StoreStoreProvider,
  useStore: useStoreStore,
  StoreContext: StoreStoreContext,
} = createStoreProvider(createStorefrontStore, "Storefront");

export { StoreStoreProvider, useStoreStore, StoreStoreContext };
export type StoreStoreApi = ReturnType<typeof createStorefrontStore>;
