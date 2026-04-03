"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container, FullBleed } from "@/components/common/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  FilterSidebar,
  FilterDrawer,
  FilterTrigger,
  type FilterState,
} from "@/components/filters/FilterSidebar";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{ gender: string; category: string }>;
};

const VALID_GENDERS = ["men", "women", "kids"];

const CATEGORY_NAMES: Record<string, string> = {
  "t-shirts":    "T-Shirts",
  "shirts":      "Shirts",
  "trousers":    "Trousers",
  "sweaters":    "Sweaters",
  "hoodies":     "Hoodies",
  "sweat-suits": "Sweat Suits",
  "shoes":       "Shoes",
};

const SORT_OPTIONS = [
  { label: "Featured",    value: "featured" },
  { label: "Newest",      value: "newest" },
  { label: "Price: Low",  value: "price_asc" },
  { label: "Price: High", value: "price_desc" },
  { label: "On Sale",     value: "sale" },
];

const DEFAULT_FILTERS: FilterState = {
  gender: [],
  categories: [],
  sizes: [],
  colors: [],
  priceMin: 0,
  priceMax: 15000,
  inStockOnly: false,
  onSaleOnly: false,
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const { gender, category } = use(params);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);

  if (!VALID_GENDERS.includes(gender)) notFound();
  if (!CATEGORY_NAMES[category]) notFound();

  const categoryName = CATEGORY_NAMES[category];
  const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1);
  const pageTitle = `${genderLabel}'s ${categoryName}`;

  const { data, isLoading } = useProducts({ gender, categorySlug: category, filters, page });

  const activeFilterCount = [
    ...filters.sizes,
    ...filters.colors,
    filters.inStockOnly ? ["x"] : [],
    filters.onSaleOnly ? ["x"] : [],
  ].flat().length + (filters.priceMax < 15000 ? 1 : 0);

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  function handleFilterChange(f: FilterState) {
    setFilters(f);
    setPage(1);
  }

  return (
    <main>
      <FullBleed>
        <PageHeader
          title={pageTitle}
          size="sm"
          breadcrumbs={[
            { label: "Home",      href: "/" },
            { label: genderLabel, href: `/${gender}` },
            { label: categoryName },
          ]}
        />
      </FullBleed>

      <Container className="py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <FilterTrigger
            onClick={() => setDrawerOpen(true)}
            activeCount={activeFilterCount}
          />

          {/* Sort dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 border border-border",
                "text-xs font-sans font-semibold uppercase tracking-widest",
                "hover:border-primary hover:text-primary transition-colors",
                sortOpen && "border-primary text-primary"
              )}
            >
              <ArrowUpDown size={14} />
              Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </button>

            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border shadow-md z-20">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-xs font-sans font-semibold uppercase tracking-widest",
                        "transition-colors hover:bg-accent",
                        sort === opt.value ? "text-primary bg-accent" : "text-foreground"
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

        {/* Sidebar + grid */}
        <div className="flex gap-8">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            productCount={data?.totalCount}
          />
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={data?.products ?? []}
              isLoading={isLoading}
              totalCount={data?.totalCount ?? 0}
              page={page}
              pageSize={20}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </Container>

      <FilterDrawer
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        productCount={data?.totalCount}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />
    </main>
  );
}