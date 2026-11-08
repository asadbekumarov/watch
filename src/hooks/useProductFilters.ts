"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product } from "@/types/product";

export interface UseProductFiltersOptions {
  products: Product[];
  debounceMs?: number;
}

export function useProductFilters({ products, debounceMs = 250 }: UseProductFiltersOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedBrand = searchParams.get("brand") || "all";
  const selectedSize = searchParams.get("size") || "all"; // e.g. "31mm", "32mm", "37mm", "39mm", "41mm"
  const selectedMovement = searchParams.get("movement") || "all"; // "automatic" | "quartz"
  const searchQuery = searchParams.get("q") || "";

  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Synchronize state during render instead of effect if URL changed externally
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (localSearch.trim()) {
          params.set("q", localSearch.trim());
        } else {
          params.delete("q");
        }
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, pathname, router, searchParams, debounceMs]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const resetAllFilters = () => {
    setLocalSearch("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Brand filter
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }
      // 2. Size filter (e.g. "32mm" -> 32)
      if (selectedSize !== "all") {
        const sizeNum = parseInt(selectedSize, 10);
        if (p.specs.caseDiameterValue !== sizeNum) {
          return false;
        }
      }
      // 3. Movement filter ("automatic" | "quartz")
      if (selectedMovement !== "all" && p.specs.movementType !== selectedMovement) {
        return false;
      }
      // 4. Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q) || p.nameRu.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchModel = p.model.toLowerCase().includes(q);
        const matchDesc = p.descriptionUz.toLowerCase().includes(q) || p.descriptionRu.toLowerCase().includes(q);
        const matchTags = p.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchModel && !matchDesc && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedBrand, selectedSize, selectedMovement, searchQuery]);

  return {
    filteredProducts,
    selectedBrand,
    selectedSize,
    selectedMovement,
    searchQuery: localSearch,
    setBrand: (brand: string) => updateParam("brand", brand),
    setSize: (size: string) => updateParam("size", size),
    setMovement: (mov: string) => updateParam("movement", mov),
    setSearchQuery: setLocalSearch,
    resetAllFilters,
  };
}
