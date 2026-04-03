"use client";

import { useState, use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShoppingCart, Check, Truck, RefreshCw,
  Shield, ChevronRight, Minus, Plus, Tag,
} from "lucide-react";
import { Container, FullBleed } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { StockBadge } from "@/components/product/StockBadge";
import { ImageGallery } from "@/components/product/ImageGallery";
import { SizeSelector } from "@/components/product/SizeSelector";
import { ColorSelector } from "@/components/product/ColorSelector";
import { useProduct } from "@/hooks/useProduct";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatPrice(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function ProductContent({ params }: Props) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useProduct(slug);

  const addItem = useCartStore((s) => s.addItem);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // ── All hooks BEFORE early returns ───────────────────────────
  const variants = product?.product_variants ?? [];
  const images = [...(product?.product_images ?? [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const colors = variants
    .filter((v, i, arr) => arr.findIndex((x) => x.color === v.color) === i)
    .map((v) => ({ color: v.color, color_hex: v.color_hex }));

  const availableSizes = useMemo(() => {
    const filtered = selectedColor
      ? variants.filter((v) => v.color === selectedColor)
      : variants;
    return [...new Set(filtered.map((v) => v.size))];
  }, [variants, selectedColor]);

  const unavailableSizes = useMemo(() => {
    const filtered = selectedColor
      ? variants.filter((v) => v.color === selectedColor)
      : variants;
    return filtered.filter((v) => v.stock === 0).map((v) => v.size);
  }, [variants, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedSize) return null;
    return variants.find(
      (v) =>
        v.size === selectedSize &&
        (!selectedColor || v.color === selectedColor)
    ) ?? null;
  }, [variants, selectedColor, selectedSize]);

  // ── Early returns AFTER all hooks ────────────────────────────
  if (isLoading) return null; // Suspense fallback handles loading UI
  if (error || !product) return notFound();

  const p = product;

  // ── Derived values ───────────────────────────────────────────
  const basePrice = p.base_price;
  const salePrice = p.sale_price;
  const displayPrice = salePrice ?? basePrice;
  const variantPrice = selectedVariant
    ? displayPrice + (selectedVariant.price_diff ?? 0)
    : displayPrice;

  const discountPct = salePrice
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : null;

  const stock = selectedVariant?.stock ?? null;
  const isInStock = stock === null || stock > 0;
  const genderLabel = p.gender.charAt(0).toUpperCase() + p.gender.slice(1);

  // ── Handlers ─────────────────────────────────────────────────
  function handleColorSelect(color: string) {
    setSelectedColor(color);
    setSelectedSize(null);
    setSizeError(false);
  }

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      document.getElementById("size-selector")?.scrollIntoView({
        behavior: "smooth", block: "center",
      });
      return;
    }
    if (!selectedVariant) return;

    addItem({
      variantId: selectedVariant.id,
      productId: p.id,
      productName: p.name,
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: variantPrice,
      image: images.find((i) => i.is_primary)?.cloudinary_url ?? images[0]?.cloudinary_url ?? "",
      slug: p.slug,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  return (
    <main>
      {/* Breadcrumb */}
      <FullBleed className="border-b border-border bg-background">
        <Container>
          <nav className="flex items-center gap-1.5 py-3 text-xs font-sans text-muted-foreground overflow-x-auto scrollbar-none whitespace-nowrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href={`/${p.gender}`} className="hover:text-primary transition-colors">
              {genderLabel}
            </Link>
            {p.categories && (
              <>
                <ChevronRight size={12} />
                <Link
                  href={`/${p.gender}/${p.categories.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {p.categories.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-foreground font-semibold truncate max-w-[200px]">
              {p.name}
            </span>
          </nav>
        </Container>
      </FullBleed>

      {/* Main product layout */}
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

          {/* Left: Image gallery */}
          <ImageGallery
            images={images}
            productName={p.name}
            activeColor={selectedColor}
          />

          {/* Right: Product info */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start">

            {/* Category + discount badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {p.categories && (
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {p.categories.name}
                </span>
              )}
              {discountPct && (
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-1">
                  <Tag size={10} />
                  {discountPct}% off
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {p.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-sans text-2xl font-bold text-foreground">
                {formatPrice(variantPrice)}
              </span>
              {salePrice && (
                <span className="font-sans text-lg text-muted-foreground line-through">
                  {formatPrice(basePrice + (selectedVariant?.price_diff ?? 0))}
                </span>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
                    Color
                  </span>
                  {selectedColor && (
                    <span className="text-xs font-sans text-muted-foreground">
                      {selectedColor}
                    </span>
                  )}
                </div>
                <ColorSelector
                  colors={colors}
                  selected={selectedColor}
                  onSelect={handleColorSelect}
                />
              </div>
            )}

            {/* Size selector */}
            <div id="size-selector" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-sans font-bold uppercase tracking-widest",
                  sizeError ? "text-destructive" : "text-foreground"
                )}>
                  Size
                  {sizeError && (
                    <span className="ml-2 text-destructive font-normal normal-case tracking-normal">
                      — please select a size
                    </span>
                  )}
                </span>
                <button className="text-xs font-sans text-primary hover:underline underline-offset-2">
                  Size guide
                </button>
              </div>
              <SizeSelector
                sizes={availableSizes}
                selected={selectedSize}
                onSelect={(size) => {
                  setSelectedSize(size);
                  setSizeError(false);
                }}
                unavailableSizes={unavailableSizes}
              />
            </div>

            {/* Stock badge */}
            {selectedVariant && (
              <div><StockBadge stock={selectedVariant.stock} /></div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-stretch gap-3 mt-1">
              <div className="flex items-stretch border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 flex items-center justify-center font-sans text-sm font-semibold border-x border-border">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => stock !== null ? Math.min(stock, q + 1) : q + 1)}
                  className="w-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <Button
                variant={addedToCart ? "dark" : "primary"}
                size="lg"
                onClick={handleAddToCart}
                disabled={!isInStock}
                icon={addedToCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                iconPosition="left"
                className="flex-1 justify-center transition-all duration-300"
              >
                {addedToCart ? "Added to Cart" : !isInStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Delivery perks */}
            <div className="border border-border divide-y divide-border mt-2">
              {[
                { icon: Truck,     title: "Nationwide Delivery", sub: "Delivered to all 47 counties" },
                { icon: RefreshCw, title: "30-Day Returns",      sub: "Easy returns & exchanges" },
                { icon: Shield,    title: "Secure Checkout",     sub: "M-Pesa & Card accepted" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 px-4 py-3">
                  <Icon size={16} className="text-primary shrink-0" strokeWidth={1.8} />
                  <div>
                    <p className="text-xs font-sans font-semibold text-foreground">{title}</p>
                    <p className="text-[11px] font-sans text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {p.description && (
              <div className="pt-2">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-foreground mb-2">
                  About this product
                </p>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground border border-border px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}