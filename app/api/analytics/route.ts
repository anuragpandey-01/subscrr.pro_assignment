import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";
import Subscription from "@/models/Subscription";

interface CurrencyTotal {
  currency: string;
  monthly: number;
  yearly: number;
  daily: number;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const subscriptions = await Subscription.find({
      userId,
      status: "active",
    })
      .sort({ nextBillingDate: 1 })
      .lean();

    const currencyTotals = new Map<string, CurrencyTotal>();

    for (const subscription of subscriptions) {
      const currency = subscription.currency.toUpperCase();

      const existing = currencyTotals.get(currency) || {
        currency,
        monthly: 0,
        yearly: 0,
        daily: 0,
      };

      const monthlyAmount =
        subscription.billingCycle === "monthly"
          ? subscription.price
          : subscription.price / 12;

      const yearlyAmount =
        subscription.billingCycle === "yearly"
          ? subscription.price
          : subscription.price * 12;

      const dailyAmount = monthlyAmount / 30;

      existing.monthly += monthlyAmount;
      existing.yearly += yearlyAmount;
      existing.daily += dailyAmount;

      currencyTotals.set(currency, existing);
    }

    const totalsByCurrency = Array.from(currencyTotals.values()).map(
      (total) => ({
        currency: total.currency,
        monthly: Number(total.monthly.toFixed(2)),
        yearly: Number(total.yearly.toFixed(2)),
        daily: Number(total.daily.toFixed(2)),
      })
    );

    /*
     * For backward compatibility, the dashboard's main totals use
     * the first available currency when there is only one currency.
     *
     * If multiple currencies exist, these values are set to null
     * rather than incorrectly combining currencies.
     */
    const primaryCurrency =
      totalsByCurrency.length === 1
        ? totalsByCurrency[0].currency
        : null;

    const primaryTotals =
      totalsByCurrency.length === 1
        ? totalsByCurrency[0]
        : null;

    // Category breakdown is also kept currency-specific.
    const categoryMap = new Map<
      string,
      {
        category: string;
        currency: string;
        amount: number;
      }
    >();

    for (const subscription of subscriptions) {
      const key = `${subscription.currency}:${subscription.category}`;

      const existing = categoryMap.get(key);

      const monthlyAmount =
        subscription.billingCycle === "monthly"
          ? subscription.price
          : subscription.price / 12;

      if (existing) {
        existing.amount += monthlyAmount;
      } else {
        categoryMap.set(key, {
          category: subscription.category,
          currency: subscription.currency.toUpperCase(),
          amount: monthlyAmount,
        });
      }
    }

    const categoryBreakdown = Array.from(categoryMap.values()).map(
      (item) => ({
        category: item.category,
        currency: item.currency,
        amount: Number(item.amount.toFixed(2)),
      })
    );

    const now = new Date();

    const upcomingPayments = subscriptions
      .filter(
        (subscription) =>
          new Date(subscription.nextBillingDate).getTime() >=
          now.getTime()
      )
      .slice(0, 5)
      .map((subscription) => ({
        _id: subscription._id.toString(),
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency.toUpperCase(),
        nextBillingDate: subscription.nextBillingDate,
        category: subscription.category,
        color: subscription.color,
        status: subscription.status,
      }));

    return NextResponse.json(
      {
        success: true,

        analytics: {
          totalSubscriptions: subscriptions.length,

          // These remain available for the current dashboard.
          // They are null when multiple currencies are present.
          monthlyTotal: primaryTotals?.monthly ?? null,
          yearlyTotal: primaryTotals?.yearly ?? null,
          dailyTotal: primaryTotals?.daily ?? null,

          primaryCurrency,

          // Correct multi-currency representation.
          totalsByCurrency,

          categoryBreakdown,

          upcomingPayments,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while calculating analytics",
      },
      { status: 500 }
    );
  }
}