"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PurchaseDialog } from "@/features/store/components/ui/purchase-dialog";
import { useStoreStore } from "@/features/store/providers/store-store-provider";

export function StoreController() {
  const pathname = usePathname();
  const closePurchaseDialog = useStoreStore.use.closePurchaseDialog();

  useEffect(() => {
    closePurchaseDialog();
  }, [pathname, closePurchaseDialog]);

  return <PurchaseDialog />;
}
