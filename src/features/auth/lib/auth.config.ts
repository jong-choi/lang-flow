import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { type AuthConfig } from "@auth/core";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/features/auth/db/schema";
import { verifyUserPassword } from "@/features/auth/lib/password-auth";
import { db } from "@/lib/db";

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
      const resolvedId = user?.id ?? (token?.id as string | undefined);
      if (session.user && resolvedId) {
        session.user.id = resolvedId;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === "development",
};
