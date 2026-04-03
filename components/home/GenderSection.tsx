"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

type GenderSectionProps = {
  gender: "men" | "women" | "kids";
  title?: string;
};

const GENDER_CONFIG = {
  men: {
    title: "Men's Picks",
    href: "/men",
    accent: "border-l-4 border-l-primary pl-4",
  },
  women: {
    title: "Women's Picks",
    href: "/women",
    accent: "border-l-4 border-l-foreground pl-4",
  },
  kids: {
    title: "Kids' Picks",
    href: "/kids",
    accent: "border-l-4 border-l-primary pl-4",
  },
};

async function fetchGenderPicks(gender: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, base_price, sale_price, gender, is_featured,
      product_images(cloudinary_url, is_primary),
      product_variants(id, size, color, color_hex, stock, price_diff)
    `)
    .eq("gender", gender)
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(3);

  if (error) throw error;
  return (data ?? []) as ProductCardData[];
}

export function GenderSection({ gender, title }: GenderSectionProps) {
  const config = GENDER_CONFIG[gender];
  const displayTitle = title ?? config.title;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured", gender],
    queryFn: () => fetchGenderPicks(gender),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="py-12 md:py-16">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div className={cn(config.accent)}>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            {displayTitle}
          </h2>
        </div>

        <Link
          href={config.href}
          className="group flex items-center gap-2 text-sm font-sans font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          See More
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i === 0} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-muted border border-border flex items-center justify-center"
            >
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-widest">
                Coming soon
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}