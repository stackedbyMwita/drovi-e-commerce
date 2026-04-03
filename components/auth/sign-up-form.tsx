"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, User, Phone, Mail, Lock, ArrowRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

type FormData = {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const [form, setForm] = useState<FormData>({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const supabase = createClient();

  // ── Validation ───────────────────────────────────────────
  function validate(): boolean {
    const e: FormErrors = {};

    if (!form.full_name.trim() || form.full_name.trim().length < 2)
      e.full_name = "Please enter your full name";

    const phoneRegex = /^(?:\+254|0)[17]\d{8}$/;
    if (!form.phone.trim())
      e.phone = "Phone number is required";
    else if (!phoneRegex.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Kenyan number e.g. 0712 345 678";

    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";

    if (!form.password)
      e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    else if (!/(?=.*[A-Z])/.test(form.password))
      e.password = "Include at least one uppercase letter";

    if (!form.confirm_password)
      e.confirm_password = "Please confirm your password";
    else if (form.password !== form.confirm_password)
      e.confirm_password = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);

    // Normalize phone — store as +254XXXXXXXXX
    const normalizedPhone = form.phone.replace(/\s/g, "").replace(/^0/, "+254");

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        // These go into auth.users raw_user_meta_data
        // Our trigger reads them and populates profiles table
        data: {
          full_name: form.full_name.trim(),
          phone: normalizedPhone,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled in Supabase, user is auto-signed in
    // If enabled, show success state
    if (data.user && !data.session) {
      // Email confirmation required
      setSuccess(true);
      setLoading(false);
      return;
    }

    // Auto signed in — redirect to destination
    router.push(redirectTo);
    router.refresh();
  }

  function handleChange(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // ── Password strength ────────────────────────────────────
  const passwordChecks = [
    { label: "8+ characters", pass: form.password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(form.password) },
    { label: "Number", pass: /[0-9]/.test(form.password) },
  ];

  // ── Success state ────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-accent border border-primary/20 flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
            Check your email
          </h1>
          <p className="font-sans text-muted-foreground mb-6">
            We sent a confirmation link to{" "}
            <span className="text-foreground font-semibold">{form.email}</span>.
            Click it to activate your account.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/auth/login")}
            className="w-full justify-center"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — decorative panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden">
        {/* Red vertical accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />

        {/* Top content */}
        <Logo size="lg" />

        {/* Middle content */}
        <div>
          <h2 className="font-serif text-5xl font-bold text-background leading-tight mb-4">
            Your style,<br />
            <span className="text-primary">delivered.</span>
          </h2>
          <p className="font-sans text-background/60 text-lg leading-relaxed">
            Join thousands of Kenyans who shop fresh fits for the whole family — delivered to your door.
          </p>

          {/* Perks */}
          <div className="mt-10 flex flex-col gap-4">
            {[
              "Free delivery on your first order",
              "Exclusive member discounts",
              "Easy returns & exchanges",
              "Order tracking at every step",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-primary flex items-center justify-center shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="font-sans text-background/80 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="font-sans text-background/30 text-xs uppercase tracking-widest">
          © 2026 Drovi
        </p>
      </div>

      {/* Right — form panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Logo size="md" />
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              Create account
            </h1>
            <p className="font-sans text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-semibold hover:underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* Full Name */}
            <Field
              label="Full Name"
              error={errors.full_name}
              icon={<User size={16} />}
            >
              <input
                type="text"
                placeholder="Jane Wanjiku"
                value={form.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                autoComplete="name"
                className={inputClass(!!errors.full_name)}
              />
            </Field>

            {/* Phone */}
            <Field
              label="Phone Number"
              error={errors.phone}
              hint="Used for M-Pesa payments and delivery updates"
              icon={<Phone size={16} />}
            >
              <input
                type="tel"
                placeholder="0712 345 678"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                autoComplete="tel"
                className={inputClass(!!errors.phone)}
              />
            </Field>

            {/* Email */}
            <Field
              label="Email Address"
              error={errors.email}
              icon={<Mail size={16} />}
            >
              <input
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              error={errors.password}
              icon={<Lock size={16} />}
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  autoComplete="new-password"
                  className={cn(inputClass(!!errors.password), "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {form.password.length > 0 && (
                <div className="flex gap-3 mt-2">
                  {passwordChecks.map(({ label, pass }) => (
                    <div key={label} className="flex items-center gap-1">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          pass ? "bg-green-500" : "bg-border"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-sans",
                          pass ? "text-green-600" : "text-muted-foreground"
                        )}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            {/* Confirm Password */}
            <Field
              label="Confirm Password"
              error={errors.confirm_password}
              icon={<Lock size={16} />}
            >
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm_password}
                  onChange={(e) => handleChange("confirm_password", e.target.value)}
                  autoComplete="new-password"
                  className={cn(inputClass(!!errors.confirm_password), "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                {/* Match indicator */}
                {form.confirm_password.length > 0 && (
                  <div
                    className={cn(
                      "absolute right-10 top-1/2 -translate-y-1/2",
                      form.password === form.confirm_password
                        ? "text-green-500"
                        : "text-muted-foreground"
                    )}
                  >
                    <Check size={14} />
                  </div>
                )}
              </div>
            </Field>

            {/* Terms */}
            <p className="text-xs font-sans text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              className="w-full justify-center mt-1"
            >
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Reusable field wrapper ───────────────────────────────────────
function Field({
  label,
  error,
  hint,
  icon,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-sans font-semibold uppercase tracking-widest text-foreground flex items-center gap-2">
        {icon && (
          <span className="text-muted-foreground">{icon}</span>
        )}
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] font-sans text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] font-sans text-destructive">{error}</p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full px-4 py-3 font-sans text-sm bg-background text-foreground",
    "border outline-none transition-all duration-150 placeholder:text-muted-foreground",
    hasError
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-primary",
  );
}
