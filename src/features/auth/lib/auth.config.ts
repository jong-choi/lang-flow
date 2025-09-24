import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { type AuthConfig } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import {
  accounts,
  sessions,
  verificationTokens,
} from "@/features/auth/db/schema";
import { verifyUserPassword } from "@/features/auth/lib/password-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

type GoogleProfile = {
  email?: string;
  name?: string;
  picture?: string;
};

async function syncUserFromGoogleProfile(
  userId: string,
  profile: unknown,
) {
  if (!userId) return;

  const safeProfile = (profile ?? {}) as GoogleProfile;
  const [existing] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) return;

  const updates: {
    name?: string | null;
    email?: string;
    image?: string | null;
    emailVerified?: Date | null;
  } = {};

  if (typeof safeProfile.name === "string" && safeProfile.name.trim()) {
    updates.name = safeProfile.name.trim();
  }

  if (typeof safeProfile.picture === "string" && safeProfile.picture.trim()) {
    updates.image = safeProfile.picture.trim();
  }

  if (typeof safeProfile.email === "string" && safeProfile.email.includes("@")) {
    if (
      existing.email?.startsWith("guest@") ||
      existing.email === safeProfile.email
    ) {
      updates.email = safeProfile.email;
      updates.emailVerified = new Date();
    }
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await db.update(users).set(updates).where(eq(users.id, userId));
}

export const authConfig: AuthConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          const user = await verifyUserPassword(email, password);
          if (!user) return null;
          return {
            id: user.id,
            name: user.name ?? null,
            email: user.email,
            image: user.image ?? null,
          };
        } catch (err) {
          console.error("Credentials authorize error", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      const resolvedId =
        user?.id ??
        (token?.id as string | undefined) ??
        (session.user as { id?: string | null } | undefined)?.id ??
        null;

      if (!resolvedId) {
        return session;
      }

      const [profile] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(users)
        .where(eq(users.id, resolvedId))
        .limit(1);

      const nextUser = {
        ...(session.user ?? {}),
        id: resolvedId,
        name: profile?.name ?? session.user?.name ?? null,
        email: profile?.email ?? session.user?.email ?? null,
        image: profile?.image ?? session.user?.image ?? null,
      } as typeof session.user & { id: string };

      return { ...session, user: nextUser };
    },
  },
  events: {
    async linkAccount({ user, account, profile }) {
      if (!user?.id || account?.provider !== "google") {
        return;
      }

      await syncUserFromGoogleProfile(user.id, profile);
    },
    async signIn({ user, account, profile }) {
      if (!user?.id || account?.provider !== "google") {
        return;
      }

      await syncUserFromGoogleProfile(user.id, profile);
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};
