"use client";

interface CategoryItem {
  category: string;
  amount: number;
}

interface CategoryBreakdownProps {
  categories: CategoryItem[];
}

export default function CategoryBreakdown({
  categories,
}: CategoryBreakdownProps) {
  const total = categories.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  function formatMoney(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (categories.length === 0) {
    return (
      <section className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
          Spending
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Category breakdown
        </h2>

        <div className="mt-8 rounded-2xl bg-[#F4F2EC] px-5 py-8 text-center">
          <p className="font-medium">
            No category data yet
          </p>

          <p className="mt-2 text-sm text-[#7C766C]">
            Add subscriptions to see where your money goes.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
          Spending
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Category breakdown
        </h2>

        <p className="mt-2 text-sm text-[#7C766C]">
          Your estimated monthly recurring spending by category.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {categories.map((item) => {
          const percentage =
            total > 0
              ? (item.amount / total) * 100
              : 0;

          return (
            <div key={item.category}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-3 w-3 shrink-0 rounded-full bg-[#FF2500]" />

                  <span className="truncate text-sm font-medium">
                    {item.category}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold">
                    {formatMoney(item.amount)}
                  </span>

                  <span className="ml-2 text-xs text-[#7C766C]">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#F4F2EC]">
                <div
                  className="h-full rounded-full bg-[#FF2500] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      percentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5">
        <span className="text-sm text-[#7C766C]">
          Total monthly spending
        </span>

        <span className="text-lg font-semibold">
          {formatMoney(total)}
        </span>
      </div>
    </section>
  );
}