"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorOption = {
  color: string;
  color_hex: string | null;
};

type ColorSelectorProps = {
  colors: ColorOption[];
  selected: string | null;
  onSelect: (color: string) => void;
  unavailableColors?: string[];
};

export function ColorSelector({
  colors,
  selected,
  onSelect,
  unavailableColors = [],
}: ColorSelectorProps) {
  // Deduplicate by color name
  const unique = colors.filter(
    (c, i, arr) => arr.findIndex((x) => x.color === c.color) === i
  );

  return (
    <div className="flex flex-wrap gap-2.5">
      {unique.map(({ color, color_hex }) => {
        const isSelected = selected === color;
        const isUnavailable = unavailableColors.includes(color);
        const bg = color_hex ?? "#e5e7eb";

        return (
          <button
            key={color}
            title={color}
            onClick={() => !isUnavailable && onSelect(color)}
            disabled={isUnavailable}
            className={cn(
              "relative w-9 h-9 border-2 transition-all duration-150 group",
              isSelected
                ? "border-primary scale-110 shadow-sm"
                : "border-transparent hover:border-border hover:scale-105",
              isUnavailable && "opacity-40 cursor-not-allowed"
            )}
            style={{ backgroundColor: bg }}
            aria-label={color}
          >
            {/* Check mark for selected */}
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check
                  size={14}
                  // Use white or dark check depending on bg lightness
                  className={isLightColor(bg) ? "text-foreground" : "text-white"}
                  strokeWidth={3}
                />
              </span>
            )}

            {/* Tooltip */}
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-sans text-foreground bg-background border border-border px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {color}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Simple heuristic to determine if a hex color is light
function isLightColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Perceived luminance formula
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}