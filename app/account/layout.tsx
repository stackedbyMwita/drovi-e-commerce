"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { Container } from "@/components/common/Container";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Profile",    href: "/account",           icon: User    },
  { label: "Orders",     href: "/account/orders",    icon: Package },
  { label: "Addresses",  href: "/account/addresses", icon: MapPin  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login?redirectTo=/account");
  }, [loading, user]);

  if (loading || !user) return null;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* ── Sidebar ── */}
        <aside className="md:col-span-1">
          {/* Profile summary */}
          <div className="border border-border p-5 mb-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center font-sans font-bold text-lg mb-3">
              {profile?.full_name?.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() ?? "?"}
            </div>
            <p className="font-serif text-base font-bold text-foreground truncate">
              {profile?.full_name ?? "User"}
            </p>
            <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Nav links */}
          <nav className="border border-border divide-y divide-border">
            {NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/account" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 text-sm font-sans transition-colors",
                    active
                      ? "bg-accent text-primary font-semibold border-l-2 border-primary"
                      : "text-foreground hover:bg-accent hover:text-primary"
                  )}
                >
                  <Icon size={15} className={active ? "text-primary" : "text-muted-foreground"} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-sans text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </Container>
  );
}