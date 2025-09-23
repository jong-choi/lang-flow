"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/store/hooks/use-cart";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartState } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 상단 네비게이션 */}
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
                  {cartState.totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 text-xs flex items-center justify-center rounded-full px-1">
                      {cartState.totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main>{children}</main>
    </div>
  );
}
