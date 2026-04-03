"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { StockBadge } from "./StockBadge";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

type ProductImage = {
  cloudinary_url: string;
  is_primary: boolean;
};

type ProductVariant = {
  id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
  price_diff: number;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  gender: string;
  is_featured?: boolean;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  avg_rating?: number;
  review_count?: number;
};

type ProductCardProps = {
  product: ProductCardData;
  priority?: boolean; // for above-fold images
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage =
    product.product_images.find((i) => i.is_primary) ??
    product.product_images[0];

  const secondaryImage = product.product_images.find((i) => !i.is_primary);

  // Get the first available variant for quick-add
  const firstVariant = product.product_variants.find((v) => v.stock > 0);
  const totalStock = product.product_variants.reduce((s, v) => s + v.stock, 0);

  const displayPrice = product.sale_price ?? product.base_price;
  const hasDiscount = !!product.sale_price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.sale_price! / product.base_price) * 100)
    : 0;

  const formatPrice = (p: number) => `KES ${p.toLocaleString("en-KE")}`;

  // Unique colors for swatch preview
  const uniqueColors = Array.from(
    new Map(
      product.product_variants.map((v) => [v.color, v.color_hex])
    ).entries()
  ).slice(0, 4);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;

    addItem({
      variantId: firstVariant.id,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: primaryImage?.cloudinary_url ?? "",
      size: firstVariant.size,
      color: firstVariant.color,
      price: product.base_price + firstVariant.price_diff,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((w) => !w);
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative bg-background border border-border overflow-hidden transition-shadow duration-300 hover:shadow-md">

        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {/* Primary image */}
          {primaryImage && (
            <img
              src={primaryImage.cloudinary_url}
              alt={product.name}
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                "transition-all duration-500 ease-out",
                secondaryImage
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-105"
              )}
            />
          )}

          {/* Secondary image (hover reveal) */}
          {secondaryImage && (
            <img
              src={secondaryImage.cloudinary_url}
              alt={`${product.name} alternate view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out scale-105 group-hover:scale-100"
            />
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <span className="bg-primary text-primary-foreground text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-1">
                -{discountPct}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-foreground text-background text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-1">
                Featured
              </span>
            )}
          </div>

          {/* Stock badge — top right */}
          <div className="absolute top-3 right-3 z-10">
            <StockBadge stock={totalStock} size="sm" />
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute bottom-3 right-3 z-10",
              "w-8 h-8 flex items-center justify-center",
              "bg-background/90 backdrop-blur-sm",
              "border border-border",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
              wishlist && "opacity-100 translate-y-0 border-primary bg-accent"
            )}
            aria-label="Add to wishlist"
          >
            <Heart
              size={14}
              className={cn(
                "transition-colors duration-200",
                wishlist ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Quick add button — slides up on hover */}
          {firstVariant && (
            <button
              onClick={handleQuickAdd}
              className={cn(
                "absolute bottom-0 left-0 right-0 z-10",
                "flex items-center justify-center gap-2",
                "py-3 text-xs font-sans font-semibold uppercase tracking-widest",
                "transition-all duration-300",
                "translate-y-full group-hover:translate-y-0",
                addedToCart
                  ? "bg-foreground text-background"
                  : "bg-primary text-primary-foreground hover:bg-foreground"
              )}
            >
              <ShoppingBag size={14} />
              {addedToCart ? "Added!" : "Quick Add"}
            </button>
          )}
        </div>

        {/* Card info */}
        <div className="px-3 pt-3 pb-4">
          {/* Gender tag */}
          <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1 capitalize">
            {product.gender}
          </p>

          {/* Product name */}
          <h3 className="font-serif text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avg_rating != null && product.review_count != null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={cn(
                      i < Math.round(product.avg_rating!)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground font-sans">
                ({product.review_count})
              </span>
            </div>
          )}

          {/* Color swatches */}
          {uniqueColors.length > 1 && (
            <div className="flex items-center gap-1 mt-2">
              {uniqueColors.map(([color, hex]) => (
                <span
                  key={color}
                  title={color}
                  className="w-3.5 h-3.5 border border-border/60"
                  style={{ backgroundColor: hex }}
                />
              ))}
              {product.product_variants.length > 4 && (
                <span className="text-[10px] text-muted-foreground font-sans">
                  +{product.product_variants.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2.5">
            <span
              className={cn(
                "font-sans font-bold text-base",
                hasDiscount ? "text-primary" : "text-foreground"
              )}
            >
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="font-sans text-sm text-muted-foreground line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}