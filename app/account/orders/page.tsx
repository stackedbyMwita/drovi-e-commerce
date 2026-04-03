"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_ref: string | null;
  total_amount: number;
  delivery_fee: number;
  order_items: { quantity: number }[];
};

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Confirmed", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped:   { label: "Shipped",   classes: "bg-purple-50 text-purple-700 border-purple-200" },
  delivered: { label: "Delivered", classes: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-700 border-red-200" },
};

function fmt(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrdersPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, created_at, status, payment_method, payment_ref, total_amount, delivery_fee, order_items(quantity)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <Package size={18} className="text-primary" />
        <h1 className="font-serif text-2xl font-bold text-foreground">My Orders</h1>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 gap-4">
          <div className="w-16 h-16 bg-accent border border-border flex items-center justify-center">
            <ShoppingBag size={28} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-serif text-xl font-bold text-foreground mb-1">No orders yet</p>
            <p className="font-sans text-sm text-muted-foreground">Your orders will appear here once you make a purchase.</p>
          </div>
          <Button variant="primary" size="sm" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
            const itemCount = order.order_items.reduce((s, i) => s + i.quantity, 0);
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="border border-border hover:border-primary transition-colors p-4 md:p-5 flex items-center gap-4 group"
              >
                {/* Status dot */}
                <div className="shrink-0 hidden sm:block">
                  <div className={cn("text-[11px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 border", status.classes)}>
                    {status.label}
                  </div>
                </div>

                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-sans text-sm font-bold text-foreground">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <div className={cn("sm:hidden text-[11px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 border", status.classes)}>
                      {status.label}
                    </div>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    {fmtDate(order.created_at)} · {itemCount} item{itemCount !== 1 ? "s" : ""} · {order.payment_method === "mpesa" ? "M-Pesa" : "Card"}
                  </p>
                  {order.payment_ref && (
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      Ref: {order.payment_ref}
                    </p>
                  )}
                </div>

                {/* Amount + chevron */}
                <div className="shrink-0 flex items-center gap-3">
                  <p className="font-sans text-sm font-bold text-foreground">{fmt(order.total_amount)}</p>
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}