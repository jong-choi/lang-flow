import {
  type DefaultOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry: (failureCount: number, error: Error) => {
      if (error?.message?.includes("401") || error?.message?.includes("403")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60, // 1분
    gcTime: 1000 * 60 * 5, // 5분
  },
  mutations: {
    retry: false,
  },
} satisfies DefaultOptions;

export type ApiFnReturnType<FnType> = FnType extends (
  ...args: unknown[]
) => Promise<infer R>
  ? Awaited<R>
  : never;

export type QueryConfig<T> = T extends (...args: unknown[]) => infer R
  ? Omit<R, "queryKey" | "queryFn">
  : never;

export type MutationConfig<MutationFnType> = MutationFnType extends (
  ...args: infer A
) => Promise<infer R>
  ? UseMutationOptions<
      Awaited<R>,
      Error,
      A extends [infer P, ...unknown[]] ? P : unknown
    >
  : never;
