import { cn } from "@/lib/utils";

type ContainerProps = {
  children?: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main";
};

export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("max-w-7xl mx-auto px-4 md:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}

// Full-bleed wrapper — no max-width, no padding
// Use this to wrap PageHeader, Hero, banners etc.
export function FullBleed({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}