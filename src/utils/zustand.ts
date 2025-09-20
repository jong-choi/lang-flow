import React, {
  type ReactNode,
  createContext,
  useContext,
  useRef,
} from "react";
import { type StoreApi, type UseBoundStore } from "zustand";
import { useStore } from "zustand";

type KeySelector<Slice> = {
  (): Slice;
  <U>(selector: (slice: Slice) => U): U;
};

type KeySelectors<T extends object> = { [K in keyof T]: KeySelector<T[K]> };

export const createSelectors = <
  T extends object,
  S extends UseBoundStore<StoreApi<T>>,
>(
  store: S,
): S & { use: KeySelectors<T> } => {
  const enhanced = store as S & { use: KeySelectors<T> };

  const keySelectors: Partial<KeySelectors<T>> = {};
  const state = store.getState();

  const keys = Object.keys(state).filter((key) =>
    Object.prototype.hasOwnProperty.call(state, key),
  ) as Array<keyof T>;

  const createKeySelector = <K extends keyof T>(key: K): KeySelector<T[K]> => {
    const selector = <U>(sliceSelector?: (slice: T[K]) => U) => {
      if (sliceSelector) {
        return store((state) => sliceSelector(state[key]));
      }
      return store((state) => state[key]);
    };

    return selector as KeySelector<T[K]>;
  };

  keys.forEach((key) => {
    keySelectors[key] = createKeySelector(key);
  });

  enhanced.use = keySelectors as KeySelectors<T>;

  return enhanced;
};

// 컨텍스트 기반 훅(useBase)을 받아 .use 오토 셀렉터를 제공하는 유틸
// - createStore + Context 패턴에서도 store.use.key() 스타일을 사용 가능하게 함
export const createContextSelectors = <TState extends object>(
  useBaseHook: <ReturnType>(
    selector: (state: TState) => ReturnType,
  ) => ReturnType,
) => {
  type SliceSelector<TSlice> = {
    (): TSlice;
    <ReturnType>(selector: (slice: TSlice) => ReturnType): ReturnType;
  };
  type StateSelectors = { [TKey in keyof TState]: SliceSelector<TState[TKey]> };

  const enhancedHook = useBaseHook as typeof useBaseHook & {
    use: StateSelectors;
  };

  const selectorsProxy = new Proxy({} as StateSelectors, {
    get: (_target: StateSelectors, propertyKey: string | symbol) => {
      return <ReturnType>(
        sliceSelector?: (slice: TState[keyof TState]) => ReturnType,
      ): TState[keyof TState] | ReturnType => {
        return useBaseHook((state: TState) => {
          const sliceValue = state[propertyKey as keyof TState];
          return sliceSelector ? sliceSelector(sliceValue) : sliceValue;
        });
      };
    },
  });

  enhancedHook.use = selectorsProxy;
  return enhancedHook;
};

export const createStoreProvider = <TState extends object>(
  createStoreFunc: (initialState?: Partial<TState>) => StoreApi<TState>,
  storeName: string,
) => {
  type Store = ReturnType<typeof createStoreFunc>;

  const StoreContext = createContext<Store | undefined>(undefined);

  type StoreProviderProps = {
    children: ReactNode;
    initialState?: Partial<TState>;
  };

  function StoreProvider({ children, initialState }: StoreProviderProps) {
    const storeRef = useRef<Store | null>(null);

    if (!storeRef.current) {
      storeRef.current = createStoreFunc(initialState);
    }

    return React.createElement(
      StoreContext.Provider,
      { value: storeRef.current },
      children,
    );
  }

  const useStoreBase = <T>(selector: (state: TState) => T): T => {
    const storeContext = useContext(StoreContext);
    if (!storeContext) {
      throw new Error(
        `use${storeName}Store must be used within ${storeName}StoreProvider`,
      );
    }
    return useStore(storeContext, selector);
  };

  const useStoreEnhanced = createContextSelectors<TState>(useStoreBase);

  return {
    StoreProvider,
    useStore: useStoreEnhanced,
    StoreContext,
  } as const;
};
