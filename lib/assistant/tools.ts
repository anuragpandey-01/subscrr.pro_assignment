import Subscription from "@/models/Subscription";

export async function getMySubscriptions(userId: string) {
  return Subscription.find({ userId })
    .sort({ nextBillingDate: 1 })
    .lean();
}

export async function getNextSubscription(userId: string) {
  const now = new Date();

  return Subscription.findOne({
    userId,
    status: "active",
    nextBillingDate: { $gte: now },
  })
    .sort({ nextBillingDate: 1 })
    .lean();
}

export async function getUpcomingPayments(
  userId: string,
  limit = 10
) {
  const now = new Date();

  return Subscription.find({
    userId,
    status: "active",
    nextBillingDate: { $gte: now },
  })
    .sort({ nextBillingDate: 1 })
    .limit(limit)
    .lean();
}

export async function getSubscriptionDetails(
  userId: string,
  name: string
) {
  return Subscription.findOne({
    userId,
    name: {
      $regex: name,
      $options: "i",
    },
  }).lean();
}

export async function getSpendingSummary(userId: string) {
  const subscriptions = await Subscription.find({
    userId,
    status: "active",
  }).lean();

  const totalsByCurrency: Record<
    string,
    {
      monthly: number;
      yearly: number;
      daily: number;
    }
  > = {};

  for (const subscription of subscriptions) {
    const currency = subscription.currency;

    if (!totalsByCurrency[currency]) {
      totalsByCurrency[currency] = {
        monthly: 0,
        yearly: 0,
        daily: 0,
      };
    }

    if (subscription.billingCycle === "monthly") {
      totalsByCurrency[currency].monthly +=
        subscription.price;

      totalsByCurrency[currency].yearly +=
        subscription.price * 12;
    } else {
      totalsByCurrency[currency].yearly +=
        subscription.price;

      totalsByCurrency[currency].monthly +=
        subscription.price / 12;
    }

    totalsByCurrency[currency].daily =
      totalsByCurrency[currency].yearly / 365;
  }

  return totalsByCurrency;
}

export async function getCategoryBreakdown(
  userId: string
) {
  const subscriptions = await Subscription.find({
    userId,
    status: "active",
  }).lean();

  const categories: Record<
    string,
    Record<string, number>
  > = {};

  for (const subscription of subscriptions) {
    const category = subscription.category;
    const currency = subscription.currency;

    if (!categories[category]) {
      categories[category] = {};
    }

    if (!categories[category][currency]) {
      categories[category][currency] = 0;
    }

    const monthlyAmount =
      subscription.billingCycle === "monthly"
        ? subscription.price
        : subscription.price / 12;

    categories[category][currency] += monthlyAmount;
  }

  return categories;
}

export function getSubscrrPlans() {
  return {
    product: {
      name: "Subscrr",
      description:
        "Subscrr is a smart subscription management platform that helps users track subscriptions, monitor upcoming payments, understand recurring spending, and discover potential savings opportunities.",
    },

    features: [
      {
        name: "Subscription Management",
        description:
          "Track and manage recurring subscriptions in one place.",
      },
      {
        name: "Upcoming Payments",
        description:
          "See upcoming subscription payments and their billing dates.",
      },
      {
        name: "Spending Overview",
        description:
          "Understand monthly, yearly, and daily recurring subscription spending.",
      },
      {
        name: "Category Breakdown",
        description:
          "Organize subscriptions into categories and understand where recurring spending goes.",
      },
      {
        name: "Payment Reminders",
        description:
          "Set reminders before subscription payments are due.",
      },
      {
        name: "AI Subscription Assistant",
        description:
          "Ask questions about subscriptions, upcoming payments, spending, and potential savings using the AI assistant.",
      },
      {
        name: "Voice Assistant",
        description:
          "Interact with the Subscrr AI assistant using voice input and spoken responses when supported by the browser.",
      },
      {
        name: "AI Spending Insights",
        description:
          "Get AI-powered suggestions based on subscription and spending information.",
      },
      {
        name: "Privacy-focused Authentication",
        description:
          "User accounts are protected using authentication and HTTP-only authentication cookies.",
      },
      {
        name: "Multi-currency Support",
        description:
          "Subscriptions can be tracked using different currencies without incorrectly combining different currencies.",
      },
    ],

    plans: {
      free: {
        name: "Subscrr Free",
        price: 0,
        currency: "USD",
        description:
          "The free plan provides the core subscription tracking experience.",
        features: [
          "Track subscriptions",
          "View upcoming payments",
          "Monitor recurring spending",
          "Subscription categories",
          "Basic subscription management",
        ],
      },

      pro: {
        name: "Subscrr Pro",
        price: null,
        currency: "USD",
        description:
          "Subscrr Pro is designed for users who want a more advanced subscription management and AI-powered experience.",
        features: [
          "Everything in Free",
          "AI-powered subscription assistance",
          "AI spending insights",
          "Advanced subscription analysis",
          "Savings suggestions",
          "Enhanced subscription management",
        ],
      },
    },
  };
}

export async function calculateSubscriptionCost(
  userId: string,
  name: string
) {
  const subscription = await Subscription.findOne({
    userId,
    name: {
      $regex: name,
      $options: "i",
    },
  }).lean();

  if (!subscription) {
    return null;
  }

  let monthlyCost = 0;
  let yearlyCost = 0;

  if (subscription.billingCycle === "monthly") {
    monthlyCost = subscription.price;
    yearlyCost = subscription.price * 12;
  } else {
    yearlyCost = subscription.price;
    monthlyCost = subscription.price / 12;
  }

  return {
    name: subscription.name,
    price: subscription.price,
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    monthlyCost,
    yearlyCost,
    nextBillingDate: subscription.nextBillingDate,
    category: subscription.category,
    status: subscription.status,
  };
}