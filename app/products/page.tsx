"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, X, Search } from "lucide-react";
import { Container, FullBleed } from "@/components/common/Container";
import {
  FilterSidebar,
  FilterDrawer,
  FilterTrigger,
  type FilterState,
} from "@/components/filters/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "featured",   label: "Featured"          },
  { value: "newest",     label: "Newest"            },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "sale",       label: "On Sale"           },
];

const DEFAULT_FILTERS: FilterState = {
  gender:      [],
  categories:  [],
  sizes:       [],
  colors:      [],
  priceMin:    0,
  priceMax:    15000,
  inStockOnly: false,
  onSaleOnly:  false,
};

// ── Gender quick-pill bar ──────────────────────────────────────
const GENDERS = [
  { label: "Men",   value: "men"   },
  { label: "Women", value: "women" },
  { label: "Kids",  value: "kids"  },
];

function ProductsContent() {
  const searchParams = useSearchParams();

  const initGender = searchParams.get("gender") ?? "";
  const initSale   = searchParams.get("sale") === "true";
  const initSearch = searchParams.get("q") ?? "";

  const [filters, setFilters]         = useState<FilterState>({
    ...DEFAULT_FILTERS,
    gender:     initGender ? [initGender.toLowerCase()] : [],
    onSaleOnly: initSale,
  });
  const [sort, setSort]               = useState("featured");
  const [sortOpen, setSortOpen]       = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState(initSearch);
  const [search, setSearch]           = useState(initSearch);

  // Debounce search input → search state
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter/sort change
  useEffect(() => { setPage(1); }, [filters, sort]);

  const { data, isLoading } = useProducts({
    genders:  filters.gender.length > 0 ? filters.gender : undefined,
    filters,
    page,
    search,
    sort: sort as any,
  });

  const products   = data?.products   ?? [];
  const totalCount = data?.totalCount ?? 0;

  const activeFilterCount = [
    ...filters.categories,
    ...filters.sizes,
    ...filters.colors,
    filters.inStockOnly ? ["x"] : [],
    filters.onSaleOnly  ? ["x"] : [],
  ].flat().length + (filters.priceMax < 15000 ? 1 : 0) + (filters.priceMin > 0 ? 1 : 0);

  // Total active including gender (for mobile badge)
  const totalActiveCount = activeFilterCount + filters.gender.length;

  function handleReset() { setFilters(DEFAULT_FILTERS); setPage(1); }

  function toggleGender(value: string) {
    setFilters(f => ({
      ...f,
      gender: f.gender.includes(value)
        ? f.gender.filter(g => g !== value)
        : [...f.gender, value],
    }));
  }

  return (
    <>
      {/* ── Header ── */}
      <FullBleed className="border-b border-border bg-background">
        <Container className="py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Drovi Store
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                All Products
              </h1>
              <p className="font-sans text-sm text-muted-foreground mt-1 h-5">
                {!isLoading && (
                  <>
                    {totalCount.toLocaleString()} product{totalCount !== 1 ? "s" : ""}
                    {search && <> for &ldquo;<span className="text-foreground font-semibold">{search}</span>&rdquo;</>}
                  </>
                )}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-9 py-2.5 font-sans text-sm bg-background text-foreground border border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); setSearch(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Gender quick-pills */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            {GENDERS.map(g => {
              const active = filters.gender.includes(g.value);
              return (
                <button
                  key={g.value}
                  onClick={() => toggleGender(g.value)}
                  className={cn(
                    "px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-widest border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                  )}
                >
                  {g.label}
                </button>
              );
            })}

            {/* Active chip: On Sale */}
            {filters.onSaleOnly && (
              <button
                onClick={() => setFilters(f => ({ ...f, onSaleOnly: false }))}
                className="flex items-center gap-1 px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-widest border bg-primary text-primary-foreground border-primary"
              >
                Sale <X size={11} />
              </button>
            )}

            {/* Clear all */}
            {(totalActiveCount > 0 || filters.gender.length > 0) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs text-muted-foreground border border-border hover:border-destructive hover:text-destructive transition-colors ml-1"
              >
                <X size={11} />
                Clear all
              </button>
            )}
          </div>
        </Container>
      </FullBleed>

      {/* ── Body ── */}
      <Container className="py-8">
        <div className="flex gap-8 items-start">

          {/* Desktop sidebar — fixed width, positioned normally */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <FilterSidebar
              filters={filters}
              onChange={f => { setFilters(f); setPage(1); }}
              onReset={handleReset}
              productCount={totalCount}
              showGender={false}  /* gender handled by quick-pills above */
            />
          </aside>

          {/* Products column */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile: filter trigger */}
                <div className="lg:hidden">
                  <FilterTrigger
                    activeCount={totalActiveCount}
                    onClick={() => setDrawerOpen(true)}
                  />
                </div>
                {/* Mobile: result count */}
                <p className="text-xs font-sans text-muted-foreground lg:hidden">
                  {isLoading ? "…" : `${totalCount} result${totalCount !== 1 ? "s" : ""}`}
                </p>
                {/* Desktop: active filter chips */}
                {activeFilterCount > 0 && (
                  <p className="hidden lg:block text-xs font-sans text-muted-foreground">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                  </p>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(o => !o)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 border font-sans text-xs font-bold uppercase tracking-widest transition-colors",
                    sortOpen
                      ? "border-primary text-primary"
                      : "border-border text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label}
                  <ChevronDown size={13} className={cn("transition-transform duration-200", sortOpen && "rotate-180")} />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 top-full mt-px z-20 bg-background border border-border w-52 shadow-lg">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 font-sans text-xs transition-colors hover:bg-accent",
                            sort === opt.value ? "text-primary font-bold" : "text-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <ProductGrid
              products={products}
              isLoading={isLoading}
              totalCount={totalCount}
              page={page}
              pageSize={20}
              onPageChange={setPage}
            />
          </div>
        </div>
      </Container>

      {/* Mobile drawer — includes gender since it's the full filter surface */}
      <FilterDrawer
        filters={filters}
        onChange={f => { setFilters(f); setPage(1); }}
        onReset={handleReset}
        productCount={totalCount}
        showGender={true}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <Container className="py-16">
        <div className="h-8 w-48 bg-muted animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      </Container>
    }>
      <ProductsContent />
    </Suspense>
  );
}