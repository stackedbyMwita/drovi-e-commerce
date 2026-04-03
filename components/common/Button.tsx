"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Hover behaviors:
  - primary:     red bg → black bg, white left border slash appears, letters space out
  - outline:     white/red border → red floods in from left, text flips white
  - ghost:       transparent → blush tint, red underline slides in
  - destructive: crimson → near-black + crimson left border
  - dark:        black bg → red bg floods in
*/

const buttonVariants = cva(
  // Base
  [
    "relative inline-flex items-center justify-center gap-2.5",
    "font-sans font-semibold uppercase tracking-[0.08em]",
    "text-sm leading-none",
    "px-7 py-3.5",
    "rounded-none border-0 outline-none",
    "transition-all duration-300 ease-in-out",
    "disabled:pointer-events-none disabled:opacity-40",
    "overflow-hidden isolate",
    "cursor-pointer",
  ],
  {
    variants: {
      variant: {
        // ── Primary: red → black + left red border slash
        primary: [
          "bg-primary text-primary-foreground",
          "before:absolute before:inset-0 before:z-[-1] before:bg-foreground before:pointer-events-none",
          "before:translate-x-[-101%] before:transition-transform before:duration-300 before:ease-in-out",
          "hover:before:translate-x-0",
          "hover:tracking-[0.12em]",
          "after:absolute after:left-0 after:top-0 after:h-full after:w-[3px] after:z-[-1] after:bg-primary after:pointer-events-none",
          "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:delay-150",
        ],

        // ── Outline: white/red border → red floods from left, text flips
        outline: [
          "bg-background text-primary border-2 border-primary",
          "before:absolute before:inset-0 before:z-[-1] before:bg-primary before:pointer-events-none",
          "before:translate-x-[-101%] before:transition-transform before:duration-400 before:ease-in-out",
          "hover:before:translate-x-0 hover:text-primary-foreground",
          "hover:tracking-[0.1em]",
        ],

        // ── Ghost: transparent → blush bg + red underline slides in
        ghost: [
          "bg-transparent text-primary",
          "after:absolute after:bottom-1 after:left-0 after:h-[2px] after:w-0 after:z-[-1] after:bg-primary after:pointer-events-none",
          "after:transition-all after:duration-300 after:ease-out",
          "hover:after:w-full hover:bg-accent",
          "hover:tracking-[0.1em]",
        ],

        // ── Destructive: deep crimson → near-black + crimson left border
        destructive: [
          "bg-[hsl(0,72%,35%)] text-white",
          "before:absolute before:inset-0 before:z-[-1] before:bg-foreground before:pointer-events-none",
          "before:translate-x-[-101%] before:transition-transform before:duration-300 before:ease-in-out",
          "hover:before:translate-x-0",
          "after:absolute after:left-0 after:top-0 after:h-full after:w-[3px] after:z-[-1] after:bg-primary after:pointer-events-none",
          "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:delay-150",
        ],

        // ── Dark: black → red floods in
        dark: [
          "bg-foreground text-background",
          "before:absolute before:inset-0 before:z-[-1] before:bg-primary before:pointer-events-none",
          "before:translate-x-[-101%] before:transition-transform before:duration-300 before:ease-in-out",
          "hover:before:translate-x-0",
          "hover:tracking-[0.1em]",
        ],

        // ── Link style
        link: [
          "bg-transparent text-primary underline-offset-4 p-0",
          "hover:underline hover:tracking-wide",
        ],
      },

      size: {
        sm: "px-5 py-2.5 text-xs",
        md: "px-7 py-3.5 text-sm",
        lg: "px-9 py-4 text-base",
        icon: "p-3 aspect-square",
        "icon-sm": "p-2 aspect-square",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      icon,
      iconPosition = "left",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* All content sits above the ::before overlay */}
        <span className="relative z-10 inline-flex items-center gap-2.5">
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            icon && iconPosition === "left" && (
              <span className="shrink-0">{icon}</span>
            )
          )}

          {children && (
            <span>{children}</span>
          )}

          {!loading && icon && iconPosition === "right" && (
            <span className="shrink-0">{icon}</span>
          )}
        </span>
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };