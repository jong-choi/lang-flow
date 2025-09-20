import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import amplitudeMock from "../testing/mocks/amplitude";
import "./mocks/database";
import { server } from "./mocks/server";

// amplitude를 모듈 스코프에서 모킹하여 '@/lib/amplitude'를 임포트할 때 항상 모킹된 객체를 사용하도록 함
vi.mock("@/lib/amplitude", () => ({
  default: amplitudeMock,
}));

vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test_db");

// MSW 서버 설정
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });

  // Next.js 네비게이션 훅 모킹
  vi.mock("next/navigation", async () => {
    const actual = await vi.importActual("next/navigation");
    return {
      ...actual,
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
      }),
      usePathname: () => "/test-path",
      useSearchParams: () => ({
        get: vi.fn(),
        has: vi.fn(),
        getAll: vi.fn(),
        toString: vi.fn(() => ""),
      }),
    };
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// 전역 객체 모킹
beforeEach(() => {
  // ResizeObserver 모킹
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);

  // btoa/atob 함수 모킹
  if (typeof window !== "undefined") {
    window.btoa = (str: string) =>
      Buffer.from(str, "binary").toString("base64");
    window.atob = (str: string) =>
      Buffer.from(str, "base64").toString("binary");
  }
});
