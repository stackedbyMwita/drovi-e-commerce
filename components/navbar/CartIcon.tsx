"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function CartIcon() {
  const totalItems = useCartStore((s) => s.totalItems());
  const router = useRouter();

  // Prevent hydration mismatch — Zustand persists to localStorage
  // which the server doesn't have. Only show the real count after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? totalItems : 0;

  return (
    <button
      onClick={() => router.push("/cart")}
      className={cn(
        "relative flex items-center justify-center",
        "w-10 h-10 text-foreground",
        "hover:text-primary transition-colors duration-200",
        "group"
      )}
      aria-label={`Cart — ${count} items`}
    >
      <ShoppingBag
        size={22}
        className="transition-transform duration-200 group-hover:scale-110"
        strokeWidth={1.8}
      />

      {mounted && count > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5",
            "min-w-[18px] h-[18px] px-1",
            "bg-primary text-primary-foreground",
            "text-[10px] font-sans font-bold",
            "flex items-center justify-center",
            "leading-none",
            "animate-in zoom-in-75 duration-200"
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}