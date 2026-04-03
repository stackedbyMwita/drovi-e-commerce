"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const supabase = createClient();

  function validate(): boolean {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="lg:hidden mb-8">
          <Logo size="md" />
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="font-sans text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary font-semibold hover:underline underline-offset-2">
                Create one
              </Link>
            </p>
          </div>

          {redirectTo !== "/" && (
            <div className="mb-6 px-4 py-3 bg-accent border border-primary/20 text-sm font-sans text-foreground">
              Sign in to continue to your destination.
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                autoComplete="email"
                className={cn(
                  "w-full px-4 py-3 font-sans text-sm bg-background text-foreground",
                  "border outline-none transition-all duration-150 placeholder:text-muted-foreground",
                  emailError ? "border-destructive" : "border-border focus:border-primary"
                )}
              />
              {emailError && <p className="text-[11px] font-sans text-destructive">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground flex items-center gap-2">
                  <Lock size={16} className="text-muted-foreground" />
                  Password
                </label>
                <Link href="/auth/reset-password" className="text-xs font-sans text-primary hover:underline underline-offset-2">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                  autoComplete="current-password"
                  className={cn(
                    "w-full px-4 py-3 pr-11 font-sans text-sm bg-background text-foreground",
                    "border outline-none transition-all duration-150 placeholder:text-muted-foreground",
                    passwordError ? "border-destructive" : "border-border focus:border-primary"
                  )}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <p className="text-[11px] font-sans text-destructive">{passwordError}</p>}
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading}
              icon={<ArrowRight size={16} />} iconPosition="right"
              className="w-full justify-center mt-2">
              Sign In
            </Button>
          </form>
        </div>
      </div>

      {/* Right — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary" />
        <div className="flex justify-end"><Logo size="lg" /></div>
        <div>
          <p className="font-sans text-primary text-xs uppercase tracking-widest mb-4">Welcome back</p>
          <h2 className="font-serif text-5xl font-bold text-background leading-tight mb-6">
            Good to see<br />you again.
          </h2>
          <p className="font-sans text-background/60 text-lg leading-relaxed max-w-sm">
            Your cart, orders and saved addresses are waiting for you.
          </p>
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 40px)" }} />
        <p className="font-sans text-background/30 text-xs uppercase tracking-widest">© 2026 Drovi</p>
      </div>
    </div>
  );
}