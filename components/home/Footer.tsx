import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { Container } from "@/components/common/Container";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { ThemeSwitcher } from "../theme-switcher";

const LINKS = {
  Shop: [
    { label: "Men", href: "/men" },
    { label: "Women", href: "/women" },
    { label: "Kids", href: "/kids" },
    { label: "All Products", href: "/products" },
    { label: "Sale", href: "/products?sale=true" },
  ],
  Help: [
    { label: "Track Order", href: "/account/orders" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Delivery Info", href: "/delivery" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { label: "About Drovi", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background border-t border-border mt-20">
      {/* Red top accent line */}
      <div className="h-1 w-full bg-primary" />

      <Container className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo in light mode on dark bg */}
            <div className="mb-5">
              <Logo size="md" />
            </div>
            <p className="font-sans text-background/60 text-sm leading-relaxed max-w-xs mb-6">
              Fresh fits for men, women and kids. Delivered across Kenya, straight to your door.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter,   href: "#", label: "Twitter / X" },
                { icon: Facebook,  href: "#", label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 border border-background/20 flex items-center justify-center text-background/50 hover:text-primary hover:border-primary transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
              <ThemeSwitcher />
            </div>

            {/* Delivery badge */}
            <div className="mt-8 inline-flex items-center gap-2 border border-background/10 px-4 py-2.5">
              <span className="text-primary text-lg">🚚</span>
              <div>
                <p className="text-xs font-sans font-semibold text-background/80 uppercase tracking-widest">
                  Nationwide Delivery
                </p>
                <p className="text-[10px] font-sans text-background/40">
                  All 47 counties covered
                </p>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-background/40 mb-5">
                {group}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="font-sans text-sm text-background/70 hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-background/30 text-center sm:text-left">
            © 2026 Drovi. All rights reserved. Made in Nairobi 🇰🇪
          </p>
          <div className="flex items-center gap-4">
            {/* Payment method badges */}
            {["M-Pesa", "Visa", "Mastercard"].map((method) => (
              <span
                key={method}
                className="text-[10px] font-sans font-semibold uppercase tracking-widest text-background/30 border border-background/10 px-2 py-1"
              >
                {method}
              </span>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}