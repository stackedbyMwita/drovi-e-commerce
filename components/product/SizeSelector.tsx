"use client";

import { cn } from "@/lib/utils";

type SizeSelectorProps = {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
  unavailableSizes?: string[];
};

// Ordered size display
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL",
  // Shoes
  "36", "37", "38", "39", "40", "41", "42", "43", "44", "45",
  // Kids
  "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-11Y", "11-12Y",
];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function SizeSelector({
  sizes,
  selected,
  onSelect,
  unavailableSizes = [],
}: SizeSelectorProps) {
  const sorted = sortSizes(sizes);

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((size) => {
        const isUnavailable = unavailableSizes.includes(size);
        const isSelected = selected === size;

        return (
          <button
            key={size}
            onClick={() => !isUnavailable && onSelect(size)}
            disabled={isUnavailable}
            className={cn(
              "min-w-[44px] h-11 px-3 border text-sm font-sans font-semibold uppercase tracking-wide",
              "transition-all duration-150 relative",
              isUnavailable && [
                "border-border text-muted-foreground/40 cursor-not-allowed",
                // Strikethrough diagonal line
                "after:absolute after:inset-0 after:content-['']",
                "after:bg-[linear-gradient(135deg,transparent_calc(50%-0.5px),hsl(var(--border))_calc(50%-0.5px),hsl(var(--border))_calc(50%+0.5px),transparent_calc(50%+0.5px))]",
              ],
              !isUnavailable && !isSelected && [
                "border-border text-foreground",
                "hover:border-primary hover:text-primary",
              ],
              isSelected && !isUnavailable && [
                "border-primary bg-primary text-primary-foreground",
              ]
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}