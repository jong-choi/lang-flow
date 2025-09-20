"use client";

/**
 * 드래그 시작 시 노드 타입을 저장
 */
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import type { FlowNodeType } from "@/features/flow/types/nodes";

type DnDContextType = [
  FlowNodeType | undefined,
  Dispatch<SetStateAction<FlowNodeType | undefined>>,
];

const noop = () => {
  return undefined;
};

const DnDContext = createContext<DnDContextType>([undefined, noop]);

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const state = useState<FlowNodeType | undefined>();

  return <DnDContext.Provider value={state}>{children}</DnDContext.Provider>;
};

export const useDnD = () => useContext(DnDContext);
