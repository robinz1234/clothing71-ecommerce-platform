"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistStoreState {
  productIds: string[];

  // Actions
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  getItemCount: () => number;
}

export const useWishlistStoreBase = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      productIds: [],

      addItem: (productId) => {
        if (!productId) return;
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          return { productIds: [...state.productIds, productId] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId) => {
        if (!productId) return;
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (exists) {
            return { productIds: state.productIds.filter((id) => id !== productId) };
          }
          return { productIds: [...state.productIds, productId] };
        });
      },

      isWishlisted: (productId) => {
        if (!productId) return false;
        return get().productIds.includes(productId);
      },

      clearWishlist: () => {
        set({ productIds: [] });
      },

      getItemCount: () => {
        return get().productIds.length;
      },
    }),
    {
      name: "clothing71-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
