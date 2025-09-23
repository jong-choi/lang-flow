import { createStore } from "zustand";
import type { CanvasSlice } from "./slices/canvas-slice";
import { createCanvasSlice } from "./slices/canvas-slice";
import type { DnDSlice } from "./slices/dnd-slice";
import { createDnDSlice } from "./slices/dnd-slice";
import type { NodeActionsSlice } from "./slices/node-actions-slice";
import { createNodeActionsSlice } from "./slices/node-actions-slice";
import type { PaletteSlice } from "./slices/palette-slice";
import { createPaletteSlice } from "./slices/palette-slice";
import type { RunControlsSlice } from "./slices/run-controls-slice";
import { createRunControlsSlice } from "./slices/run-controls-slice";
import type { RunMetaSlice } from "./slices/run-meta-slice";
import { createRunMetaSlice } from "./slices/run-meta-slice";
import type { RunSlice } from "./slices/run-slice";
import { createRunSlice } from "./slices/run-slice";
import type { TemplateSlice } from "./slices/template-slice";
import { createTemplateSlice } from "./slices/template-slice";

export type FlowGeneratorState = DnDSlice &
  RunSlice &
  RunMetaSlice &
  NodeActionsSlice &
  RunControlsSlice &
  PaletteSlice &
  TemplateSlice &
  CanvasSlice;

export const createFlowGeneratorStore = (
  initialState?: Partial<FlowGeneratorState>,
) =>
  createStore<FlowGeneratorState>()((set, get, api) => ({
    ...createRunSlice(set, get, api),
    ...createRunMetaSlice(set, get, api),
    ...createRunControlsSlice(set, get, api),
    ...createDnDSlice(set, get, api),
    ...createNodeActionsSlice(set, get, api),
    ...createPaletteSlice(set, get, api),
    ...createTemplateSlice(set, get, api),
    ...createCanvasSlice(set, get, api),
    ...initialState,
  }));
