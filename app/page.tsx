import { Container, FullBleed } from "@/components/common/Container";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { GenderSection } from "@/components/home/GenderSection";
import { Footer } from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main>
      {/* Hero — full bleed, no container */}
      <FullBleed>
        <Hero />
      </FullBleed>

      {/* Value props strip — full bleed dark bar */}
      <FullBleed className="bg-foreground border-b border-background/10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-background/10">
            {[
              { icon: "🚚", title: "Nationwide Delivery", sub: "All 47 counties" },
              { icon: "↩️", title: "Easy Returns", sub: "30-day return policy" },
              { icon: "🔒", title: "Secure Checkout", sub: "M-Pesa & Card" },
              { icon: "⭐", title: "Quality Guaranteed", sub: "Curated pieces only" },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-4">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-background/80">
                    {title}
                  </p>
                  <p className="font-sans text-[11px] text-background/40 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </FullBleed>

      {/* Featured Products — 6 top picks, 2 rows × 3 */}
      <Container>
        <FeaturedProducts />
      </Container>

      {/* Divider */}
      <FullBleed className="h-px bg-border" />

      {/* Men's picks */}
      <Container>
        <GenderSection gender="men" />
      </Container>

      {/* Mid-page banner — full bleed red */}
      <FullBleed className="bg-primary py-14">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60 mb-2">
                Limited time
              </p>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground leading-tight">
                Free delivery on your<br className="hidden md:block" /> first order.
              </h3>
            </div>
            <a
              href="/auth/signup"
              className="shrink-0 inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-4 font-sans font-bold text-sm uppercase tracking-widest hover:bg-primary-foreground/90 transition-colors"
            >
              Create Account
            </a>
          </div>
        </Container>
      </FullBleed>

      {/* Women's picks */}
      <Container>
        <GenderSection gender="women" />
      </Container>

      {/* Divider */}
      <FullBleed className="h-px bg-border" />

      {/* Kids' picks */}
      <Container>
        <GenderSection gender="kids" />
      </Container>

      {/* Footer — full bleed dark */}
      <FullBleed>
        <Footer />
      </FullBleed>
    </main>
  );
}