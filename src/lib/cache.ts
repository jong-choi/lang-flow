import { unstable_cache } from "next/cache";

export type CacheableFn<Args extends unknown[], Result> = (
  ...args: Args
) => Promise<Result>;

export const callWithCache = async <Args extends unknown[], Result>(
  fn: CacheableFn<Args, Result>,
  {
    keyParts,
    tags,
    revalidate,
  }: { keyParts: string[]; tags: string[]; revalidate?: number },
  ...args: Args
): Promise<Result> => {
  const cachedFn = unstable_cache(fn, keyParts, { revalidate, tags });
  return cachedFn(...args);
};
