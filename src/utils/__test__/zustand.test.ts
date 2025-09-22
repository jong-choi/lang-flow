import React, { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { type StoreApi, create } from "zustand";
import { act, renderHook } from "@testing-library/react";
import { createContextSelectors, createStoreProvider } from "@/utils/zustand";

interface TestState {
  count: number;
  text: string;
  nested: {
    value: boolean;
  };
  increment: () => void;
  setText: (newText: string) => void;
}

const useTestStore = create<TestState>((set) => ({
  count: 0,
  text: "hello",
  nested: {
    value: true,
  },
  increment: () => set((state) => ({ count: state.count + 1 })),
  setText: (newText: string) => set({ text: newText }),
}));

describe("createContextSelectors (컨텍스트 셀렉터 생성)", () => {
  beforeEach(() => {
    useTestStore.setState({
      count: 0,
      text: "hello",
      nested: { value: true },
    });
  });
  it("각 상태 키에 대한 셀렉터를 가진 'use' 속성을 추가해야 한다", () => {
    const useBoundStore = createContextSelectors(useTestStore);
    expect(useBoundStore.use).toBeDefined();
    expect(useBoundStore.use.count).toBeInstanceOf(Function);
    expect(useBoundStore.use.text).toBeInstanceOf(Function);
    expect(useBoundStore.use.nested).toBeInstanceOf(Function);
    expect(useBoundStore.use.increment).toBeInstanceOf(Function);
    expect(useBoundStore.use.setText).toBeInstanceOf(Function);
  });

  it("셀렉터 함수 없이 상태의 슬라이스를 선택할 수 있어야 한다", () => {
    const useBoundStore = createContextSelectors(useTestStore);
    const { result } = renderHook(() => useBoundStore.use.count());
    expect(result.current).toBe(0);
  });

  it("셀렉터 함수로 상태의 서브 슬라이스를 선택할 수 있어야 한다", () => {
    const useBoundStore = createContextSelectors(useTestStore);
    const { result } = renderHook(() =>
      useBoundStore.use.nested((state) => state.value),
    );
    expect(result.current).toBe(true);
  });

  it("선택된 상태가 변경되면 컴포넌트가 다시 렌더링되어야 한다", () => {
    const useBoundStore = createContextSelectors(useTestStore);
    const { result } = renderHook(() => {
      const count = useBoundStore.use.count();
      const increment = useBoundStore.use.increment();
      return { count, increment };
    });

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});

describe("createContextSelectors (기본 훅 확장)", () => {
  beforeEach(() => {
    useTestStore.setState({
      count: 0,
      text: "hello",
      nested: { value: true },
    });
  });
  it("기본 훅을 .use 속성으로 확장해야 한다", () => {
    const useBaseHook = <T>(selector: (state: TestState) => T) =>
      useTestStore(selector);
    const enhancedHook = createContextSelectors(useBaseHook);
    expect(enhancedHook.use).toBeDefined();
  });

  it(".use로 동작하는 셀렉터를 생성해야 한다", () => {
    const useBaseHook = <T>(selector: (state: TestState) => T) =>
      useTestStore(selector);
    const enhancedHook = createContextSelectors(useBaseHook);

    const { result } = renderHook(() => enhancedHook.use.count());
    expect(result.current).toBe(0);

    act(() => {
      useTestStore.getState().increment();
    });

    expect(result.current).toBe(1);
  });
});

describe("createStoreProvider (스토어 Provider 생성)", () => {
  interface MyState {
    value: string;
    setValue: (value: string) => void;
  }

  const createMyStore = (initialState?: Partial<MyState>): StoreApi<MyState> =>
    create<MyState>((set) => ({
      value: "initial",
      ...initialState,
      setValue: (value) => set({ value }),
    }));

  const { StoreProvider, useStore } = createStoreProvider(createMyStore, "My");

  const wrapper = ({
    children = React.createElement("div"),
    initialState,
  }: {
    children?: ReactNode;
    initialState?: Partial<MyState>;
  } = {}) =>
    React.createElement(
      StoreProvider as React.ComponentType<{
        initialState?: Partial<MyState>;
        children?: ReactNode;
      }>,
      { initialState },
      children,
    );

  it("useStore를 provider 외부에서 사용하면 오류를 던져야 한다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useStore((s) => s.value))).toThrow(
      "useMyStore must be used within MyStoreProvider",
    );
    spy.mockRestore();
  });

  it("스토어를 제공하고 상태를 선택할 수 있어야 한다", () => {
    const { result } = renderHook(() => useStore((s) => s.value), { wrapper });
    expect(result.current).toBe("initial");
  });

  it("초기 상태로 올바르게 초기화되어야 한다", () => {
    const wrapperWithOverride = ({ children }: { children?: ReactNode }) =>
      React.createElement(
        StoreProvider as React.ComponentType<{
          initialState?: Partial<MyState>;
          children?: ReactNode;
        }>,
        { initialState: { value: "override" } },
        children,
      );

    const { result } = renderHook(() => useStore((s) => s.value), {
      wrapper: wrapperWithOverride,
    });
    expect(result.current).toBe("override");
  });

  it("상태를 업데이트하면 컴포넌트가 다시 렌더링되어야 한다", () => {
    const { result } = renderHook(
      () => ({
        value: useStore((s) => s.value),
        setValue: useStore((s) => s.setValue),
      }),
      { wrapper },
    );

    expect(result.current.value).toBe("initial");

    act(() => {
      result.current.setValue("updated");
    });

    expect(result.current.value).toBe("updated");
  });

  describe("자동 생성된 셀렉터 사용", () => {
    it(".use 구문으로 슬라이스를 선택할 수 있어야 한다", () => {
      const wrapperFromUse = ({ children }: { children?: ReactNode }) =>
        React.createElement(
          StoreProvider as React.ComponentType<{
            initialState?: Partial<MyState>;
            children?: ReactNode;
          }>,
          { initialState: { value: "from use" } },
          children,
        );

      const { result } = renderHook(() => useStore.use.value(), {
        wrapper: wrapperFromUse,
      });
      expect(result.current).toBe("from use");
    });

    it(".use 구문에서 셀렉터와 함께 서브 슬라이스를 선택할 수 있어야 한다", () => {
      const wrapperFromUse = ({ children }: { children?: ReactNode }) =>
        React.createElement(
          StoreProvider as React.ComponentType<{
            initialState?: Partial<MyState>;
            children?: ReactNode;
          }>,
          { initialState: { value: "from use" } },
          children,
        );

      const { result } = renderHook(
        () => useStore.use.value((v) => v.toUpperCase()),
        {
          wrapper: wrapperFromUse,
        },
      );
      expect(result.current).toBe("FROM USE");
    });
  });
});
