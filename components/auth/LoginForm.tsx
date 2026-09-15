"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      /*
       * Login was successful.
       *
       * The backend has already set the HTTP-only
       * authentication cookie in the response.
       *
       * Notify the navbar that authentication changed.
       */
      window.dispatchEvent(new Event("subscrr-auth-change"));

      /*
       * Use a full browser navigation instead of
       * router.replace().
       *
       * This guarantees that /dashboard loads with
       * the newly-created authentication cookie.
       */
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login request error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F2EC] px-5 py-8 text-[#1A1712] sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center sm:min-h-[calc(100vh-6rem)]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1712] text-sm font-semibold text-white">
              S
            </span>

            <span className="text-lg font-semibold tracking-[-0.03em]">
              SUBSCRR
            </span>
          </Link>
        </div>

        {/* Login card */}
        <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(26,23,18,0.08)] sm:p-9">
          {/* Heading */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF2500]">
              Account
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Welcome back.
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-[#7C766C]">
              Sign in to keep track of your subscriptions, spending, and
              upcoming payments.
            </p>
          </div>

          {/* Registration success */}
          {registered && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm leading-5 text-green-700">
              <span className="mt-0.5 font-semibold">✓</span>

              <p>
                Account created successfully. You can now log in.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
                className="h-13 w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 text-sm outline-none transition placeholder:text-[#7C766C]/60 focus:border-[#FF2500] focus:bg-white focus:ring-4 focus:ring-[#FF2500]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-13 w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 pr-16 text-sm outline-none transition placeholder:text-[#7C766C]/60 focus:border-[#FF2500] focus:bg-white focus:ring-4 focus:ring-[#FF2500]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-medium text-[#7C766C] transition hover:bg-black/5 hover:text-[#1A1712] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-700"
              >
                <span className="mt-0.5 font-semibold">!</span>

                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative h-13 w-full overflow-hidden rounded-full bg-[#FF2500] px-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(255,37,0,0.2)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10">
                {loading ? "Signing you in..." : "Log in"}
              </span>
            </button>
          </form>

          {/* Register */}
          <div className="mt-7 border-t border-black/10 pt-6 text-center">
            <p className="text-sm text-[#7C766C]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#1A1712] underline decoration-black/20 underline-offset-4 transition hover:text-[#FF2500] hover:decoration-[#FF2500]"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>

        {/* Back home */}
        <div className="mt-7 text-center">
          <Link
            href="/"
            className="text-sm text-[#7C766C] transition hover:text-[#1A1712]"
          >
            ← Back to Subscrr
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[#7C766C]/70">
          Your subscriptions. One clear view.
        </p>
      </div>
    </main>
  );
}