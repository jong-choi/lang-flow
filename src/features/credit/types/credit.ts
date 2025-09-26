import type { InferSelectModel } from "drizzle-orm";
import type {
  creditHistories,
  creditHistoryTypeEnum,
  credits,
} from "@/features/credit/db/schema";

export type Credit = InferSelectModel<typeof credits>;

export type CreditHistory = InferSelectModel<typeof creditHistories>;

export type CreditHistoryType =
  (typeof creditHistoryTypeEnum.enumValues)[number];

export type CreditSummary = Omit<Credit, "createdAt" | "updatedAt"> & {
  createdAt: Credit["createdAt"] | null;
  updatedAt: Credit["updatedAt"] | null;
};

export type CreditHistoryItem = Omit<CreditHistory, never> & {
  type: CreditHistoryType;
};

export type Pagination = {
  limit: number;
  offset: number;
  total: number;
};

export type CreditHistoryList = {
  histories: CreditHistoryItem[];
  pagination: Pagination;
};
