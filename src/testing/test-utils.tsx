import React from "react";
import { type ReactElement, type ReactNode } from "react";
import { vi } from "vitest";
import {
  QueryClient,
  QueryClientProvider,
  type UseMutationResult,
} from "@tanstack/react-query";
import { type RenderOptions } from "@testing-library/react";
import {
  render,
  renderHook as testingLibraryRenderHook,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

type WrapperProps = {
  children: ReactNode;
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient } = {},
) {
  function Wrapper({ children }: WrapperProps): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override render method
export { renderWithProviders as render };

// Export userEvent
export { userEvent };

// Render hook with providers
export function renderHook<T>(
  hook: () => T,
  options?: Parameters<typeof testingLibraryRenderHook>[1],
) {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return testingLibraryRenderHook(hook, {
    wrapper,
    ...options,
  });
}

export function createMockMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  overrides: Partial<UseMutationResult<TData, TError, TVariables, TContext>>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const base = {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
    status: "idle",
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    reset: vi.fn(),
    submittedAt: 0,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
  };

  return { ...base, ...overrides } as UseMutationResult<
    TData,
    TError,
    TVariables,
    TContext
  >;
}
