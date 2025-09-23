import type { StateCreator } from "zustand";
import type {
  CartItem,
  CartSnapshot,
  CartTotals,
  WorkflowTemplate,
} from "@/features/store/types";

export const buildCartSnapshot = (
  cartItems: CartItem[],
  templates: WorkflowTemplate[],
): CartSnapshot => {
  const items = cartItems
    .map((item) => {
      const template = templates.find(
        (template) => template.id === item.templateId,
      );
      if (!template) {
        return null;
      }
      return {
        ...item,
        template,
      };
    })
    .filter((item): item is CartSnapshot["items"][number] => item !== null);

  const totals = items.reduce<CartTotals>(
    (acc, item) => {
      acc.totalItems += 1;
      acc.totalPrice += item.template.price;
      return acc;
    },
    { totalItems: 0, totalPrice: 0 },
  );

  return {
    items,
    ...totals,
  };
};

export interface CartSlice {
  cartItems: CartItem[];
  addToCart: (templateId: string) => { success: boolean; message: string };
  removeFromCart: (templateId: string) => void;
  clearCart: () => void;
}

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  cartItems: [],

  addToCart: (templateId) => {
    let added = false;
    const newCartItem: CartItem = {
      templateId,
      addedAt: new Date().toISOString(),
    };

    set((state) => {
      const already = state.cartItems.some(
        (item) => item.templateId === templateId,
      );

      if (already) {
        // 빈 객체 반환으로 업데이트 없도록
        return {};
      }

      added = true;
      return { cartItems: [...state.cartItems, newCartItem] };
    });

    if (!added) {
      return {
        success: false,
        message: "이미 장바구니에 있는 템플릿입니다.",
      };
    }

    return {
      success: true,
      message: "장바구니에 추가되었습니다.",
    };
  },

  removeFromCart: (templateId) => {
    set((state) => ({
      cartItems: state.cartItems.filter(
        (item) => item.templateId !== templateId,
      ),
    }));
  },

  clearCart: () => {
    set(() => ({ cartItems: [] }));
  },
});
