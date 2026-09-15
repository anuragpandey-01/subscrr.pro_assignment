"use client";

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  category: string;
  status: "active" | "paused" | "cancelled";
}

interface SubscriptionHealthProps {
  subscriptions: Subscription[];
  monthlyTotal: number;
}

export default function SubscriptionHealth({
  subscriptions,
  monthlyTotal,
}: SubscriptionHealthProps) {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active"
  );

  const pausedSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "paused"
  );

  const yearlyCost = monthlyTotal * 12;

  const mostExpensive = [...activeSubscriptions].sort((a, b) => {
    const monthlyA =
      a.billingCycle === "monthly" ? a.price : a.price / 12;

    const monthlyB =
      b.billingCycle === "monthly" ? b.price : b.price / 12;

    return monthlyB - monthlyA;
  })[0];

  const categories = new Set(
    activeSubscriptions.map(
      (subscription) => subscription.category
    )
  );

  // --------------------------------
  // Subscription Health Score
  // --------------------------------

  let score = 100;

  // Subscription sprawl
  if (activeSubscriptions.length >= 4) {
    score -= 5;
  }

  if (activeSubscriptions.length >= 7) {
    score -= 10;
  }

  if (activeSubscriptions.length >= 10) {
    score -= 5;
  }

  // Monthly recurring spending
  if (monthlyTotal > 5000) {
    score -= 5;
  }

  if (monthlyTotal > 10000) {
    score -= 10;
  }

  if (monthlyTotal > 20000) {
    score -= 5;
  }

  // Paused subscriptions
  if (pausedSubscriptions.length > 0) {
    score -= Math.min(pausedSubscriptions.length * 2, 10);
  }

  // Too many subscription categories
  if (categories.size >= 5) {
    score -= 5;
  }

  // Keep score between 0 and 100
  score = Math.max(0, Math.min(score, 100));

  // --------------------------------
  // Health Status
  // --------------------------------

  let status = "Healthy";
  let message = "Your recurring spending is under control.";

  if (score < 80) {
    status = "Watch";
    message =
      "You have several recurring expenses worth reviewing.";
  }

  if (score < 60) {
    status = "Review";
    message =
      "Your subscription spending could use a closer look.";
  }

  // --------------------------------
  // Smart Insights
  // --------------------------------

  const yearlySubscriptions = activeSubscriptions.filter(
    (subscription) => subscription.billingCycle === "yearly"
  );

  const insights: string[] = [];

  if (activeSubscriptions.length === 0) {
    insights.push(
      "Add your subscriptions to start tracking recurring spending."
    );
  }

  if (activeSubscriptions.length >= 7) {
    insights.push(
      "You have several active subscriptions. Review services you rarely use."
    );
  } else if (activeSubscriptions.length >= 4) {
    insights.push(
      "Your subscription count is growing. Consider reviewing unused services."
    );
  }

  if (monthlyTotal > 20000) {
    insights.push(
      "Your monthly recurring cost is high. Review your most expensive subscriptions."
    );
  } else if (monthlyTotal > 10000) {
    insights.push(
      "Your recurring spending is high. Consider reducing unnecessary services."
    );
  } else if (monthlyTotal > 5000) {
    insights.push(
      "Your recurring spending is worth monitoring this month."
    );
  }

  if (pausedSubscriptions.length > 0) {
    insights.push(
      `${pausedSubscriptions.length} paused subscription${
        pausedSubscriptions.length > 1 ? "s" : ""
      } ${
        pausedSubscriptions.length > 1 ? "may" : "may"
      } be worth cancelling if unused.`
    );
  }

  if (yearlySubscriptions.length > 0) {
    insights.push(
      `${yearlySubscriptions.length} subscription${
        yearlySubscriptions.length > 1 ? "s are" : " is"
      } billed annually.`
    );
  }

  if (categories.size >= 5) {
    insights.push(
      "Your subscriptions span several categories. Check whether you have overlapping services."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Your current subscription mix looks balanced. Keep monitoring recurring charges."
    );
  }

  return (
    <section className="rounded-[28px] bg-[#1A1712] p-6 text-white sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/50">
            Subscription health
          </p>

          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            {status}
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
            {message}
          </p>
        </div>

        {/* Score */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
          <div className="text-center">
            <span className="text-2xl font-semibold">
              {score}
            </span>

            <p className="text-[10px] uppercase tracking-wider text-white/40">
              / 100
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-white/40">
            Active
          </p>

          <p className="mt-2 text-xl font-semibold">
            {activeSubscriptions.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-white/40">
            Categories
          </p>

          <p className="mt-2 text-xl font-semibold">
            {categories.size}
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-white/40">
            Annual cost
          </p>

          <p className="mt-2 text-xl font-semibold">
            ₹{yearlyCost.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Most Expensive Subscription */}
      {mostExpensive && (
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-sm text-white/50">
            Subscription worth reviewing
          </p>

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">
              {mostExpensive.name}
            </p>

            <p className="text-sm text-white/60">
              {mostExpensive.billingCycle === "monthly"
                ? `₹${mostExpensive.price.toLocaleString(
                    "en-IN"
                  )}/month`
                : `₹${mostExpensive.price.toLocaleString(
                    "en-IN"
                  )}/year`}
            </p>
          </div>
        </div>
      )}

      {/* Smart Insights */}
      <div className="mt-6 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">
            Smart insights
          </p>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
            {insights.length} insight
            {insights.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-2xl bg-white/5 p-4"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                {index + 1}
              </span>

              <p className="text-sm leading-6 text-white/70">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}