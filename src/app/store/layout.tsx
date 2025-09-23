"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreController } from "@/features/store/components/store-controller";
import {
  StoreStoreProvider,
  useStoreStore,
} from "@/features/store/providers/store-store-provider";

interface StoreLayoutProps {
  children: ReactNode;
}

function StoreLayoutShell({ children }: StoreLayoutProps) {
  const totalItems = useStoreStore.use.cartItems((items) => items.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/store" className="text-xl font-bold text-primary">
                워크플로우 스토어
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/store/cart">
                <Button variant="outline" className="relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  장바구니
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 text-xs flex items-center justify-center rounded-full px-1">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main>{children}</main>
      <StoreController />
    </div>
  );
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <StoreStoreProvider>
      <StoreLayoutShell>{children}</StoreLayoutShell>
    </StoreStoreProvider>
  );
}
