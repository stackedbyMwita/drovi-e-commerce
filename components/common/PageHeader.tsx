"use client";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  imageSrc?: string;         // Cloudinary or local URL
  imageAlt?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  overlay?: "light" | "dark" | "red";
  breadcrumbs?: { label: string; href?: string }[];
};

// Default header images per page context — swap with Cloudinary URLs later
const DEFAULT_IMAGES: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80",
  women: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
  kids: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&q=80",
  products: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80",
  cart: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
  checkout: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
  account: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80",
  orders: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
  default: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80",
};

const OVERLAY_STYLES = {
  dark: "bg-black/60",
  light: "bg-white/30",
  red: "bg-primary/70",
};

const SIZES = {
  sm: "h-[160px] md:h-[200px]",
  md: "h-[220px] md:h-[280px]",
  lg: "h-[300px] md:h-[400px]",
};

export function PageHeader({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  size = "md",
  align = "left",
  overlay = "dark",
  breadcrumbs,
}: PageHeaderProps) {
  // Auto-detect image from title if not provided
  const autoImage =
    imageSrc ??
    DEFAULT_IMAGES[title.toLowerCase()] ??
    DEFAULT_IMAGES.default;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        SIZES[size]
      )}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
        style={{ backgroundImage: `url('${autoImage}')` }}
        aria-hidden="true"
      />

      {/* Overlay */}
      <div className={cn("absolute inset-0", OVERLAY_STYLES[overlay])} />

      {/* Left red border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 h-full max-w-7xl mx-auto px-4 md:px-6",
          "flex flex-col justify-end pb-8",
          align === "center" && "items-center text-center"
        )}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 mb-3">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="text-white/40 text-xs">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-white/70 hover:text-white text-xs font-sans uppercase tracking-widest transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-white/50 text-xs font-sans uppercase tracking-widest">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1
          className={cn(
            "font-serif font-bold text-white leading-tight",
            size === "sm" && "text-3xl md:text-4xl",
            size === "md" && "text-4xl md:text-5xl",
            size === "lg" && "text-5xl md:text-6xl lg:text-7xl"
          )}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 font-sans text-white/80 text-sm md:text-base max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
