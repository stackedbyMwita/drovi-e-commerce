"use client";

import { ArrowLeft, Check, CreditCard, Lock, Loader2, MapPin, Smartphone } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export type PaymentMethod = "mpesa" | "card";

function fmt(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

type Props = {
  addressForm: { full_name: string; phone: string; county: string; town: string; area: string };
  savedAddress: { county: string; town: string; area: string } | null | false;
  usingSavedAddress: boolean;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  mpesaPhone: string;
  setMpesaPhone: (v: string) => void;
  cardData: { number: string; expiry: string; cvv: string; name: string };
  setCardData: (fn: (c: any) => any) => void;
  errors: { phone_pay?: string };
  setErrors: (fn: (e: any) => any) => void;
  total: number;
  processing: boolean;
  onBack: () => void;
  onPay: () => void;
};

export function PaymentStep({
  addressForm, savedAddress, usingSavedAddress,
  paymentMethod, setPaymentMethod,
  mpesaPhone, setMpesaPhone,
  cardData, setCardData,
  errors, setErrors,
  total, processing,
  onBack, onPay,
}: Props) {
  const displayArea  = usingSavedAddress && savedAddress ? savedAddress.area  : addressForm.area;
  const displayTown  = usingSavedAddress && savedAddress ? savedAddress.town  : addressForm.town;
  const displayCounty = usingSavedAddress && savedAddress ? savedAddress.county : addressForm.county;

  return (
    <section>
      {/* Back */}
      <button
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors mb-5 disabled:opacity-50"
      >
        <ArrowLeft size={14} />
        Edit delivery address
      </button>

      {/* Address summary */}
      <div className="border border-border p-4 mb-6 bg-accent/30">
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">
              {addressForm.full_name}
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              {displayArea}, {displayTown}, {displayCounty} · {addressForm.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <CreditCard size={18} className="text-primary" />
        <h2 className="font-serif text-xl font-bold text-foreground">Payment Method</h2>
      </div>

      {/* Method toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {([
          { id: "mpesa" as PaymentMethod, label: "M-Pesa", Icon: Smartphone },
          { id: "card"  as PaymentMethod, label: "Card",   Icon: CreditCard },
        ]).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPaymentMethod(id)}
            disabled={processing}
            className={cn(
              "flex items-center gap-3 px-4 py-4 border-2 transition-all",
              paymentMethod === id
                ? "border-primary bg-accent/50"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <div className={cn(
              "w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-colors",
              paymentMethod === id ? "border-primary bg-primary" : "border-border"
            )}>
              {paymentMethod === id && <Check size={10} className="text-primary-foreground" />}
            </div>
            <Icon size={18} className={paymentMethod === id ? "text-primary" : "text-muted-foreground"} />
            <span className={cn(
              "font-sans text-sm font-semibold",
              paymentMethod === id ? "text-foreground" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* M-Pesa form */}
      {paymentMethod === "mpesa" && (
        <div className="flex flex-col gap-3">
          <div className="bg-green-50 border border-green-200 px-4 py-3">
            <p className="font-sans text-xs text-green-700 font-semibold">M-Pesa STK Push</p>
            <p className="font-sans text-[11px] text-green-600 mt-0.5">
              You'll receive a prompt on your phone to confirm payment of{" "}
              <strong>{fmt(total)}</strong>
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={mpesaPhone}
              onChange={(e) => {
                setMpesaPhone(e.target.value);
                if (errors.phone_pay) setErrors((e: any) => ({ ...e, phone_pay: undefined }));
              }}
              placeholder="0712 345 678"
              disabled={processing}
              className={cn(
                "w-full px-4 py-3 font-sans text-sm bg-background text-foreground border outline-none transition-colors placeholder:text-muted-foreground",
                errors.phone_pay ? "border-destructive" : "border-border focus:border-primary"
              )}
            />
            {errors.phone_pay && (
              <p className="text-[11px] text-destructive">{errors.phone_pay}</p>
            )}
          </div>
        </div>
      )}

      {/* Card form */}
      {paymentMethod === "card" && (
        <div className="flex flex-col gap-4">
          <div className="bg-accent/50 border border-border px-4 py-3">
            <p className="font-sans text-[11px] text-muted-foreground">
              This is a demo — no real card is charged.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
              Card Number
            </label>
            <input
              type="text"
              maxLength={19}
              value={cardData.number}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                const formatted = val.replace(/(.{4})/g, "$1 ").trim();
                setCardData((c) => ({ ...c, number: formatted }));
              }}
              placeholder="1234 5678 9012 3456"
              disabled={processing}
              className="w-full px-4 py-3 font-sans text-sm bg-background text-foreground border border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground font-mono tracking-wider"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">Expiry</label>
              <input
                type="text"
                maxLength={5}
                value={cardData.expiry}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCardData((c) => ({ ...c, expiry: val.length > 2 ? `${val.slice(0,2)}/${val.slice(2)}` : val }));
                }}
                placeholder="MM/YY"
                disabled={processing}
                className="w-full px-4 py-3 font-sans text-sm bg-background text-foreground border border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">CVV</label>
              <input
                type="password"
                maxLength={4}
                value={cardData.cvv}
                onChange={(e) => setCardData((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                placeholder="···"
                disabled={processing}
                className="w-full px-4 py-3 font-sans text-sm bg-background text-foreground border border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData((c) => ({ ...c, name: e.target.value }))}
              placeholder="Jane Wanjiku"
              disabled={processing}
              className="w-full px-4 py-3 font-sans text-sm bg-background text-foreground border border-border focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
            />
          </div>
          {errors.phone_pay && (
            <p className="text-[11px] text-destructive">{errors.phone_pay}</p>
          )}
        </div>
      )}

      {/* Pay button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full justify-center mt-6"
        onClick={onPay}
        disabled={processing}
        icon={processing ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
        iconPosition="left"
      >
        {processing
          ? paymentMethod === "mpesa" ? "Processing M-Pesa..." : "Processing Card..."
          : `Pay ${fmt(total)}`}
      </Button>

      {!processing && (
        <p className="font-sans text-[11px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
          <Lock size={10} />
          Secured by 256-bit SSL encryption
        </p>
      )}
    </section>
  );
}