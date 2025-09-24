import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { generateSlug } from "random-word-slugs";
import { createSessionForUser } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateBase62Password = () => {
  const length = randomInt(8, 17);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += BASE62_CHARS[randomInt(0, BASE62_CHARS.length)];
  }
  return password;
};

const createGuestEmail = () => {
  const slug = generateSlug(2, {
    partsOfSpeech: ["adjective", "noun"],
    categories: { noun: ["animals"] },
    format: "kebab",
  });
  const localPart = slug.replace(/-/g, ".");
  return {
    email: `guest@${localPart}`,
    displayName: slug
      .split("-")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" "),
  } as const;
};

export const runtime = "nodejs";

export async function POST() {
  try {
    let createdUser: { id: string; email: string; name: string | null } | null =
      null;
    let password: string | null = null;

    for (let attempt = 0; attempt < 2 && !createdUser; attempt++) {
      const { email, displayName } = createGuestEmail();
      password = generateBase62Password();

      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const [inserted] = await db
          .insert(users)
          .values({
            email,
            name: `게스트 ${displayName}`,
            hashedPassword,
          })
          .returning({ id: users.id, email: users.email, name: users.name });

        if (inserted) {
          createdUser = inserted;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!/duplicate|unique/i.test(message)) {
          throw error;
        }
      }
    }

    if (!createdUser || !password) {
      return NextResponse.json(
        { error: "게스트 계정을 생성하지 못했습니다." },
        { status: 500 },
      );
    }

    const { expires } = await createSessionForUser(createdUser.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
      session: {
        expires: expires.toISOString(),
      },
    });
  } catch (error) {
    console.error("startGuest error", error);
    return NextResponse.json(
      { error: "게스트 계정을 생성하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
