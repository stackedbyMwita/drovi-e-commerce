"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/hooks/useProduct";

type ImageGalleryProps = {
  images: ProductImage[];
  productName: string;
  activeColor?: string | null;
};

export function ImageGallery({ images, productName, activeColor }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Filter images by active color if one is selected, else show all
  const filtered =
    activeColor
      ? images.filter(
          (img) =>
            !img.color_variant ||
            img.color_variant.toLowerCase() === activeColor.toLowerCase()
        )
      : images;

  const displayImages = filtered.length > 0 ? filtered : images;
  const current = displayImages[activeIndex] ?? displayImages[0];

  // Reset index when color changes
  const safeIndex = activeIndex < displayImages.length ? activeIndex : 0;
  const activeSrc = displayImages[safeIndex]?.cloudinary_url;

  function prev() {
    setActiveIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  }

  function next() {
    setActiveIndex((i) => (i + 1) % displayImages.length);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 w-full">
      {/* Thumbnails — vertical strip on desktop, horizontal on mobile */}
      <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-none">
        {displayImages.map((img, i) => (
          <button
            key={img.cloudinary_id ?? i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] overflow-hidden border-2 transition-all duration-150",
              i === safeIndex
                ? "border-primary"
                : "border-transparent hover:border-border"
            )}
          >
            <img
              src={img.cloudinary_url}
              alt={img.alt_text ?? productName}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative overflow-hidden bg-muted group">
        {/* Zoom container */}
        <div
          className={cn(
            "relative w-full aspect-[3/4] overflow-hidden cursor-zoom-in",
            zoomed && "cursor-zoom-out"
          )}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={activeSrc}
            alt={current?.alt_text ?? productName}
            className={cn(
              "w-full h-full object-cover transition-transform duration-200",
              zoomed ? "scale-[1.8]" : "scale-100"
            )}
            style={
              zoomed
                ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : undefined
            }
          />

          {/* Zoom hint */}
          {!zoomed && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ZoomIn size={12} className="text-muted-foreground" />
              <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest">
                Hover to zoom
              </span>
            </div>
          )}
        </div>

        {/* Prev/Next arrows — only show when >1 image */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dot counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "transition-all duration-200",
                    i === safeIndex
                      ? "w-5 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-background/60 hover:bg-background"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}