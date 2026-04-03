"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ size = "md", showTagline = false }: LogoProps) {
  const sizes = {
    sm: { text: "text-xl", icon: 18, tagline: "text-[9px]" },
    md: { text: "text-2xl", icon: 22, tagline: "text-[10px]" },
    lg: { text: "text-4xl", icon: 30, tagline: "text-xs" },
  };

  const s = sizes[size];

  return (
    <Link href="/" className="group flex flex-col items-start gap-0.5 select-none">
      <div className="flex items-center gap-2">
        {/* Icon — a stylized D with a thread/needle motif */}
        <div className="relative flex items-center justify-center" style={{ width: s.icon, height: s.icon }}>
          <svg
            width={s.icon}
            height={s.icon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:rotate-12"
          >
            {/* Hanger shape */}
            <path
              d="M12 3C10.9 3 10 3.9 10 5C10 5.74 10.4 6.38 11 6.73V8L3 14C2.4 14.4 2 15.1 2 15.9C2 17.1 2.9 18 4.1 18H19.9C21.1 18 22 17.1 22 15.9C22 15.1 21.6 14.4 21 14L13 8V6.73C13.6 6.38 14 5.74 14 5C14 3.9 13.1 3 12 3Z"
              fill="hsl(var(--primary))"
            />
            {/* Subtle shine line */}
            <line
              x1="12" y1="3" x2="12" y2="5"
              stroke="white"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <span
          className={`font-serif font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary ${s.text}`}
        >
          drovi
        </span>
      </div>

      {showTagline && (
        <span
          className={`font-sans uppercase tracking-[0.18em] text-muted-foreground pl-8 ${s.tagline}`}
        >
          dressed for your every day
        </span>
      )}
    </Link>
  );
}
