"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

async function fetchFeaturedProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, base_price, sale_price, gender, is_featured,
      product_images(cloudinary_url, is_primary),
      product_variants(id, size, color, color_hex, stock, price_diff)
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(6);

  if (error) throw error;
  return (data ?? []) as ProductCardData[];
}

export function FeaturedProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "featured", "all"],
    queryFn: fetchFeaturedProducts,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="py-12 md:py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          {/* Eyebrow */}
          <p className="text-xs font-sans font-semibold uppercase tracking-[0.18em] text-primary mb-2">
            Handpicked for you
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Top Picks
          </h2>
        </div>

        <Link
          href="/products"
          className="group flex items-center gap-2 text-sm font-sans font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          View All
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {/* Grid — 2 rows of 3 */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {(products ?? []).map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={i < 3} // above-fold images get priority loading
            />
          ))}
        </div>
      )}
    </section>
  );
}