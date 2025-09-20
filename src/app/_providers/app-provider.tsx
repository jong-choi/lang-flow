import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster richColors closeButton />
      {children}
    </SessionProvider>
  );
}
