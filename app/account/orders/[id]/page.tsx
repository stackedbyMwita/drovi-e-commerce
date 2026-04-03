"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, Smartphone, Package, Check, Truck, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  product_variants: {
    size: string;
    color: string;
    products: {
      name: string;
      slug: string;
      product_images: { cloudinary_url: string; is_primary: boolean }[];
    };
  };
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_ref: string | null;
  mpesa_phone: string | null;
  total_amount: number;
  delivery_fee: number;
  addresses: {
    county: string;
    town: string;
    area: string;
  } | null;
  order_items: OrderItem[];
};

function fmt(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const TIMELINE: Record<string, { steps: string[]; icon: any; color: string }> = {
  pending:   { steps: ["Order placed"],                                           icon: Clock,    color: "text-yellow-600" },
  confirmed: { steps: ["Order placed", "Order confirmed"],                        icon: Check,    color: "text-blue-600"   },
  shipped:   { steps: ["Order placed", "Order confirmed", "Shipped"],             icon: Truck,    color: "text-purple-600" },
  delivered: { steps: ["Order placed", "Order confirmed", "Shipped", "Delivered"],icon: Check,    color: "text-green-600"  },
  cancelled: { steps: ["Order placed", "Cancelled"],                              icon: XCircle,  color: "text-red-600"    },
};

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped:   "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select(`
        id, created_at, status, payment_method, payment_status, payment_ref, mpesa_phone,
        total_amount, delivery_fee,
        addresses(county, town, area),
        order_items(
          id, quantity, unit_price,
          product_variants(
            size, color,
            products(name, slug, product_images(cloudinary_url, is_primary))
          )
        )
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) { setNotFoundState(true); return; }
        setOrder(data as unknown as Order);
      });
  }, [user, id]);

  if (loading) return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-muted animate-pulse" />
      <div className="h-32 bg-muted animate-pulse" />
      <div className="h-48 bg-muted animate-pulse" />
    </div>
  );

  if (notFoundState) return notFound();
  if (!order) return null;

  const timeline = TIMELINE[order.status] ?? TIMELINE.pending;
  const subtotal = order.total_amount - order.delivery_fee;
  const address = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <Link
          href="/account/orders"
          className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          All Orders
        </Link>
        <span className="text-border">·</span>
        <h1 className="font-serif text-xl font-bold text-foreground">
          Order #{order.id.slice(0,8).toUpperCase()}
        </h1>
        <div className={cn("ml-auto text-[11px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 border", STATUS_STYLES[order.status] ?? STATUS_STYLES.pending)}>
          {order.status}
        </div>
      </div>

      <p className="font-sans text-xs text-muted-foreground mb-6">
        Placed on {fmtDate(order.created_at)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* ── Order timeline ── */}
          <section className="border border-border p-5">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
              Order Status
            </h2>
            <div className="flex items-center gap-0">
              {(["Placed", "Confirmed", "Shipped", "Delivered"] as const).map((stepLabel, i) => {
                const reached = timeline.steps.some(s => s.toLowerCase().includes(stepLabel.toLowerCase().split(" ")[0]));
                const isCancelled = order.status === "cancelled";
                const active = reached && !isCancelled;
                return (
                  <div key={stepLabel} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "w-7 h-7 border-2 flex items-center justify-center transition-colors",
                        active ? "bg-primary border-primary" : "border-border bg-background"
                      )}>
                        {active && <Check size={12} className="text-primary-foreground" />}
                      </div>
                      <p className={cn(
                        "text-[10px] font-sans mt-1.5 text-center leading-tight",
                        active ? "text-primary font-semibold" : "text-muted-foreground"
                      )}>
                        {stepLabel}
                      </p>
                    </div>
                    {i < 3 && (
                      <div className={cn("h-0.5 flex-1 -mt-4 transition-colors", active ? "bg-primary" : "bg-border")} />
                    )}
                  </div>
                );
              })}
            </div>
            {order.status === "cancelled" && (
              <p className="font-sans text-xs text-destructive mt-4 flex items-center gap-1.5">
                <XCircle size={12} />
                This order was cancelled.
              </p>
            )}
          </section>

          {/* ── Order items ── */}
          <section className="border border-border">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Items ({order.order_items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {order.order_items.map((item) => {
                const variant = item.product_variants;
                const product = variant?.products;
                const images = product?.product_images ?? [];
                const img = images.find(i => i.is_primary)?.cloudinary_url ?? images[0]?.cloudinary_url;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="w-16 h-20 bg-muted shrink-0 overflow-hidden">
                      {img && <img src={img} alt={product?.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product?.slug ?? "#"}`}
                        className="font-sans text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {product?.name ?? "Product"}
                      </Link>
                      <p className="font-sans text-xs text-muted-foreground mt-0.5">
                        {variant?.color} · Size {variant?.size}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-sans text-sm font-bold text-foreground">
                        {fmt(item.unit_price * item.quantity)}
                      </p>
                      <p className="font-sans text-[11px] text-muted-foreground">
                        {fmt(item.unit_price)} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Order summary */}
          <section className="border border-border p-5">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Order Summary
            </h2>
            <div className="flex flex-col gap-2.5 text-sm font-sans">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                {order.delivery_fee === 0
                  ? <span className="text-green-600 font-semibold">Free</span>
                  : <span className="font-semibold text-foreground">{fmt(order.delivery_fee)}</span>
                }
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>{fmt(order.total_amount)}</span>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="border border-border p-5">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Payment
            </h2>
            <div className="flex items-center gap-2 mb-2">
              {order.payment_method === "mpesa"
                ? <Smartphone size={14} className="text-green-600" />
                : <CreditCard size={14} className="text-primary" />
              }
              <span className="font-sans text-sm font-semibold text-foreground capitalize">
                {order.payment_method === "mpesa" ? "M-Pesa" : "Card"}
              </span>
              <span className={cn(
                "ml-auto text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border",
                order.payment_status === "paid"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              )}>
                {order.payment_status}
              </span>
            </div>
            {order.mpesa_phone && (
              <p className="font-sans text-xs text-muted-foreground">{order.mpesa_phone}</p>
            )}
            {order.payment_ref && (
              <p className="font-mono text-xs text-muted-foreground mt-1">Ref: {order.payment_ref}</p>
            )}
          </section>

          {/* Delivery address */}
          {address && (
            <section className="border border-border p-5">
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Delivery Address
              </h2>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-sans text-sm text-foreground">
                    {address.area}, {address.town}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">{address.county}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}