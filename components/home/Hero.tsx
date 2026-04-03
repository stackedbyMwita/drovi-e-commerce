"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: 1,
    label: "New Arrivals — Men",
    headline: "Sharp fits\nfor every day.",
    sub: "From clean basics to statement pieces — built for the modern Kenyan man.",
    cta: { label: "Shop Men", href: "/men" },
    ctaSecondary: { label: "View All", href: "/products" },
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80",
    accent: "left",
  },
  {
    id: 2,
    label: "Women's Collection",
    headline: "Effortless\nstyle, always.",
    sub: "Curated pieces that move with you — from the office to the weekend.",
    cta: { label: "Shop Women", href: "/women" },
    ctaSecondary: { label: "New In", href: "/women" },
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
    accent: "right",
  },
  {
    id: 3,
    label: "Kids' Collection",
    headline: "Dressed for\ntheir adventures.",
    sub: "Fun, durable fits for kids who never stop moving. Sizes for every age.",
    cta: { label: "Shop Kids", href: "/kids" },
    ctaSecondary: { label: "Explore", href: "/kids" },
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&q=80",
    accent: "left",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  function go(index: number) {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }

  function prev() {
    go((current - 1 + SLIDES.length) % SLIDES.length);
  }

  function next() {
    go((current + 1) % SLIDES.length);
  }

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full h-[85vh] min-h-[560px] max-h-[860px] overflow-hidden bg-foreground">

      {/* Background images */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={s.image}
            alt={s.label}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay — stronger at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Red left border accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary z-20" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-end pb-16 md:pb-20">

        {/* Label pill */}
        <div
          className={cn(
            "mb-4 transition-all duration-500",
            animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          <span className="inline-block bg-primary text-primary-foreground text-[10px] font-sans font-bold uppercase tracking-[0.18em] px-3 py-1.5">
            {slide.label}
          </span>
        </div>

        {/* Headline */}
        <h1
          className={cn(
            "font-serif font-bold text-white leading-[1.05] mb-5",
            "text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
            "transition-all duration-500 delay-75",
            animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
          style={{ whiteSpace: "pre-line" }}
        >
          {slide.headline}
        </h1>

        {/* Subtext */}
        <p
          className={cn(
            "font-sans text-white/70 text-base md:text-lg max-w-md mb-8 leading-relaxed",
            "transition-all duration-500 delay-100",
            animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          {slide.sub}
        </p>

        {/* CTAs */}
        <div
          className={cn(
            "flex items-center gap-3 flex-wrap",
            "transition-all duration-500 delay-150",
            animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            asChild
          >
            <Link href={slide.cta.href}>{slide.cta.label}</Link>
          </Button>
          <Button variant="dark" size="lg" asChild>
            <Link href={slide.ctaSecondary.href}>{slide.ctaSecondary.label}</Link>
          </Button>
        </div>

        {/* Slide indicators + controls */}
        <div className="flex items-center gap-4 mt-10">
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={cn(
                  "transition-all duration-300",
                  i === current
                    ? "w-8 h-1.5 bg-primary"
                    : "w-3 h-1.5 bg-white/30 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={prev}
              className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/70 hover:text-white hover:border-white transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="w-9 h-9 flex items-center justify-center border border-white/20 text-white/70 hover:text-white hover:border-white transition-all"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Slide counter */}
          <span className="font-sans text-white/40 text-xs ml-2 tracking-widest">
            {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}