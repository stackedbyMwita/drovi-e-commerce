"use client";

import { Check, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export type AddressForm = {
  full_name: string;
  phone: string;
  county: string;
  town: string;
  area: string;
};

export type DeliveryZone = {
  county: string;
  delivery_fee: number;
  estimated_days: string;
};

type SavedAddress = { id: string; county: string; town: string; area: string };

const FIELD_LABELS: Record<keyof AddressForm, string> = {
  full_name: "Full Name",
  phone:     "Phone Number",
  county:    "County",
  town:      "Town / City",
  area:      "Area / Estate",
};

function fmt(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`;
}

type Props = {
  savedAddress: SavedAddress | null | false;
  usingSavedAddress: boolean;
  setUsingSavedAddress: (v: boolean) => void;
  addressForm: AddressForm;
  setAddressForm: (fn: (f: AddressForm) => AddressForm) => void;
  errors: Partial<AddressForm & { county: string }>;
  setErrors: (fn: (e: any) => any) => void;
  deliveryZones: DeliveryZone[];
  selectedZone: DeliveryZone | null;
  countyOpen: boolean;
  setCountyOpen: (v: boolean) => void;
  onCountySelect: (zone: DeliveryZone) => void;
  onContinue: () => void;
};

export function AddressStep({
  savedAddress, usingSavedAddress, setUsingSavedAddress,
  addressForm, setAddressForm, errors, setErrors,
  deliveryZones, selectedZone, countyOpen, setCountyOpen,
  onCountySelect, onContinue,
}: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <MapPin size={18} className="text-primary" />
        <h2 className="font-serif text-xl font-bold text-foreground">
          Delivery Address
        </h2>
      </div>

      {/* ── Saved address options ── */}
      {savedAddress && (
        <div className="mb-5 flex flex-col gap-3">
          {/* Use saved */}
          <button
            type="button"
            onClick={() => setUsingSavedAddress(true)}
            className={cn(
              "w-full flex items-start gap-3 p-4 border-2 text-left transition-all",
              usingSavedAddress
                ? "border-primary bg-accent/40"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <div className={cn(
              "w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
              usingSavedAddress ? "border-primary bg-primary" : "border-border"
            )}>
              {usingSavedAddress && <Check size={10} className="text-primary-foreground" />}
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-foreground">
                {addressForm.full_name}
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                {savedAddress.area}, {savedAddress.town}, {savedAddress.county}
              </p>
              <p className="font-sans text-[11px] text-primary mt-1 font-semibold uppercase tracking-widest">
                Saved address
              </p>
            </div>
          </button>

          {/* Use different */}
          <button
            type="button"
            onClick={() => setUsingSavedAddress(false)}
            className={cn(
              "w-full flex items-center gap-3 p-4 border-2 text-left transition-all",
              !usingSavedAddress
                ? "border-primary bg-accent/40"
                : "border-border hover:border-muted-foreground"
            )}
          >
            <div className={cn(
              "w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-colors",
              !usingSavedAddress ? "border-primary bg-primary" : "border-border"
            )}>
              {!usingSavedAddress && <Check size={10} className="text-primary-foreground" />}
            </div>
            <span className="font-sans text-sm font-semibold text-foreground">
              Use a different address
            </span>
          </button>
        </div>
      )}

      {/* ── Address form — hidden when using saved ── */}
      <div className={cn("flex flex-col gap-4", savedAddress && usingSavedAddress && "hidden")}>
        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["full_name", "phone"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
                {FIELD_LABELS[field]}
              </label>
              <input
                type={field === "phone" ? "tel" : "text"}
                value={addressForm[field]}
                onChange={(e) => {
                  setAddressForm((f) => ({ ...f, [field]: e.target.value }));
                  if (errors[field]) setErrors((e: any) => ({ ...e, [field]: undefined }));
                }}
                placeholder={field === "phone" ? "0712 345 678" : "Jane Wanjiku"}
                className={cn(
                  "w-full px-4 py-3 font-sans text-sm bg-background text-foreground border outline-none transition-colors placeholder:text-muted-foreground",
                  errors[field] ? "border-destructive" : "border-border focus:border-primary"
                )}
              />
              {errors[field] && (
                <p className="text-[11px] text-destructive">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        {/* County dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
            County
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountyOpen(!countyOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 font-sans text-sm border outline-none transition-colors text-left",
                addressForm.county ? "text-foreground" : "text-muted-foreground",
                errors.county ? "border-destructive" : "border-border focus:border-primary",
                countyOpen && "border-primary"
              )}
            >
              {addressForm.county || "Select county"}
              <ChevronDown
                size={16}
                className={cn("text-muted-foreground transition-transform duration-200", countyOpen && "rotate-180")}
              />
            </button>
            {countyOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCountyOpen(false)} />
                <div className="absolute top-full left-0 right-0 z-20 bg-background border border-primary border-t-0 max-h-56 overflow-y-auto shadow-lg">
                  {deliveryZones.map((zone) => (
                    <button
                      key={zone.county}
                      type="button"
                      onClick={() => onCountySelect(zone)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-sm font-sans text-left hover:bg-accent transition-colors",
                        addressForm.county === zone.county && "bg-accent text-primary font-semibold"
                      )}
                    >
                      <span>{zone.county}</span>
                      <span className="text-xs text-muted-foreground">
                        {zone.delivery_fee === 0 ? "Free" : fmt(zone.delivery_fee)} · {zone.estimated_days}d
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {errors.county && <p className="text-[11px] text-destructive">{errors.county}</p>}
          {selectedZone && (
            <p className="text-[11px] text-muted-foreground">
              Delivery: {selectedZone.delivery_fee === 0 ? "Free" : fmt(selectedZone.delivery_fee)} · Est. {selectedZone.estimated_days} business days
            </p>
          )}
        </div>

        {/* Town + Area */}
        {(["town", "area"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-xs font-sans font-bold uppercase tracking-widest text-foreground">
              {FIELD_LABELS[field]}
            </label>
            <input
              type="text"
              value={addressForm[field]}
              onChange={(e) => {
                setAddressForm((f) => ({ ...f, [field]: e.target.value }));
                if (errors[field]) setErrors((e: any) => ({ ...e, [field]: undefined }));
              }}
              placeholder={field === "town" ? "Nairobi" : "Westlands"}
              className={cn(
                "w-full px-4 py-3 font-sans text-sm bg-background text-foreground border outline-none transition-colors placeholder:text-muted-foreground",
                errors[field] ? "border-destructive" : "border-border focus:border-primary"
              )}
            />
            {errors[field] && (
              <p className="text-[11px] text-destructive">{errors[field]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Continue — always visible */}
      <Button
        variant="primary"
        size="lg"
        icon={<ChevronRight size={16} />}
        iconPosition="right"
        className="w-full justify-center mt-4"
        onClick={onContinue}
      >
        Continue to Payment
      </Button>
    </section>
  );
}