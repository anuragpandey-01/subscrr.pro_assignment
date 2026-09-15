"use client";

import { FormEvent, useState } from "react";

interface AddSubscriptionProps {
  onCreated: () => void;
  onCancel: () => void;
}

const categories = [
  "Entertainment",
  "Music",
  "Software",
  "Productivity",
  "Education",
  "Gaming",
  "Health",
  "Other",
];

export default function AddSubscription({
  onCreated,
  onCancel,
}: AddSubscriptionProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [category, setCategory] = useState("Entertainment");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          currency,
          billingCycle,
          nextBillingDate,
          category,
          icon: "credit-card",
          color: "#FF2500",
          reminderEnabled: true,
          reminderDaysBefore: 3,
          status: "active",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create subscription.");
        return;
      }

      onCreated();
    } catch (error) {
      console.error("Create subscription error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
            New subscription
          </p>

          <h3 className="mt-2 text-2xl font-semibold">
            Add recurring payment
          </h3>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:border-black/30"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="subscription-name"
            className="mb-2 block text-sm font-medium"
          >
            Subscription name
          </label>

          <input
            id="subscription-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Netflix"
            required
            minLength={2}
            maxLength={100}
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500] focus:ring-2 focus:ring-[#FF2500]/10"
          />
        </div>

        <div>
          <label
            htmlFor="subscription-price"
            className="mb-2 block text-sm font-medium"
          >
            Price
          </label>

          <input
            id="subscription-price"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="15.99"
            required
            min="0"
            step="0.01"
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500] focus:ring-2 focus:ring-[#FF2500]/10"
          />
        </div>

        <div>
          <label
            htmlFor="subscription-currency"
            className="mb-2 block text-sm font-medium"
          >
            Currency
          </label>

          <select
            id="subscription-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500]"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="INR">INR — Indian Rupee</option>
            <option value="JPY">JPY — Japanese Yen</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="billing-cycle"
            className="mb-2 block text-sm font-medium"
          >
            Billing cycle
          </label>

          <select
            id="billing-cycle"
            value={billingCycle}
            onChange={(event) =>
              setBillingCycle(
                event.target.value as "monthly" | "yearly"
              )
            }
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500]"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="billing-date"
            className="mb-2 block text-sm font-medium"
          >
            Next billing date
          </label>

          <input
            id="billing-date"
            type="date"
            value={nextBillingDate}
            onChange={(event) => setNextBillingDate(event.target.value)}
            required
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500]"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="subscription-category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>

          <select
            id="subscription-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3.5 outline-none transition focus:border-[#FF2500]"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#FF2500] px-6 py-3.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add subscription"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-black/10 px-6 py-3.5 font-medium transition hover:border-black/30 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}