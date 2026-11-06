"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Product, SelectedCustomization, productsData } from "@/data/products";

export interface CartItem {
  id: string; // unique item key
  product: Product;
  quantity: number;
  customization?: SelectedCustomization;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    customization?: SelectedCustomization,
    unitPrice?: number
  ) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  recommendedUpsells: Product[];
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "alfajr_soatlar_cart_v1";

function generateCartItemId(productId: string, customization?: SelectedCustomization): string {
  if (!customization) return productId;
  const parts = [
    productId,
    customization.strapId || "def",
    customization.giftBox ? "gift" : "std",
    customization.engravingText ? encodeURIComponent(customization.engravingText) : "no-engr",
  ];
  return parts.join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize lazily to avoid setState synchronously inside useEffect
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to write cart to local storage:", e);
    }
  }, [items]);

  const addItem = (
    product: Product,
    quantity = 1,
    customization?: SelectedCustomization,
    customUnitPrice?: number
  ): boolean => {
    const unitPrice = customUnitPrice !== undefined ? customUnitPrice : product.price;
    const cartItemId = generateCartItemId(product.id, customization);

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === cartItemId);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            quantity,
            customization,
            unitPrice,
          },
        ];
      }
    });

    return true;
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  }, [items]);

  // Recommended complementary luxury watches for cross-selling
  const recommendedUpsells = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.product.id));
    return productsData
      .filter((p) => !cartProductIds.has(p.id))
      .slice(0, 3);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        recommendedUpsells,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
