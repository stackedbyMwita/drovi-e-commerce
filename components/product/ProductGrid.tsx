"use client";

import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { Button } from "@/components/common/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: ProductCardData[];
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
};

function SkeletonCard() {
  return (
    <div className="border border-border">
      <div className="aspect-[3/4] bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted animate-pulse w-1/3" />
        <div className="h-4 bg-muted animate-pulse w-3/4" />
        <div className="h-4 bg-muted animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading = false,
  totalCount = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
}: ProductGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-2xl font-semibold text-foreground mb-2">
          No products found
        </p>
        <p className="font-sans text-sm text-muted-foreground">
          Try adjusting your filters or browse a different category.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Count */}
      <p className="text-xs font-sans text-muted-foreground mb-5 uppercase tracking-widest">
        {totalCount} product{totalCount !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className={cn(
              "w-9 h-9 flex items-center justify-center border border-border",
              "text-muted-foreground transition-colors",
              page === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:border-primary hover:text-primary"
            )}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // show first, last, current and neighbours
              return (
                p === 1 ||
                p === totalPages ||
                Math.abs(p - page) <= 1
              );
            })
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="w-9 text-center text-sm text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center border text-sm font-sans font-semibold",
                    "transition-colors duration-150",
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className={cn(
              "w-9 h-9 flex items-center justify-center border border-border",
              "text-muted-foreground transition-colors",
              page === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "hover:border-primary hover:text-primary"
            )}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}