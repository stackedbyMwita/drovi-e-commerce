"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SearchBar } from "./SearchBar";
import { CartIcon } from "./CartIcon";
import { AuthDropdown } from "./AuthDropdown";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Men",          href: "/men",      exact: false },
  { label: "Women",        href: "/women",    exact: false },
  { label: "Kids",         href: "/kids",     exact: false },
  { label: "All Products", href: "/products", exact: true  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background border-b border-border"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center h-16 gap-6">

            <Logo size="md" />

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {NAV_LINKS.map((link) => {
                const { label, href } = link;
                const isActive = link.exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative px-3 py-2 text-sm font-sans font-semibold uppercase tracking-widest",
                      "transition-colors duration-200",
                      "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-primary",
                      "after:transition-transform after:duration-200 after:origin-left",
                      isActive
                        ? "text-primary after:scale-x-100"
                        : "text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions — each wrapped in Suspense so async
                work inside them never blocks the server render */}
            <div className="ml-auto flex items-center gap-1">
              <Suspense fallback={<div className="w-10 h-10" />}>
                <SearchBar />
              </Suspense>

              <Suspense fallback={<div className="w-10 h-10" />}>
                <CartIcon />
              </Suspense>

              <Suspense fallback={<div className="w-9 h-9" />}>
                <AuthDropdown />
              </Suspense>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-foreground hover:text-primary transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        <div
          className={cn(
            "md:hidden border-t border-border bg-background",
            "transition-all duration-300 overflow-hidden",
            mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="px-4 py-4 flex flex-col">
            {NAV_LINKS.map((link) => {
              const { label, href } = link;
              const isActive = link.exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-2 py-4 text-sm font-sans font-semibold uppercase tracking-widest border-b border-border last:border-0",
                    "transition-colors duration-150",
                    isActive ? "text-primary" : "text-foreground hover:text-primary"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Spacer so page content doesn't hide under fixed navbar */}
      <div className="h-16" />
    </>
  );
}