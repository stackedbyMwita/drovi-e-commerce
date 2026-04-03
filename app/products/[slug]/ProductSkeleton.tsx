import { Container } from "@/components/common/Container";

export function ProductSkeleton() {
  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        <div className="aspect-[3/4] bg-muted animate-pulse" />
        <div className="space-y-4 pt-2">
          <div className="h-3 w-24 bg-muted animate-pulse" />
          <div className="h-8 w-3/4 bg-muted animate-pulse" />
          <div className="h-6 w-1/3 bg-muted animate-pulse" />
          <div className="h-px bg-border" />
          <div className="h-4 w-1/4 bg-muted animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-9 h-9 bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
          <div className="h-4 w-1/4 bg-muted animate-pulse mt-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-11 h-11 bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-12 bg-muted animate-pulse mt-6" />
          <div className="border border-border divide-y divide-border mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-4 h-4 bg-muted animate-pulse shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="h-3 w-1/3 bg-muted animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}