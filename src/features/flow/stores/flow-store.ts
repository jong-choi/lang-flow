import { createStore } from "zustand";
import type { ActiveTabSlice } from "@/features/flow/stores/slices/active-tab-slice";
import { createActiveTabSlice } from "@/features/flow/stores/slices/active-tab-slice";
import type { BuilderUiSlice } from "@/features/flow/stores/slices/builder-ui-slice";
import { createBuilderUiSlice } from "@/features/flow/stores/slices/builder-ui-slice";
import type { CanvasSlice } from "@/features/flow/stores/slices/canvas-slice";
import { createCanvasSlice } from "@/features/flow/stores/slices/canvas-slice";
import type { DialogSlice } from "@/features/flow/stores/slices/dialog-slice";
import { createDialogSlice } from "@/features/flow/stores/slices/dialog-slice";
import type { DnDSlice } from "@/features/flow/stores/slices/dnd-slice";
import { createDnDSlice } from "@/features/flow/stores/slices/dnd-slice";
import {
  type InitialGraphSlice,
  createInitialGraphSlice,
} from "@/features/flow/stores/slices/initial-graph-slice";
import type { NodeActionsSlice } from "@/features/flow/stores/slices/node-actions-slice";
import { createNodeActionsSlice } from "@/features/flow/stores/slices/node-actions-slice";
import type { PaletteSlice } from "@/features/flow/stores/slices/palette-slice";
import { createPaletteSlice } from "@/features/flow/stores/slices/palette-slice";
import type { RunControlsSlice } from "@/features/flow/stores/slices/run-controls-slice";
import { createRunControlsSlice } from "@/features/flow/stores/slices/run-controls-slice";
import type { RunMetaSlice } from "@/features/flow/stores/slices/run-meta-slice";
import { createRunMetaSlice } from "@/features/flow/stores/slices/run-meta-slice";
import type { RunSlice } from "@/features/flow/stores/slices/run-slice";
import { createRunSlice } from "@/features/flow/stores/slices/run-slice";
import type { TemplateSlice } from "@/features/flow/stores/slices/template-slice";
import { createTemplateSlice } from "@/features/flow/stores/slices/template-slice";

export type FlowGeneratorState = DnDSlice &
  RunSlice &
  RunMetaSlice &
  NodeActionsSlice &
  RunControlsSlice &
  PaletteSlice &
  TemplateSlice &
  CanvasSlice &
  ActiveTabSlice &
  BuilderUiSlice &
  DialogSlice &
  InitialGraphSlice;

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
    ...createActiveTabSlice(set, get, api),
    ...createBuilderUiSlice(set, get, api),
    ...createDialogSlice(set, get, api),
    ...createInitialGraphSlice(set, get, api),
    ...initialState,
  }));
