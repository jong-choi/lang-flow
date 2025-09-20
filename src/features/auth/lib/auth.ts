import NextAuth from "next-auth";
import { authConfig } from "@/features/auth/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
