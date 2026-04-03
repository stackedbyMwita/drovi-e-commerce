"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, LogIn, UserPlus, Tag
} from "lucide-react";
import { Container, FullBleed } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

// Delivery fee logic — free over 5000, else 300
function calcDelivery(subtotal: number) {
  return subtotal >= 5000 ? 0 : 300;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sub = mounted ? subtotal() : 0;
  const delivery = calcDelivery(sub);
  const total = sub + delivery;
  const cartItems = mounted ? items : [];

  function handleCheckout() {
    if (!user) {
      // Redirect to login, then back to checkout after sign-in
      router.push("/auth/login?redirectTo=/checkout");
      return;
    }
    router.push("/checkout");
  }

  // ── Empty cart ──────────────────────────────────────────────
  if (mounted && cartItems.length === 0) {
    return (
      <main>
        <Container className="py-20 flex flex-col items-center text-center gap-6 max-w-md mx-auto">
          <div className="w-20 h-20 bg-accent border border-primary/20 flex items-center justify-center mx-auto">
            <ShoppingBag size={32} className="text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Your cart is empty
            </h1>
            <p className="font-sans text-sm text-muted-foreground">
              Looks like you haven't added anything yet.
            </p>
          </div>
          <Button variant="primary" size="lg" icon={<ArrowRight size={16} />} iconPosition="right" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </Container>
      </main>
    );
  }

  return (
    <main>
      {/* Page header bar */}
      <FullBleed className="border-b border-border">
        <Container className="py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Your Cart
          </h1>
          <span className="font-sans text-sm text-muted-foreground">
            {mounted ? cartItems.reduce((s, i) => s + i.quantity, 0) : 0} item
            {cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
          </span>
        </Container>
      </FullBleed>

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">

          {/* ── Cart items ── */}
          <div className="lg:col-span-2 flex flex-col gap-0 border border-border divide-y divide-border">
            {cartItems.map((item) => (
              <div key={item.variantId} className="flex gap-4 p-4 md:p-5">
                {/* Image */}
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <div className="w-20 h-24 md:w-24 md:h-28 bg-muted overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Color swatch */}
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-widest">
                        {item.color}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-widest">
                        Size {item.size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Qty stepper */}
                    <div className="flex items-stretch border border-border">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center font-sans text-sm font-semibold border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Line price */}
                      <span className="font-sans text-sm font-bold text-foreground">
                        {fmt(item.price * item.quantity)}
                      </span>
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear cart */}
            <div className="p-4 flex justify-end">
              <button
                onClick={clearCart}
                className="font-sans text-xs text-muted-foreground hover:text-destructive transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                Clear cart
              </button>
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-foreground mb-5">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{fmt(sub)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  {delivery === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    <span className="font-semibold">{fmt(delivery)}</span>
                  )}
                </div>

                {delivery > 0 && (
                  <div className="flex items-center gap-2 bg-accent px-3 py-2 border border-primary/20">
                    <Tag size={12} className="text-primary shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      Spend{" "}
                      <span className="text-foreground font-semibold">
                        {fmt(5000 - sub)}
                      </span>{" "}
                      more for free delivery
                    </p>
                  </div>
                )}

                <div className="h-px bg-border my-1" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-foreground">{fmt(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="mt-6 flex flex-col gap-3">
                {!authLoading && !user ? (
                  <>
                    {/* Not logged in — show auth prompt */}
                    <div className="border border-border p-4 bg-accent/50 mb-1">
                      <p className="font-sans text-xs text-muted-foreground text-center mb-3">
                        Sign in to proceed to checkout
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<LogIn size={14} />}
                          className="w-full justify-center"
                          onClick={() => router.push("/auth/login?redirectTo=/checkout")}
                        >
                          Sign In
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<UserPlus size={14} />}
                          className="w-full justify-center"
                          onClick={() => router.push("/auth/signup?redirectTo=/checkout")}
                        >
                          Create Account
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                    className="w-full justify-center"
                    onClick={handleCheckout}
                    loading={authLoading}
                  >
                    Proceed to Checkout
                  </Button>
                )}

                <Button variant="outline" size="sm" className="w-full justify-center" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="mt-5 pt-5 border-t border-border flex flex-col gap-2">
                {["M-Pesa & Card accepted", "Secure 256-bit encryption", "30-day return policy"].map((s) => (
                  <p key={s} className="font-sans text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full shrink-0" />
                    {s}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}