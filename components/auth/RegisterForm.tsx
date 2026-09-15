"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create your account.");
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      console.error("Registration request error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Full name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
            minLength={2}
            maxLength={50}
            autoComplete="name"
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500] focus:ring-2 focus:ring-[#FF2500]/10"
          />
        </div>

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
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500] focus:ring-2 focus:ring-[#FF2500]/10"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500] focus:ring-2 focus:ring-[#FF2500]/10"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#FF2500] px-5 py-3.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-6 border-t border-black/10 pt-6 text-center text-sm text-[#7C766C]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#1A1712] underline underline-offset-4 hover:text-[#FF2500]"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}