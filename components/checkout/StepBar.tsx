"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckoutStep = "address" | "payment" | "processing" | "done";

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "address", label: "Delivery" },
  { key: "payment", label: "Payment" },
  { key: "done",    label: "Confirmed" },
];

export function StepBar({ step }: { step: CheckoutStep }) {
  const current = STEPS.findIndex(
    (s) => s.key === step || (step === "processing" && s.key === "payment")
  );

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs font-sans font-bold uppercase tracking-widest transition-colors",
            i <= current ? "text-primary" : "text-muted-foreground"
          )}>
            <div className={cn(
              "w-5 h-5 flex items-center justify-center text-[10px] font-bold border transition-colors",
              i < current  ? "bg-primary border-primary text-primary-foreground" :
              i === current ? "border-primary text-primary" :
                              "border-border text-muted-foreground"
            )}>
              {i < current ? <Check size={10} /> : i + 1}
            </div>
            <span className="hidden sm:block">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <ChevronRight size={14} className="text-border" />
          )}
        </div>
      ))}
    </div>
  );
}