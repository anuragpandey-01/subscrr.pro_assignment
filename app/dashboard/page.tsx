"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AddSubscription from "@/components/dashboard/AddSubscription";
import UpcomingPayments from "@/components/dashboard/UpcomingPayments";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import SubscriptionHealth from "@/components/dashboard/SubscriptionHealth";

interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
}

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string;
  icon?: string;
  color?: string;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number;
  status: "active" | "paused" | "cancelled";
}

interface UpcomingPayment {
  _id: string;
  name: string;
  price: number;
  currency: string;
  nextBillingDate: string;
  category: string;
  color?: string;
  status: "active" | "paused" | "cancelled";
}

interface CurrencyTotal {
  currency: string;
  monthly: number;
  yearly: number;
  daily: number;
}

interface CategoryBreakdownItem {
  category: string;
  currency: string;
  amount: number;
}

interface Analytics {
  totalSubscriptions: number;

  monthlyTotal: number | null;
  yearlyTotal: number | null;
  dailyTotal: number | null;

  primaryCurrency: string | null;

  totalsByCurrency: CurrencyTotal[];

  categoryBreakdown: CategoryBreakdownItem[];
  upcomingPayments: UpcomingPayment[];
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

const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("billingDate");

  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");

  const [editBillingCycle, setEditBillingCycle] = useState<
    "monthly" | "yearly"
  >("monthly");

  const [editBillingDate, setEditBillingDate] = useState("");
  const [editCategory, setEditCategory] = useState("Other");

  const [editStatus, setEditStatus] = useState<
    "active" | "paused" | "cancelled"
  >("active");

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [userResponse, subscriptionsResponse, analyticsResponse] =
        await Promise.all([
          fetch("/api/auth/me", {
            credentials: "include",
          }),

          fetch("/api/subscriptions", {
            credentials: "include",
          }),

          fetch("/api/analytics", {
            credentials: "include",
          }),
        ]);

      if (userResponse.status === 401) {
        router.replace("/login");
        return;
      }

      if (!userResponse.ok) {
        throw new Error("Unable to retrieve your account.");
      }

      if (!subscriptionsResponse.ok) {
        throw new Error("Unable to retrieve subscriptions.");
      }

      if (!analyticsResponse.ok) {
        throw new Error("Unable to retrieve analytics.");
      }

      const userData = await userResponse.json();
      const subscriptionData = await subscriptionsResponse.json();
      const analyticsData = await analyticsResponse.json();

