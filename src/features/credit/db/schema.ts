import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "@/lib/db/schema";

export const creditHistoryTypeEnum = pgEnum("credit_history_type", [
  "charge",
  "consume",
  "skip",
]);

export const credits = pgTable("credits", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  isConsumptionDisabled: boolean("is_consumption_disabled")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const creditHistories = pgTable("credit_histories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: creditHistoryTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const creditsRelations = relations(credits, ({ many }) => ({
  histories: many(creditHistories),
}));

export const creditHistoriesRelations = relations(creditHistories, ({ one }) => ({
  credit: one(credits, {
    fields: [creditHistories.userId],
    references: [credits.userId],
  }),
  user: one(users, {
    fields: [creditHistories.userId],
    references: [users.id],
  }),
}));
