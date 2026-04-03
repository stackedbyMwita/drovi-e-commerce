"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/common/Button";

type DeliveryZone = {
  county: string;
  delivery_fee: number;
  estimated_days: string;
};

type Props = {
  firstName: string;
  orderRef: string;
  fullName: string;
  area: string;
  town: string;
  county: string;
  selectedZone: DeliveryZone | null;
};

export function OrderConfirmed({ firstName, orderRef, fullName, area, town, county, selectedZone }: Props) {
  return (
    <Container className="py-16 max-w-lg mx-auto text-center">
      <div className="w-16 h-16 bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
        <Check size={28} className="text-green-600" />
      </div>

      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
        Order Confirmed!
      </h1>
      <p className="font-sans text-muted-foreground mb-1">
        Thank you, {firstName}. Your order is on its way.
      </p>
      {orderRef && (
        <p className="font-sans text-xs text-muted-foreground mb-8">
          Ref:{" "}
          <span className="font-mono font-bold text-foreground">{orderRef}</span>
        </p>
      )}

      <div className="border border-border p-5 text-left mb-8">
        <p className="text-xs font-sans font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Delivery to
        </p>
        <p className="font-sans text-sm font-semibold text-foreground">{fullName}</p>
        <p className="font-sans text-sm text-muted-foreground">
          {area}, {town}, {county}
        </p>
        {selectedZone && (
          <p className="font-sans text-xs text-muted-foreground mt-1">
            Estimated: {selectedZone.estimated_days} business days
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg" className="w-full justify-center" asChild>
          <Link href="/account/orders">Track My Order</Link>
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-center" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </Container>
  );
}