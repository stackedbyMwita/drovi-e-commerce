import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type ProductImage = {
  cloudinary_id: string;
  cloudinary_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  color_variant: string | null;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  sku: string;
  stock: number;
  price_diff: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  gender: string;
  base_price: number;
  sale_price: number | null;
  is_featured: boolean;
  tags: string[] | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  categories: { name: string; slug: string } | null;
};

export function useProduct(slug: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, description, gender, base_price, sale_price,
          is_featured, tags,
          product_images(
            cloudinary_id, cloudinary_url, alt_text,
            is_primary, display_order, color_variant
          ),
          product_variants(
            id, size, color, color_hex, sku, stock, price_diff
          ),
          categories(name, slug)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      // Supabase returns foreign-key relations as arrays even for single rows.
      // Normalize categories from array to single object | null.
      const raw = data as unknown as any;
      const normalized: ProductDetail = {
        ...raw,
        categories: Array.isArray(raw.categories)
          ? raw.categories[0] ?? null
          : raw.categories ?? null,
      };
      return normalized;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!slug,
  });
}