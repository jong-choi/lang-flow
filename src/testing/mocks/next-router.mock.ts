import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { type ReadonlyURLSearchParams } from "next/navigation";

const noop = () => {
  // Storybook 및 테스트 환경에서 기본 라우터 동작을 대체하기 위한 no-op 함수
};

export interface CreateRouterMockOptions {
  readonly pathname?: string;
  readonly query?: Record<string, string | string[]>;
  readonly routerOverrides?: Partial<AppRouterInstance>;
}

export const createReadonlySearchParams = (
  params?: Record<string, string | string[]>,
): ReadonlyURLSearchParams => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((entry) => {
        if (entry !== undefined && entry !== null) {
          searchParams.append(key, String(entry));
        }
      });
    });
  }

  return searchParams as unknown as ReadonlyURLSearchParams;
};

export const createRouterMock = (
  options?: CreateRouterMockOptions,
): {
  router: AppRouterInstance;
  pathname: string;
  searchParams: ReadonlyURLSearchParams;
} => {
  const pathname = options?.pathname ?? "/";
  const searchParams = createReadonlySearchParams(options?.query);

  const router: AppRouterInstance = {
    back: options?.routerOverrides?.back ?? noop,
    forward: options?.routerOverrides?.forward ?? noop,
    prefetch:
      options?.routerOverrides?.prefetch ?? (async () => Promise.resolve()),
    push: options?.routerOverrides?.push ?? (async () => Promise.resolve()),
    replace:
      options?.routerOverrides?.replace ?? (async () => Promise.resolve()),
    refresh: options?.routerOverrides?.refresh ?? noop,
  };

  return {
    router,
    pathname,
    searchParams,
  };
};

const defaultMock = createRouterMock();

export const useRouter = () => defaultMock.router;
export const usePathname = () => defaultMock.pathname;
export const useSearchParams = () => defaultMock.searchParams;
export const useParams = () => ({}) as Record<string, string>;
export const useSelectedLayoutSegments = () => [] as string[];
