import { createStore } from "zustand";
import type { DnDSlice } from "./slices/dnd-slice";
import { createDnDSlice } from "./slices/dnd-slice";
import type { NodeActionsSlice } from "./slices/node-actions-slice";
import { createNodeActionsSlice } from "./slices/node-actions-slice";
import type { RunMetaSlice } from "./slices/run-meta-slice";
import { createRunMetaSlice } from "./slices/run-meta-slice";
import type { RunSlice } from "./slices/run-slice";
import { createRunSlice } from "./slices/run-slice";

export type FlowGeneratorState = DnDSlice &
  RunSlice &
  RunMetaSlice &
  NodeActionsSlice;

export const createFlowGeneratorStore = (
  initialState?: Partial<FlowGeneratorState>,
) =>
  createStore<FlowGeneratorState>()((set, get, api) => ({
    ...createRunSlice(set, get, api),
    ...createRunMetaSlice(set, get, api),
    ...createDnDSlice(set, get, api),
    ...createNodeActionsSlice(set, get, api),
    ...initialState,
  }));
