"use client";

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

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[];
}

export default function UpcomingPayments({
  payments,
}: UpcomingPaymentsProps) {
  function formatMoney(amount: number, currency: string) {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  function getDaysUntil(date: string) {
    const today = new Date();
    const billingDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    billingDate.setHours(0, 0, 0, 0);

    const difference =
      billingDate.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  function getDaysLabel(days: number) {
    if (days === 0) {
      return "Due today";
    }

    if (days === 1) {
      return "Due tomorrow";
    }

    if (days < 0) {
      return "Payment overdue";
    }

    return `${days} days from now`;
  }

  if (payments.length === 0) {
    return (
      <section className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
            Payments
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Upcoming payments
          </h2>
        </div>

        <div className="mt-8 rounded-2xl bg-[#F4F2EC] px-5 py-8 text-center">
          <p className="text-base font-medium">
            No upcoming payments
          </p>

          <p className="mt-2 text-sm text-[#7C766C]">
            Add your subscriptions to keep track of
            upcoming charges.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#7C766C]">
            Payments
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Upcoming payments
          </h2>
        </div>

        <span className="rounded-full bg-[#F4F2EC] px-3 py-1.5 text-xs font-medium text-[#7C766C]">
          {payments.length}{" "}
          {payments.length === 1 ? "payment" : "payments"}
        </span>
      </div>

      <div className="mt-6 divide-y divide-black/10">
        {payments.map((payment) => {
          const daysUntil = getDaysUntil(
            payment.nextBillingDate
          );

          return (
            <div
              key={payment._id}
              className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold"
                  style={{
                    backgroundColor: `${payment.color || "#FF2500"}15`,
                    color: payment.color || "#FF2500",
                  }}
                >
                  {payment.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {payment.name}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#7C766C]">
                    <span>{payment.category}</span>

                    <span>•</span>

                    <span>
                      {formatDate(
                        payment.nextBillingDate
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="font-semibold">
                  {formatMoney(
                    payment.price,
                    payment.currency
                  )}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    daysUntil <= 3
                      ? "font-medium text-[#FF2500]"
                      : "text-[#7C766C]"
                  }`}
                >
                  {getDaysLabel(daysUntil)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}