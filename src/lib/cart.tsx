"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback, useMemo } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  id: string; // product.id
  product: Product;
  quantity: number;
  unitPrice: number | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "swisswatch_premium_cart_v1";

let hasHydrated = false;
let memoryItems: CartItem[] = [];
const cartListeners = new Set<() => void>();

function notifyCartListeners() {
  cartListeners.forEach((listener) => listener());
}

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<CartItem>;
  return (
    typeof candidate.id === "string" &&
    candidate.product !== null &&
    typeof candidate.product === "object" &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0
  );
}

function parseCartSafely(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidCartItem);
    }
    return [];
  } catch {
    return [];
  }
}

function loadStoredItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  if (!hasHydrated) {
    hasHydrated = true;
    memoryItems = parseCartSafely(localStorage.getItem(STORAGE_KEY));
  }
  return memoryItems;
}

function subscribe(callback: () => void) {
  cartListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memoryItems = parseCartSafely(e.newValue);
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    cartListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartItem[] {
  return loadStoredItems();
}

const SERVER_SNAPSHOT: CartItem[] = [];
function getServerSnapshot(): CartItem[] {
  return SERVER_SNAPSHOT;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveItems = (newItems: CartItem[]) => {
    memoryItems = newItems;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }
    notifyCartListeners();
  };

  const addItem = useCallback((product: Product, quantity: number = 1): boolean => {
    if (quantity <= 0) return false;
    const current = loadStoredItems();
    const existing = current.find((i) => i.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = current.map((i) =>
        i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      updated = [
        ...current,
        {
          id: product.id,
          product,
          quantity,
          unitPrice: product.price,
        },
      ];
    }
    saveItems(updated);
    return true;
  }, []);

  const removeItem = useCallback((itemId: string) => {
    const current = loadStoredItems();
    const updated = current.filter((i) => i.id !== itemId);
    saveItems(updated);
  }, []);

  const updateQuantity = useCallback((itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }
    const current = loadStoredItems();
    const updated = current.map((i) =>
      i.id === itemId ? { ...i, quantity: newQty } : i
    );
    saveItems(updated);
  }, [removeItem]);

  const clearCart = useCallback(() => {
    memoryItems = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notifyCartListeners();
  }, []);

  const totalCount = useMemo(
    () => items.reduce((acc, curr) => acc + curr.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce((acc, curr) => {
        const p = curr.unitPrice || 0;
        return acc + p * curr.quantity;
      }, 0),
    [items]
  );

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
        isLoaded: true,
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
