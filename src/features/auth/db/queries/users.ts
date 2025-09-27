import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import type { DBClient } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type InsertUserValues = InferInsertModel<typeof users>;

export const selectUserByEmail = async (
  client: DBClient,
  email: string,
) => {
  const [user] = await client
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
};

export const insertUser = async (
  client: DBClient,
  values: InsertUserValues,
) => {
  const [created] = await client.insert(users).values(values).returning();
  return created ?? null;
};
