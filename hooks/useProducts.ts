import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProductCardData } from "@/components/product/ProductCard";
import type { FilterState } from "@/components/filters/FilterSidebar";

const PAGE_SIZE = 20;

type SortOption = "featured" | "newest" | "price_asc" | "price_desc" | "sale";

type UseProductsOptions = {
  gender?: string;        // single gender — used by gender/category pages
  genders?: string[];     // multi-gender — used by /products page
  categorySlug?: string;
  filters?: Partial<FilterState>;
  page?: number;
  search?: string;
  sort?: SortOption;
};

export function useProducts({
  gender,
  genders,
  categorySlug,
  filters,
  page = 1,
  search,
  sort = "featured",
}: UseProductsOptions = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["products", { gender, genders, categorySlug, filters, page, search, sort }],
    queryFn: async () => {

      // ── Step 1: resolve category_id from slug if needed ──────
      let categoryId: string | null = null;
      if (categorySlug && gender) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .eq("gender", gender)
          .single();
        if (!cat) return { products: [], totalCount: 0, page, pageSize: PAGE_SIZE };
        categoryId = cat.id;
      }

      // ── Step 2: build products query ─────────────────────────
      let query = supabase
        .from("products")
        .select(
          `
          id, name, slug, base_price, sale_price, gender, is_featured,
          product_images(cloudinary_url, is_primary),
          product_variants(id, size, color, color_hex, stock, price_diff)
          `,
          { count: "exact" }
        )
        .eq("is_active", true);

      // Single gender (gender pages) takes priority over multi-gender
      if (gender) {
        query = query.eq("gender", gender);
      } else if (genders && genders.length === 1) {
        query = query.eq("gender", genders[0]);
      } else if (genders && genders.length > 1) {
        query = query.in("gender", genders);
      }

      if (categoryId)         query = query.eq("category_id", categoryId);
      if (search?.trim())     query = query.ilike("name", `%${search.trim()}%`);
      if (filters?.onSaleOnly || sort === "sale")
                              query = query.not("sale_price", "is", null);
      if (filters?.priceMin && filters.priceMin > 0)
                              query = query.gte("base_price", filters.priceMin);
      if (filters?.priceMax && filters.priceMax < 15000)
                              query = query.lte("base_price", filters.priceMax);

      // Sorting
      if (sort === "price_asc") {
        query = query.order("base_price", { ascending: true });
      } else if (sort === "price_desc") {
        query = query.order("base_price", { ascending: false });
      } else if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at",  { ascending: false });
      }

      const from = (page - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        products: (data ?? []) as ProductCardData[],
        totalCount: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
      };
    },
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });
}