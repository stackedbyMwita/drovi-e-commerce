"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price: number | null;
  gender: string;
  product_images: { cloudinary_url: string; is_primary: boolean }[];
};

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, slug, base_price, sale_price, gender,
          product_images(cloudinary_url, is_primary)
        `)
        .ilike("name", `%${value}%`)
        .eq("is_active", true)
        .limit(6);

      setResults(data ?? []);
      setLoading(false);
    }, 300);
  }

  function handleSelect(slug: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/products/${slug}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  }

  const formatPrice = (price: number) =>
    `KES ${price.toLocaleString("en-KE")}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-sans",
          "text-muted-foreground hover:text-foreground",
          "border border-transparent hover:border-border",
          "transition-all duration-200",
          open && "border-border text-foreground"
        )}
        aria-label="Search products"
      >
        <Search size={18} />
        <span className="hidden md:inline text-sm tracking-wide">Search</span>
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute right-0 top-full mt-1 w-[520px] max-w-[95vw]",
          "bg-background border border-border",
          "shadow-md z-50",
          "transition-all duration-200 origin-top",
          open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-border">
          <Search size={16} className="ml-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for products, categories..."
            className={cn(
              "flex-1 px-3 py-4 text-sm font-sans bg-transparent",
              "placeholder:text-muted-foreground outline-none",
              "text-foreground"
            )}
          />
          {loading && <Loader2 size={16} className="mr-3 animate-spin text-muted-foreground" />}
          {query && !loading && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); }}
              className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-[400px] overflow-y-auto divide-y divide-border">
            {results.map((product) => {
              const primaryImage = product.product_images?.find((i) => i.is_primary)
                ?? product.product_images?.[0];
              const price = product.sale_price ?? product.base_price;

              return (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelect(product.slug)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors text-left group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-14 bg-muted shrink-0 overflow-hidden">
                      {primaryImage && (
                        <img
                          src={primaryImage.cloudinary_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-sm text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {product.gender}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="font-sans font-semibold text-sm text-primary">
                        {formatPrice(price)}
                      </p>
                      {product.sale_price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.base_price)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}

            {/* View all */}
            <li>
              <button
                onClick={handleSubmit as any}
                className="w-full px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest text-primary hover:bg-accent transition-colors text-center"
              >
                View all results for "{query}"
              </button>
            </li>
          </ul>
        )}

        {/* Empty state */}
        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground font-sans">
              No products found for <span className="text-foreground font-semibold">"{query}"</span>
            </p>
          </div>
        )}

        {/* Hints when empty */}
        {query.length < 2 && (
          <div className="px-4 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-3">
              Browse by
            </p>
            <div className="flex gap-2 flex-wrap">
              {["Men", "Women", "Kids", "T-Shirts", "Hoodies", "Shoes"].map((hint) => (
                <button
                  key={hint}
                  onClick={() => handleSearch(hint)}
                  className="px-3 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}