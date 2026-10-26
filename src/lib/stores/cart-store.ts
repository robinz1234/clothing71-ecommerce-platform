"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types/cart";
import { getCartSubtotal } from "@/lib/checkout/pricing";

export interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;

  appliedPromoCode: string | null;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Selectors / Helpers
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

export function generateCartItemId(
  productId: string,
  color: string,
  size: string,
  variantId?: string | null
): string {
  if (variantId) {
    return `${productId}:${variantId}`;
  }
  return `${productId}:${color.toLowerCase().trim()}:${size.toLowerCase().trim()}`;
}

export const useCartStoreBase = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedPromoCode: null,

      addItem: (newItem) => {
        const itemId = generateCartItemId(
          newItem.productId,
          newItem.color,
          newItem.size,
          newItem.variantId
        );

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === itemId);

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            const max = newItem.maxStock ?? existing.maxStock;
            let targetQuantity = existing.quantity + newItem.quantity;

            if (typeof max === "number" && max > 0 && targetQuantity > max) {
              targetQuantity = max;
            }

            updatedItems[existingIndex] = {
              ...existing,
              quantity: targetQuantity,
              // Update display snapshots if provided
              unitPriceBdt: newItem.unitPriceBdt,
              compareAtPriceBdt: newItem.compareAtPriceBdt,
              image: newItem.image || existing.image,
            };

            return { items: updatedItems, isOpen: true };
          }

          const cartItem: CartItem = {
            ...newItem,
            id: itemId,
            quantity: Math.max(1, newItem.quantity),
          };

          return { items: [...state.items, cartItem], isOpen: true };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id !== id) return item;
            let newQty = Math.max(1, Math.floor(quantity));
            if (typeof item.maxStock === "number" && item.maxStock > 0) {
              newQty = Math.min(newQty, item.maxStock);
            }
            return { ...item, quantity: newQty };
          });
          return { items: updatedItems };
        });
      },

      incrementQuantity: (id) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id !== id) return item;
            let newQty = item.quantity + 1;
            if (typeof item.maxStock === "number" && item.maxStock > 0) {
              newQty = Math.min(newQty, item.maxStock);
            }
            return { ...item, quantity: newQty };
          });
          return { items: updatedItems };
        });
      },

      decrementQuantity: (id) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.id !== id) return item;
            const newQty = Math.max(1, item.quantity - 1);
            return { ...item, quantity: newQty };
          });
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [], appliedPromoCode: null });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      applyPromoCode: (code: string) => {
        const normalized = code.trim().toUpperCase();
        if (normalized === "SPD10") {
          set({ appliedPromoCode: "SPD10" });
          return { success: true, message: "Promo code SPD10 applied (10% off)" };
        }
        return { success: false, message: "Invalid promo code" };
      },

      removePromoCode: () => {
        set({ appliedPromoCode: null });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return getCartSubtotal(get().items);
      },

      getDiscount: () => {
        const state = get();
        if (state.appliedPromoCode === "SPD10") {
          return Math.round(state.getSubtotal() * 0.10);
        }
        return 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: "clothing71-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, appliedPromoCode: state.appliedPromoCode }),
    }
  )
);
