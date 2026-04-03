import { Suspense } from "react";
import { ProductContent } from "./ProductContent";
import { ProductSkeleton } from "./ProductSkeleton";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// Server component shell — passes params down to client component
// Suspense boundary prevents "blocking route" error
export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}