import { Suspense } from "react";
import { CategoryNav } from "@/components/navbar/CategoryNav";
import { FullBleed } from "@/components/common/Container";

export default function GenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FullBleed>
        <Suspense fallback={<div className="h-12 bg-background border-b border-border" />}>
          <CategoryNav />
        </Suspense>
      </FullBleed>
      {children}
    </>
  );
}