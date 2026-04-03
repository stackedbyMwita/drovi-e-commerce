import { cn } from "@/lib/utils";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

type StockBadgeProps = {
  stock: number;
  showCount?: boolean;
  size?: "sm" | "md";
};

function getStatus(stock: number): StockStatus {
  if (stock === 0) return "out_of_stock";
  if (stock <= 5) return "low_stock";
  if (stock < 0) return "preorder"; // use -1 as sentinel for preorder
  return "in_stock";
}

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; dot: string; badge: string }
> = {
  in_stock: {
    label: "In Stock",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  low_stock: {
    label: "Low Stock",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  out_of_stock: {
    label: "Out of Stock",
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
  preorder: {
    label: "Preorder",
    dot: "bg-primary",
    badge: "bg-accent text-primary border-primary/30",
  },
};

export function StockBadge({ stock, showCount = false, size = "md" }: StockBadgeProps) {
  const status = getStatus(stock);
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-sans font-semibold uppercase tracking-widest",
        size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]",
        config.badge
      )}
    >
      <span className={cn("rounded-full shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2", config.dot)} />
      {config.label}
      {showCount && status === "low_stock" && ` — ${stock} left`}
    </span>
  );
}
