import type { StateCreator } from "zustand";

export type ActiveTab = "graph" | "results";

export type ActiveTabSlice = {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
};

export const createActiveTabSlice: StateCreator<ActiveTabSlice> = (set) => ({
  activeTab: "graph",
  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),
});
