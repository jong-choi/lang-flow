import { vi } from "vitest";

export const mockDrizzle = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue([]),
  then: vi.fn().mockResolvedValue([]),
};

export const mockPostgres = vi.fn().mockReturnValue({
  query: vi.fn().mockResolvedValue({ rows: [] }),
  end: vi.fn().mockResolvedValue(undefined),
});

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn(() => mockDrizzle),
}));

vi.mock("postgres", () => ({
  __esModule: true,
  default: mockPostgres,
}));
