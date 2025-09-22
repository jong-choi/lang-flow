import type { StateCreator } from "zustand";

export type PaletteView = "nodes" | "workflows";

export interface PaletteSlice {
  paletteView: PaletteView;
  setPaletteView: (view: PaletteView) => void;
}

export const createPaletteSlice: StateCreator<PaletteSlice> = (set) => ({
  paletteView: "nodes",
  setPaletteView: (view) => set({ paletteView: view }),
});
