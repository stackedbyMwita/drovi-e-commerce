"use client";

import { useState } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export type FilterState = {
  gender: string[];     // lowercase: "men" | "women" | "kids"
  categories: string[]; // slug: "t-shirts" | "hoodies" etc
  sizes: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
};

type FilterSidebarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  productCount?: number;
  showGender?: boolean;  // hide on gender-specific pages
  // Mobile drawer props
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
};

const GENDERS  = [
  { label: "Men",   value: "men"   },
  { label: "Women", value: "women" },
  { label: "Kids",  value: "kids"  },
];
const CATEGORIES = [
  { label: "T-Shirts",    value: "t-shirts"    },
  { label: "Shirts",      value: "shirts"      },
  { label: "Trousers",    value: "trousers"    },
  { label: "Sweaters",    value: "sweaters"    },
  { label: "Hoodies",     value: "hoodies"     },
  { label: "Sweat Suits", value: "sweat-suits" },
  { label: "Shoes",       value: "shoes"       },
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "4yrs", "6yrs", "8yrs", "10yrs", "12yrs"];
const COLORS = [
  { name: "Black",      hex: "#111111" },
  { name: "White",      hex: "#FFFFFF" },
  { name: "Red",        hex: "#DC2626" },
  { name: "Navy Blue",  hex: "#1B2A6B" },
  { name: "Sage Green", hex: "#87A878" },
  { name: "Camel",      hex: "#C19A6B" },
  { name: "Grey",       hex: "#9CA3AF" },
  { name: "Burgundy",   hex: "#800020" },
  { name: "Dusty Pink", hex: "#D4A0A0" },
  { name: "Lilac",      hex: "#C8A8E9" },
  { name: "Mint",       hex: "#98D8C8" },
  { name: "Yellow",     hex: "#FCD34D" },
  { name: "Coral",      hex: "#FF6B6B" },
  { name: "Royal Blue", hex: "#2563EB" },
];
const MAX_PRICE = 15000;

// ── Collapsible section ────────────────────────────────────────
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 text-xs font-sans font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-200", open ? "max-h-96 pb-4" : "max-h-0")}>
        {children}
      </div>
    </div>
  );
}

// ── Checkbox row ───────────────────────────────────────────────
function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <span className={cn(
        "w-4 h-4 border flex items-center justify-center shrink-0 transition-all",
        checked ? "bg-primary border-primary" : "border-border group-hover:border-primary"
      )}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm font-sans text-foreground group-hover:text-primary transition-colors">{label}</span>
    </label>
  );
}

// ── Core filter UI ─────────────────────────────────────────────
function FilterContent({ filters, onChange, onReset, productCount, showGender = true }: FilterSidebarProps) {
  function toggle(key: "gender" | "categories" | "sizes" | "colors", value: string) {
    const arr = filters[key] as string[];
    onChange({ ...filters, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] });
  }

  const activeCount = [
    ...filters.gender, ...filters.categories, ...filters.sizes, ...filters.colors,
    filters.inStockOnly ? ["x"] : [], filters.onSaleOnly ? ["x"] : [],
  ].flat().length + (filters.priceMin > 0 || filters.priceMax < MAX_PRICE ? 1 : 0);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 leading-none">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Gender — only on /products */}
      {showGender && (
        <FilterSection title="Gender">
          <div className="flex flex-col gap-0.5">
            {GENDERS.map(g => (
              <CheckboxRow
                key={g.value}
                label={g.label}
                checked={filters.gender.includes(g.value)}
                onChange={() => toggle("gender", g.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-0.5">
          {CATEGORIES.map(c => (
            <CheckboxRow
              key={c.value}
              label={c.label}
              checked={filters.categories.includes(c.value)}
              onChange={() => toggle("categories", c.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => toggle("sizes", s)}
              className={cn(
                "px-2.5 py-1 text-xs font-sans font-semibold border transition-all",
                filters.sizes.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map(({ name, hex }) => (
            <button
              key={name}
              onClick={() => toggle("colors", name)}
              title={name}
              className={cn(
                "w-7 h-7 border-2 transition-all",
                filters.colors.includes(name) ? "border-primary scale-110" : "border-border hover:border-primary hover:scale-105",
                name === "White" && "shadow-sm"
              )}
              style={{ backgroundColor: hex }}
              aria-label={name}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price (KES)">
        <div className="px-1">
          <div className="flex justify-between mb-3">
            <span className="text-xs font-sans text-muted-foreground">KES {filters.priceMin.toLocaleString()}</span>
            <span className="text-xs font-sans text-muted-foreground">KES {filters.priceMax.toLocaleString()}</span>
          </div>
          <input
            type="range" min={0} max={MAX_PRICE} step={100}
            value={filters.priceMax}
            onChange={e => onChange({ ...filters, priceMax: Number(e.target.value) })}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="flex flex-col gap-0.5">
          <CheckboxRow label="In Stock Only" checked={filters.inStockOnly} onChange={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })} />
          <CheckboxRow label="On Sale"       checked={filters.onSaleOnly}  onChange={() => onChange({ ...filters, onSaleOnly:  !filters.onSaleOnly  })} />
        </div>
      </FilterSection>

      {productCount != null && (
        <p className="text-xs font-sans text-muted-foreground text-center pt-4 mt-2 border-t border-border">
          {productCount} product{productCount !== 1 ? "s" : ""} found
        </p>
      )}
    </div>
  );
}

// ── Desktop sidebar — just the content, caller controls visibility/width ──
export function FilterSidebar(props: FilterSidebarProps) {
  return <FilterContent {...props} />;
}

// ── Mobile drawer ──────────────────────────────────────────────
export function FilterDrawer(props: FilterSidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          props.drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={props.onDrawerClose}
      />
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border max-h-[85vh] flex flex-col",
          "transition-transform duration-300 ease-out",
          props.drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <span className="font-serif text-lg font-semibold">Filters</span>
          <button onClick={props.onDrawerClose} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <FilterContent {...props} />
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="primary" className="w-full justify-center" onClick={props.onDrawerClose}>
            Show {props.productCount ?? ""} Results
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Mobile trigger ─────────────────────────────────────────────
export function FilterTrigger({ onClick, activeCount = 0 }: { onClick: () => void; activeCount?: number }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 border border-border font-sans text-xs font-semibold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
    >
      <SlidersHorizontal size={16} />
      Filters
      {activeCount > 0 && (
        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 leading-none ml-1">
          {activeCount}
        </span>
      )}
    </button>
  );
}