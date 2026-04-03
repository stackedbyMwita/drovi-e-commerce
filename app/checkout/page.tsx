"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { Container, FullBleed } from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";

import { StepBar, type CheckoutStep } from "@/components/checkout/StepBar";
import { AddressStep, type AddressForm, type DeliveryZone } from "@/components/checkout/AddressStep";
import { PaymentStep, type PaymentMethod } from "@/components/checkout/PaymentStep";
import { OrderConfirmed } from "@/components/checkout/OrderConfirmed";
import { OrderSummary } from "@/components/checkout/OrderSummary";

function fmt(n: number) { return `KES ${n.toLocaleString("en-KE")}`; }

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, subtotal, clearCart } = useCartStore();
  const supabase = createClient();

  // ── Core state ──────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [step, setStep]       = useState<CheckoutStep>("address");

  // ── Address state ───────────────────────────────────────────
  const [savedAddress, setSavedAddress]           = useState<{ id: string; county: string; town: string; area: string } | null | false>(null);
  const [usingSavedAddress, setUsingSavedAddress] = useState(false);
  const [deliveryZones, setDeliveryZones]         = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone]           = useState<DeliveryZone | null>(null);
  const [countyOpen, setCountyOpen]               = useState(false);
  const [addressForm, setAddressForm]             = useState<AddressForm>({ full_name: "", phone: "", county: "", town: "", area: "" });
  const [addressErrors, setAddressErrors]         = useState<Partial<AddressForm & { county: string }>>({});

  // ── Payment state ───────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [mpesaPhone, setMpesaPhone]       = useState("");
  const [cardData, setCardData]           = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [payErrors, setPayErrors]         = useState<{ phone_pay?: string }>({});

  // ── Order result ────────────────────────────────────────────
  const [orderRef, setOrderRef] = useState<string | null>(null);

  // ── Init ────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (profile) {
      setAddressForm((f) => ({ ...f, full_name: profile.full_name ?? "", phone: profile.phone ?? "" }));
      setMpesaPhone(profile.phone ?? "");
    }
  }, [profile]);

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !user) router.replace("/auth/login?redirectTo=/checkout");
  }, [mounted, user]);

  // Load saved default address
  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("id, county, town, area")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSavedAddress(data);
          setUsingSavedAddress(true);
          setAddressForm((f) => ({ ...f, county: data.county, town: data.town, area: data.area }));
        } else {
          setSavedAddress(false);
        }
      });
  }, [user]);

  // Load all delivery zones, then match saved address county
  useEffect(() => {
    supabase
      .from("delivery_zones")
      .select("county, delivery_fee, estimated_days")
      .eq("is_active", true)
      .order("county")
      .then(({ data }) => {
        if (!data) return;
        setDeliveryZones(data);
        setSavedAddress((saved) => {
          if (saved) {
            const match = data.find((z) => z.county === saved.county);
            if (match) setSelectedZone(match);
          }
          return saved;
        });
      });
  }, []);

  // ── Derived values ──────────────────────────────────────────
  const cartItems = mounted ? items : [];
  const sub       = mounted ? subtotal() : 0;
  const delivery  = selectedZone?.delivery_fee ?? 300;
  const total     = sub + delivery;

  // ── Address validation ──────────────────────────────────────
  function validateAddress(): boolean {
    const e: Partial<AddressForm & { county: string }> = {};
    if (!addressForm.full_name.trim()) e.full_name = "Required";
    if (!/^(?:\+254|0)[17]\d{8}$/.test(addressForm.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Kenyan number";
    if (!addressForm.county) e.county = "Select a county";
    if (!addressForm.town.trim()) e.town = "Required";
    if (!addressForm.area.trim()) e.area = "Required";
    setAddressErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCountySelect(zone: DeliveryZone) {
    setSelectedZone(zone);
    setAddressForm((f) => ({ ...f, county: zone.county }));
    setCountyOpen(false);
    if (addressErrors.county) setAddressErrors((e) => ({ ...e, county: undefined }));
  }

  function handleContinueToPayment() {
    if (usingSavedAddress || validateAddress()) {
      if (usingSavedAddress && savedAddress) {
        const zone = deliveryZones.find((z) => z.county === savedAddress.county);
        if (zone) setSelectedZone(zone);
      }
      setStep("payment");
    }
  }

  // ── Place order ─────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (paymentMethod === "mpesa") {
      if (!/^(?:\+254|0)[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, ""))) {
        setPayErrors({ phone_pay: "Enter a valid M-Pesa number" });
        return;
      }
    }

    setStep("processing");

    // Resolve address ID
    let addressId: string;

    if (usingSavedAddress && savedAddress) {
      addressId = savedAddress.id;
    } else if (savedAddress) {
      // Has a saved address but chose a new one — update it
      const { data, error } = await supabase
        .from("addresses")
        .update({ county: addressForm.county, town: addressForm.town, area: addressForm.area, postal_code: null })
        .eq("id", savedAddress.id)
        .select("id")
        .single();
      if (error) { setStep("payment"); setPayErrors({ phone_pay: error.message }); return; }
      addressId = data.id;
    } else {
      // No saved address — insert fresh
      const { data, error } = await supabase
        .from("addresses")
        .insert({ user_id: user!.id, county: addressForm.county, town: addressForm.town, area: addressForm.area, postal_code: null, is_default: true })
        .select("id")
        .single();
      if (error) { setStep("payment"); setPayErrors({ phone_pay: error.message }); return; }
      addressId = data.id;
    }

    // Simulate payment
    await new Promise((r) => setTimeout(r, paymentMethod === "mpesa" ? 2000 : 1500));

    const ref = paymentMethod === "mpesa"
      ? `MPESA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      : `CARD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        address_id: addressId,
        status: "confirmed",
        payment_method: paymentMethod,
        payment_status: "paid",
        payment_ref: ref,
        mpesa_phone: paymentMethod === "mpesa"
          ? mpesaPhone.replace(/\s/g, "").replace(/^0/, "+254")
          : null,
        total_amount: total,
        delivery_fee: delivery,
      })
      .select("id")
      .single();

    if (orderErr) { setStep("payment"); setPayErrors({ phone_pay: orderErr.message }); return; }

    // Create order items
    await supabase.from("order_items").insert(
      cartItems.map((item) => ({
        order_id: order.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.price,
      }))
    );

    setOrderRef(ref);
    clearCart();
    setStep("done");
  }

  // ── Empty cart guard ────────────────────────────────────────
  if (mounted && cartItems.length === 0 && step !== "done") {
    return (
      <Container className="py-20 text-center max-w-sm mx-auto">
        <p className="font-serif text-2xl font-bold mb-4">Your cart is empty</p>
        <Button variant="primary" asChild>
          <Link href="/products">Shop Now</Link>
        </Button>
      </Container>
    );
  }

  // ── Order confirmed ─────────────────────────────────────────
  if (step === "done" && orderRef) {
    const displayArea   = usingSavedAddress && savedAddress ? savedAddress.area   : addressForm.area;
    const displayTown   = usingSavedAddress && savedAddress ? savedAddress.town   : addressForm.town;
    const displayCounty = usingSavedAddress && savedAddress ? savedAddress.county : addressForm.county;

    return (
      <OrderConfirmed
        firstName={profile?.full_name?.split(" ")[0] ?? ""}
        orderRef={orderRef}
        fullName={addressForm.full_name}
        area={displayArea}
        town={displayTown}
        county={displayCounty}
        selectedZone={selectedZone}
      />
    );
  }

  // ── Main layout ─────────────────────────────────────────────
  return (
    <main>
      <FullBleed className="border-b border-border">
        <Container className="py-3 flex items-center justify-between">
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Cart
          </Link>
          <StepBar step={step} />
          <div className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
            <Lock size={12} />
            Secure Checkout
          </div>
        </Container>
      </FullBleed>

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">

          {/* Left: Address or Payment */}
          <div className="lg:col-span-3">
            {step === "address" && (
              <AddressStep
                savedAddress={savedAddress}
                usingSavedAddress={usingSavedAddress}
                setUsingSavedAddress={setUsingSavedAddress}
                addressForm={addressForm}
                setAddressForm={setAddressForm}
                errors={addressErrors}
                setErrors={setAddressErrors}
                deliveryZones={deliveryZones}
                selectedZone={selectedZone}
                countyOpen={countyOpen}
                setCountyOpen={setCountyOpen}
                onCountySelect={handleCountySelect}
                onContinue={handleContinueToPayment}
              />
            )}

            {(step === "payment" || step === "processing") && (
              <PaymentStep
                addressForm={addressForm}
                savedAddress={savedAddress}
                usingSavedAddress={usingSavedAddress}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                mpesaPhone={mpesaPhone}
                setMpesaPhone={setMpesaPhone}
                cardData={cardData}
                setCardData={setCardData}
                errors={payErrors}
                setErrors={setPayErrors}
                total={total}
                processing={step === "processing"}
                onBack={() => setStep("address")}
                onPay={handlePlaceOrder}
              />
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <OrderSummary
              items={cartItems}
              sub={sub}
              delivery={delivery}
              total={total}
              county={addressForm.county}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}