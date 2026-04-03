"use client";

import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

// useSearchParams() requires a Suspense boundary in Next.js App Router
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
