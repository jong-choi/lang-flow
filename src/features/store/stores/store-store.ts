import { createStore } from "zustand";
import type { CartSlice } from "@/features/store/stores/slices/cart-slice";
import { createCartSlice } from "@/features/store/stores/slices/cart-slice";
import type { CatalogSlice } from "@/features/store/stores/slices/catalog-slice";
import { createCatalogSlice } from "@/features/store/stores/slices/catalog-slice";
import type { FiltersSlice } from "@/features/store/stores/slices/filters-slice";
import { createFiltersSlice } from "@/features/store/stores/slices/filters-slice";
import type { PurchaseSlice } from "@/features/store/stores/slices/purchase-slice";
import { createPurchaseSlice } from "@/features/store/stores/slices/purchase-slice";

export type StorefrontState = CatalogSlice &
  FiltersSlice &
  CartSlice &
  PurchaseSlice;

export const createStorefrontStore = (
  initialState?: Partial<StorefrontState>,
) =>
  createStore<StorefrontState>()((set, get, api) => ({
    ...createCatalogSlice(set, get, api),
    ...createFiltersSlice(set, get, api),
    ...createCartSlice(set, get, api),
    ...createPurchaseSlice(set, get, api),
    ...initialState,
  }));

export type StorefrontStoreApi = ReturnType<typeof createStorefrontStore>;
