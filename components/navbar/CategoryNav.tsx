"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Shirt,
  PersonStanding,
  Footprints,
  Wind,
  Layers,
  AlignJustify,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";



// Lucide icon map keyed by category slug
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "t-shirts":    Shirt,
  "shirts":      PersonStanding,
  "trousers":    AlignJustify,
  "sweaters":    Layers,
  "hoodies":     Wind,
  "sweat-suits": LayoutGrid,
  "shoes":       Footprints,
};

async function fetchCategories(gender: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, gender")
    .eq("gender", gender)
    .order("display_order");
  return data ?? [];
}

export function CategoryNav() {
  const pathname = usePathname();

  // Derive gender from URL — always /men/... /women/... /kids/...
  const gender = pathname.split("/")[1] as "men" | "women" | "kids";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", gender],
    queryFn: () => fetchCategories(gender),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: ["men", "women", "kids"].includes(gender),
  });

  return (
    <div className="w-full border-b border-border bg-background sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0">

          {/* All */}
          <Link
            href={`/${gender}`}
            className={cn(
              "shrink-0 flex items-center gap-2 px-4 py-3.5",
              "text-xs font-sans font-semibold uppercase tracking-widest",
              "border-b-2 transition-colors duration-150 whitespace-nowrap",
              pathname === `/${gender}`
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            All
          </Link>

          {categories.map((cat) => {
            const href = `/${gender}/${cat.slug}`;
            const isActive = pathname === href;
            const Icon = CATEGORY_ICONS[cat.slug] ?? Shirt;

            return (
              <Link
                key={cat.id}
                href={href}
                className={cn(
                  "shrink-0 flex items-center gap-2 px-4 py-3.5",
                  "text-xs font-sans font-semibold uppercase tracking-widest",
                  "border-b-2 transition-colors duration-150 whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon size={14} strokeWidth={1.8} />
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}