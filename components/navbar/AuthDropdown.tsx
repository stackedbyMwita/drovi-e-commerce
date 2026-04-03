"use client";

import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Package,
  MapPin,
  ChevronDown,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

// ── Avatar component — image with initials fallback ─────────────
function Avatar({
  avatarUrl,
  fullName,
  size = "sm",
}: {
  avatarUrl: string | null;
  fullName: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);

  const initials = fullName
    ? fullName
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

  const sizeClasses = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const showImage = avatarUrl && !imgError;

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden bg-primary text-primary-foreground",
        "flex items-center justify-center font-sans font-bold select-none",
        sizeClasses[size]
      )}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={fullName ?? "User avatar"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// ── Main AuthDropdown ────────────────────────────────────────────
export function AuthDropdown() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  function navigate(path: string) {
    setOpen(false);
    router.push(path);
  }

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  // Show skeleton until mounted — prevents server/client hydration mismatch
  // since auth state is only known on the client
  useEffect(() => setMounted(true), []);
  if (!mounted || loading) {
    return (
      <div className="w-9 h-9 bg-muted animate-pulse" />
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 p-1.5",
          "border border-transparent hover:border-border",
          "transition-all duration-200",
          open && "border-border"
        )}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user ? (
          <>
            <Avatar
              avatarUrl={profile?.avatar_url ?? null}
              fullName={profile?.full_name ?? null}
              size="sm"
            />
            <ChevronDown
              size={13}
              className={cn(
                "hidden md:block text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </>
        ) : (
          <div className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <User size={22} strokeWidth={1.8} />
          </div>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      <div
        className={cn(
          "absolute right-0 top-full mt-1.5 w-72",
          "bg-background border border-border shadow-lg z-50",
          "transition-all duration-200 origin-top-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {user ? (
          <>
            {/* ── User header ── */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar
                  avatarUrl={profile?.avatar_url ?? null}
                  fullName={profile?.full_name ?? null}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-semibold text-sm text-foreground truncate">
                    {profile?.full_name ?? "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </p>
                  {profile?.phone && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {profile.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Nav links ── */}
            <nav className="py-1.5">
              {[
                { icon: User,    label: "My Profile",       path: "/account" },
                { icon: Package, label: "My Orders",        path: "/account/orders" },
                { icon: MapPin,  label: "Saved Addresses",  path: "/account" },
              ].map(({ icon: Icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3",
                    "text-sm font-sans text-foreground",
                    "hover:bg-accent hover:text-primary",
                    "transition-colors duration-150 group"
                  )}
                >
                  <Icon
                    size={15}
                    className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                  />
                  {label}
                </button>
              ))}
            </nav>

            {/* ── Sign out ── */}
            <div className="border-t border-border p-2">
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5",
                  "text-sm font-sans text-muted-foreground",
                  "hover:text-destructive hover:bg-destructive/5",
                  "transition-colors duration-150 group"
                )}
              >
                <LogOut
                  size={15}
                  className="group-hover:text-destructive transition-colors shrink-0"
                />
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ── Guest state ── */}
            <div className="px-5 py-5 border-b border-border">
              <p className="font-serif text-xl font-semibold text-foreground">
                Welcome to Drovi
              </p>
              <p className="text-xs text-muted-foreground font-sans mt-1.5 leading-relaxed">
                Sign in for a better shopping experience
              </p>
            </div>

            <div className="p-4 flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="sm"
                icon={<LogIn size={14} />}
                onClick={() => navigate("/auth/login")}
                className="w-full justify-center"
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<UserPlus size={14} />}
                onClick={() => navigate("/auth/signup")}
                className="w-full justify-center"
              >
                Create Account
              </Button>
            </div>

            <div className="px-4 pb-4 text-center">
              <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
                🎉 Free delivery on your first order
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}