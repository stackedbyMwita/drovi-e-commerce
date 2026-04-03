"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { use } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Container, FullBleed } from "@/components/common/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";

type GenderPageProps = {
  params: Promise<{ gender: string }>;
};

const GENDER_CONFIG = {
  men: {
    title: "Men's Collection",
    subtitle: "Sharp fits for every day — from clean basics to statement pieces.",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80",
  },
  women: {
    title: "Women's Collection",
    subtitle: "Effortless style — curated pieces that move with you.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
  },
  kids: {
    title: "Kids' Collection",
    subtitle: "Fun, durable fits for kids who never stop moving.",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&q=80",
  },
};

const VALID_GENDERS = ["men", "women", "kids"];

export default function GenderPage({ params }: GenderPageProps) {
  // Unwrap the params Promise in a client component using React.use()
  const { gender } = use(params);
  const [page, setPage] = useState(1);

  if (!VALID_GENDERS.includes(gender)) notFound();

  const config = GENDER_CONFIG[gender as keyof typeof GENDER_CONFIG];

  const { data, isLoading } = useProducts({ gender, page });

  return (
    <main>
      <FullBleed>
        <PageHeader
          title={config.title}
          subtitle={config.subtitle}
          imageSrc={config.image}
          size="md"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: config.title },
          ]}
        />
      </FullBleed>

      <Container className="py-10">
        <ProductGrid
          products={data?.products ?? []}
          isLoading={isLoading}
          totalCount={data?.totalCount ?? 0}
          page={page}
          pageSize={20}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </Container>
    </main>
  );
}