"use client";

import React from "react";

export function useDelayApi() {
  const controllersRef = React.useRef<Map<string, AbortController>>(new Map());

  const callServer = React.useCallback(
    async (nodeId: string, timeoutMs = 7000) => {
      const nodeController = new AbortController();
      controllersRef.current.set(nodeId, nodeController);
      const executeRequest = async (): Promise<{
        ok: boolean;
        error?: string;
      }> => {
        const attemptController = new AbortController();
        const onParentAbort = () => attemptController.abort();
        nodeController.signal.addEventListener("abort", onParentAbort);
        const timeoutId = setTimeout(
          () => attemptController.abort(),
          timeoutMs,
        );
        try {
          const response = await fetch(
            `/api/delay?id=${encodeURIComponent(nodeId)}`,
            {
              method: "GET",
              signal: attemptController.signal,
            },
          );
          const data = (await response.json().catch(() => null)) as {
            ok?: boolean;
            id?: string;
            error?: string;
          } | null;
          if (!response.ok)
            return {
              ok: false,
              error: data?.error ?? String(response.status),
            } as const;
          return { ok: true } as const;
        } catch {
          if (attemptController.signal.aborted)
            return { ok: false, error: "aborted" } as const;
          return { ok: false, error: "network" } as const;
        } finally {
          clearTimeout(timeoutId);
          nodeController.signal.removeEventListener("abort", onParentAbort);
        }
      };

      const result = await executeRequest();

      controllersRef.current.delete(nodeId);
      return result;
    },
    [],
  );

  const cancelAll = React.useCallback(() => {
    for (const controller of controllersRef.current.values())
      controller.abort();
    controllersRef.current.clear();
  }, []);

  return { callServer, cancelAll };
}
