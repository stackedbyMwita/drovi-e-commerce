"use client";

import { CartItem } from "@/store/cartStore";

type DeliveryZone = {
  county: string;
  delivery_fee: number;
  estimated_days: string;
};

function fmt(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

type Props = {
  items: CartItem[];
  sub: number;
  delivery: number;
  total: number;
  county: string;
};

export function OrderSummary({ items, sub, delivery, total, county }: Props) {
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="border border-border sticky top-24">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Order Summary ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </h3>
      </div>

      {/* Items */}
      <div className="divide-y divide-border max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-3 px-5 py-3">
            <div className="w-12 h-14 bg-muted shrink-0 overflow-hidden">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs font-semibold text-foreground truncate">
                {item.productName}
              </p>
              <p className="font-sans text-[11px] text-muted-foreground">
                {item.color} · Size {item.size} · ×{item.quantity}
              </p>
            </div>
            <span className="font-sans text-xs font-bold text-foreground shrink-0">
              {fmt(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-t border-border flex flex-col gap-2.5 text-sm font-sans">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground">{fmt(sub)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery{county ? ` to ${county}` : ""}</span>
          {delivery === 0
            ? <span className="text-green-600 font-semibold">Free</span>
            : <span className="font-semibold text-foreground">{fmt(delivery)}</span>}
        </div>
        <div className="h-px bg-border" />
        <div className="flex justify-between text-base font-bold text-foreground">
          <span>Total</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}