      setUser(userData.user);
      setSubscriptions(subscriptionData.subscriptions || []);
      setAnalytics(analyticsData.analytics || null);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError("Unable to load your dashboard. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  }

  function formatMoney(amount: number, currency = "USD") {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  function startEditing(subscription: Subscription) {
    setEditingId(subscription._id);

    setEditName(subscription.name);
    setEditPrice(String(subscription.price));
    setEditCurrency(subscription.currency);
    setEditBillingCycle(subscription.billingCycle);

    const date = new Date(subscription.nextBillingDate);

    if (!Number.isNaN(date.getTime())) {
      setEditBillingDate(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      );
    } else {
      setEditBillingDate("");
    }

    setEditCategory(subscription.category);
    setEditStatus(subscription.status);
    setEditError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditError("");
  }

  async function handleUpdate(subscriptionId: string) {
    setEditError("");

    if (!editName.trim()) {
      setEditError("Subscription name is required.");
      return;
    }

    const price = Number(editPrice);

    if (!Number.isFinite(price) || price < 0) {
      setEditError("Please enter a valid price.");
      return;
    }

    if (!editBillingDate) {
      setEditError("Billing date is required.");
      return;
    }

    setEditLoading(true);

    try {
      const response = await fetch(
        `/api/subscriptions/${subscriptionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: editName.trim(),
            price,
            currency: editCurrency,
            billingCycle: editBillingCycle,
            nextBillingDate: editBillingDate,
            category: editCategory,
            status: editStatus,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setEditError(data.message || "Unable to update subscription.");
        return;
      }

      setEditingId(null);

      await loadDashboard(true);
    } catch (error) {
      console.error("Update subscription error:", error);

      setEditError("Something went wrong. Please try again.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(subscriptionId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(subscriptionId);

    try {
      const response = await fetch(
        `/api/subscriptions/${subscriptionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        window.alert(
          data.message || "Unable to delete subscription."
        );
        return;
      }

      await loadDashboard(true);
    } catch (error) {
      console.error("Delete subscription error:", error);

      window.alert(
        "Something went wrong while deleting the subscription."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleSubscriptionCreated() {
    setShowAddForm(false);

    loadDashboard(true);
  }

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...subscriptions]
      .filter((subscription) => {
        const matchesSearch =
          !query ||
          subscription.name.toLowerCase().includes(query) ||
          subscription.category.toLowerCase().includes(query);

        const matchesCategory =
          categoryFilter === "All" ||
          subscription.category === categoryFilter;

        const matchesStatus =
          statusFilter === "All" ||
          subscription.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "priceHigh") {
          return b.price - a.price;
        }

        if (sortBy === "priceLow") {
          return a.price - b.price;
        }

        if (sortBy === "billingDateDesc") {
          return (
            new Date(b.nextBillingDate).getTime() -
            new Date(a.nextBillingDate).getTime()
          );
        }

        return (
          new Date(a.nextBillingDate).getTime() -
          new Date(b.nextBillingDate).getTime()
        );
      });
  }, [
    subscriptions,
    searchQuery,
    categoryFilter,
    statusFilter,
    sortBy,
  ]);

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setSortBy("billingDate");
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    sortBy !== "billingDate";

  const hasMultipleCurrencies =
    (analytics?.totalsByCurrency?.length ?? 0) > 1;

  const monthlyDisplay =
    analytics?.monthlyTotal !== null &&
    analytics?.monthlyTotal !== undefined
      ? formatMoney(
          analytics.monthlyTotal,
          analytics.primaryCurrency || "USD"
        )
      : "Multiple currencies";

  const yearlyDisplay =
    analytics?.yearlyTotal !== null &&
    analytics?.yearlyTotal !== undefined
      ? formatMoney(
          analytics.yearlyTotal,
          analytics.primaryCurrency || "USD"
        )
      : "Multiple currencies";

  const dailyDisplay =
    analytics?.dailyTotal !== null &&
    analytics?.dailyTotal !== undefined
      ? formatMoney(
          analytics.dailyTotal,
          analytics.primaryCurrency || "USD"
        )
      : "Multiple currencies";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F2EC] px-6 py-10 text-[#1A1712]">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-6 w-24 rounded bg-black/10" />

            <div className="mt-6 h-12 w-80 rounded bg-black/10" />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="h-36 rounded-[28px] bg-black/10" />
              <div className="h-36 rounded-[28px] bg-black/10" />
              <div className="h-36 rounded-[28px] bg-black/10" />
            </div>

            <div className="mt-10 h-64 rounded-[28px] bg-black/10" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F2EC] px-6 text-[#1A1712]">
        <div className="w-full max-w-md rounded-[28px] border border-black/10 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold">
            Something went wrong
          </h1>

          <p className="mt-3 text-[#7C766C]">{error}</p>

          <button
            onClick={() => loadDashboard()}
            className="mt-6 rounded-full bg-[#FF2500] px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F2EC] text-[#1A1712]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7C766C]">
              Subscrr
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Welcome, {user?.name}.
            </h1>

            <p className="mt-2 text-[#7C766C]">
              Here&apos;s what your subscriptions look like.
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Back to Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:border-[#FF2500] hover:text-[#FF2500]"
            >
              ← Back to Home
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-fit rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:border-[#FF2500] hover:text-[#FF2500]"
            >
              Log out
            </button>

          </div>
        </header>

        {/* Refresh indicator */}
        {refreshing && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#7C766C]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF2500]" />
            Updating your subscriptions...
          </div>
        )}

        {/* Stats */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">

          {/* Monthly */}
          <div className="rounded-[28px] bg-[#1A1712] p-6 text-white">
            <p className="text-sm text-white/60">
              Monthly spending
            </p>

            <p
              className={`mt-4 font-semibold tracking-tight ${
                monthlyDisplay === "Multiple currencies"
                  ? "text-2xl"
                  : "text-4xl"
              }`}
            >
              {monthlyDisplay}
            </p>

            <p className="mt-2 text-sm text-white/50">
              {hasMultipleCurrencies
                ? "Totals are separated by currency"
                : "Average recurring monthly cost"}
            </p>
          </div>

          {/* Yearly */}
          <div className="rounded-[28px] bg-white p-6">
            <p className="text-sm text-[#7C766C]">
              Yearly spending
            </p>

            <p
              className={`mt-4 font-semibold tracking-tight ${
                yearlyDisplay === "Multiple currencies"
                  ? "text-2xl"
                  : "text-4xl"
              }`}
            >
              {yearlyDisplay}
            </p>

            <p className="mt-2 text-sm text-[#7C766C]">
              {hasMultipleCurrencies
                ? "Totals are separated by currency"
                : "Estimated annual subscription cost"}
            </p>
          </div>

          {/* Active subscriptions */}
          <div className="rounded-[28px] bg-[#FF2500] p-6 text-white">
            <p className="text-sm text-white/70">
              Active subscriptions
            </p>

            <p className="mt-4 text-4xl font-semibold">
              {analytics?.totalSubscriptions ?? 0}
            </p>

            <p className="mt-2 text-sm text-white/70">
              Currently active recurring payments
            </p>
          </div>
        </section>

        {/* Currency breakdown */}
        {hasMultipleCurrencies && (
          <section className="mt-6 rounded-[28px] bg-white p-6 sm:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
                Currency breakdown
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Spending by currency
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-[#7C766C]">
                Your subscriptions use different currencies, so
                Subscrr keeps each currency separate instead of
                incorrectly combining their values.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analytics?.totalsByCurrency?.map((total) => (
                <div
                  key={total.currency}
                  className="rounded-[24px] bg-[#F4F2EC] p-5"
                >
                  <p className="text-sm font-medium text-[#7C766C]">
                    {total.currency}
                  </p>

                  <p className="mt-3 text-2xl font-semibold">
                    {formatMoney(
                      total.monthly,
                      total.currency
                    )}
                  </p>

                  <p className="mt-1 text-xs text-[#7C766C]">
                    per month
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-sm">
                    <span className="text-[#7C766C]">
                      Yearly
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        total.yearly,
                        total.currency
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-[#7C766C]">
                      Daily
                    </span>

                    <span className="font-medium">
                      {formatMoney(
                        total.daily,
                        total.currency
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Payments */}
        <div className="mt-6">
          <UpcomingPayments
            payments={analytics?.upcomingPayments || []}
          />
        </div>

        {/* Category Breakdown */}
        <div className="mt-6">
          <CategoryBreakdown
            categories={analytics?.categoryBreakdown || []}
          />
        </div>

        {/* Subscription Health */}
        <div className="mt-6">
          <SubscriptionHealth
            subscriptions={subscriptions}
            monthlyTotal={analytics?.monthlyTotal ?? 0}
          />
        </div>

        {/* Subscription Section */}
        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
                Your subscriptions
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Recurring payments
              </h2>

              <p className="mt-2 text-sm text-[#7C766C]">
                {filteredSubscriptions.length} of{" "}
                {subscriptions.length} subscriptions shown
              </p>
            </div>

            <button
              onClick={() =>
                setShowAddForm((current) => !current)
              }
              className="w-fit rounded-full bg-[#1A1712] px-5 py-3 text-sm font-medium text-white transition hover:opacity-85"
            >
              {showAddForm
                ? "Hide form"
                : "+ Add subscription"}
            </button>
          </div>

          {/* Add Subscription */}
          {showAddForm && (
            <AddSubscription
              onCreated={handleSubscriptionCreated}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Search / Filter / Sort */}
          {subscriptions.length > 0 && (
            <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-5 sm:p-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

                <div className="lg:col-span-2">
                  <label
                    htmlFor="subscription-search"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#7C766C]"
                  >
                    Search
                  </label>

                  <input
                    id="subscription-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search by name or category..."
                    className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none transition focus:border-[#FF2500]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-filter"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#7C766C]"
                  >
                    Category
                  </label>

                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none transition focus:border-[#FF2500]"
                  >
                    <option value="All">
                      All categories
                    </option>

                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#7C766C]"
                  >
                    Status
                  </label>

                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none transition focus:border-[#FF2500]"
                  >
                    <option value="All">
                      All statuses
                    </option>

                    <option value="active">Active</option>
                    <option value="paused">Paused</option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label
                    htmlFor="subscription-sort"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-[#7C766C]"
                  >
                    Sort by
                  </label>

                  <select
                    id="subscription-sort"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none transition focus:border-[#FF2500]"
                  >
                    <option value="billingDate">
                      Next billing date
                    </option>

                    <option value="billingDateDesc">
                      Latest billing date
                    </option>

                    <option value="name">
                      Name A-Z
                    </option>

                    <option value="priceHigh">
                      Price: high to low
                    </option>

                    <option value="priceLow">
                      Price: low to high
                    </option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:border-[#FF2500] hover:text-[#FF2500] sm:w-auto"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {subscriptions.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-black/15 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F2EC] text-2xl">
                +
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No subscriptions yet.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-[#7C766C]">
                Add your first subscription to start tracking
                your recurring spending.
              </p>

              <button
                onClick={() => setShowAddForm(true)}
                className="mt-6 rounded-full bg-[#FF2500] px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                Add your first subscription
              </button>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F2EC] text-xl">
                🔎
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No subscriptions found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-[#7C766C]">
                Try changing your search or filter options.
              </p>

              <button
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#1A1712] px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription._id}
                  className="rounded-[28px] bg-white p-6"
                >
                  {editingId === subscription._id ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">
                          Edit subscription
                        </h3>

                        <button
                          onClick={cancelEditing}
                          className="text-sm text-[#7C766C] hover:text-[#1A1712]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="mt-6 space-y-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) =>
                            setEditName(event.target.value)
                          }
                          placeholder="Subscription name"
                          className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(event) =>
                              setEditPrice(event.target.value)
                            }
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                          />

                          <select
                            value={editCurrency}
                            onChange={(event) =>
                              setEditCurrency(event.target.value)
                            }
                            className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                          >
                            {currencies.map((currency) => (
                              <option
                                key={currency}
                                value={currency}
                              >
                                {currency}
                              </option>
                            ))}
                          </select>
                        </div>

                        <select
                          value={editBillingCycle}
                          onChange={(event) =>
                            setEditBillingCycle(
                              event.target.value as
                                | "monthly"
                                | "yearly"
                            )
                          }
                          className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                        >
                          <option value="monthly">
                            Monthly
                          </option>

                          <option value="yearly">
                            Yearly
                          </option>
                        </select>

                        <input
                          type="date"
                          value={editBillingDate}
                          onChange={(event) =>
                            setEditBillingDate(event.target.value)
                          }
                          className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                        />

                        <select
                          value={editCategory}
                          onChange={(event) =>
                            setEditCategory(event.target.value)
                          }
                          className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                        >
                          {categories.map((category) => (
                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>
                          ))}
                        </select>

                        <select
                          value={editStatus}
                          onChange={(event) =>
                            setEditStatus(
                              event.target.value as
                                | "active"
                                | "paused"
                                | "cancelled"
                            )
                          }
                          className="w-full rounded-2xl border border-black/10 bg-[#F4F2EC] px-4 py-3 outline-none focus:border-[#FF2500]"
                        >
                          <option value="active">
                            Active
                          </option>

                          <option value="paused">
                            Paused
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>

                        {editError && (
                          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {editError}
                          </div>
                        )}

                        <button
                          onClick={() =>
                            handleUpdate(subscription._id)
                          }
                          disabled={editLoading}
                          className="w-full rounded-full bg-[#FF2500] px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {editLoading
                            ? "Saving..."
                            : "Save changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-semibold">
                            {subscription.name}
                          </h3>

                          <p className="mt-1 text-sm text-[#7C766C]">
                            {subscription.category}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            subscription.status === "active"
                              ? "bg-green-100 text-green-700"
                              : subscription.status === "paused"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {subscription.status}
                        </span>
                      </div>

                      <div className="mt-8">
                        <p className="text-3xl font-semibold">
                          {formatMoney(
                            subscription.price,
                            subscription.currency
                          )}
                        </p>

                        <p className="mt-1 text-sm text-[#7C766C]">
                          per{" "}
                          {subscription.billingCycle ===
                          "monthly"
                            ? "month"
                            : "year"}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-black/10 pt-4">
                        <p className="text-xs uppercase tracking-wider text-[#7C766C]">
                          Next payment
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDate(
                            subscription.nextBillingDate
                          )}
                        </p>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() =>
                            startEditing(subscription)
                          }
                          className="flex-1 rounded-full border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:border-[#1A1712]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(subscription._id)
                          }
                          disabled={
                            deletingId === subscription._id
                          }
                          className="flex-1 rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === subscription._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Daily Spending */}
        <section className="mt-8">
          <div className="rounded-[28px] bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
                  Spending insight
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Your daily subscription average
                </h2>
              </div>

              <div className="text-left sm:text-right">
                <p
                  className={`font-semibold tracking-tight ${
                    dailyDisplay === "Multiple currencies"
                      ? "text-2xl"
                      : "text-4xl"
                  }`}
                >
                  {dailyDisplay}
                </p>

                <p className="mt-1 text-sm text-[#7C766C]">
                  {hasMultipleCurrencies
                    ? "Separated by currency"
                    : "estimated per day"}
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}