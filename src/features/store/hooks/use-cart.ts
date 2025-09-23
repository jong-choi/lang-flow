import { useMemo, useState } from "react";
import type { CartItem, CartState, WorkflowTemplate } from "@/types/store";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartState: CartState = useMemo(() => {
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.template.price,
      0,
    );
    const totalItems = cartItems.length;

    return {
      items: cartItems,
      totalPrice,
      totalItems,
    };
  }, [cartItems]);

  const addToCart = (template: WorkflowTemplate) => {
    // 이미 장바구니에 있는지 확인
    const existingItem = cartItems.find(
      (item) => item.template.id === template.id,
    );

    if (existingItem) {
      return { success: false, message: "이미 장바구니에 있는 템플릿입니다." };
    }

    const newCartItem: CartItem = {
      template,
      addedAt: new Date().toISOString(),
    };

    setCartItems((prev) => [...prev, newCartItem]);
    return { success: true, message: "장바구니에 추가되었습니다." };
  };

  const removeFromCart = (templateId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.template.id !== templateId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (templateId: string) => {
    return cartItems.some((item) => item.template.id === templateId);
  };

  return {
    cartState,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
  };
};
