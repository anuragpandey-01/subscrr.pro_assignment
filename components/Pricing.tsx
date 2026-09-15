"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const freeFeatures = [
  "Up to 6 subscriptions",
  "Per day / month / year breakdowns",
  "Renewal reminders",
  "Custom icons & colours",
  "iCloud sync & privacy",
];

const proFeatures = [
  { bold: "Unlimited", rest: " subscriptions" },
  { bold: "AI Spend", rest: ": scan receipts & statements" },
  { bold: "Widgets", rest: " for Home and Lock Screen" },
  { bold: "", rest: "Personal calculation categories" },
  { bold: "", rest: "Everything in Free" },
  { bold: "", rest: "Support an app with zero ads" },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        callback: (response: unknown) => void
      ) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const monthlyPrice = "$7.99";
  const yearlyPrice = "$2.49";

  useEffect(() => {
    async function checkPlan() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.user?.plan === "pro") {
          setIsPro(true);
        }
      } catch {
        // User may simply not be logged in.
      }
    }

    checkPlan();

    const handleAuthChange = () => {
      checkPlan();
    };

    window.addEventListener(
      "subscrr-auth-change",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "subscrr-auth-change",
        handleAuthChange
      );
    };
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Make sure Razorpay is loaded
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay. Please try again."
        );
      }

      // 1. Create Razorpay order
      const orderResponse = await fetch(
        "/api/payments/create-order",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Unable to create payment order."
        );
      }

      // 2. Open Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Subscrr",
        description: "Subscrr Pro Membership",
        order_id: orderData.orderId,

        theme: {
          color: "#FF2500",
        },

        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setMessage("Verifying your payment...");
            setError("");

            // 3. Verify payment on our server
            const verifyResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            // 4. Update UI
            setIsPro(true);
            setMessage(
              "🎉 Payment successful! You are now a Pro member."
            );

            // 5. Tell the rest of the app that auth/plan changed
            window.dispatchEvent(
              new Event("subscrr-auth-change")
            );
          } catch (verificationError) {
            console.error(
              "Payment verification error:",
              verificationError
            );

            setMessage("");

            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response: unknown) => {
          console.error("Razorpay payment failed:", response);

          setLoading(false);
          setMessage("");
          setError(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (upgradeError) {
      console.error("Upgrade error:", upgradeError);

      setLoading(false);

      setError(
        upgradeError instanceof Error
          ? upgradeError.message
          : "Unable to start payment."
      );
    }
  }

  return (
    <section
      className="pricing"
      id="pricing"
      aria-label="Pricing"
    >
      <div className="pricing__head">
        <span className="eyebrow reveal-up">
          Pricing
        </span>

        <h2 className="pricing__heading reveal-up">
          Free to start.
          <br />
          Premium when you grow.
        </h2>
      </div>

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "40px",
        }}
      >
        <div
          className="pricing__toggle"
          role="tablist"
          aria-label="Billing period"
        >
          <button
            role="tab"
            aria-selected={!yearly}
            className={`toggle__btn${
              !yearly ? " is-active" : ""
            }`}
            onClick={() => setYearly(false)}
          >
            Monthly
          </button>

          <button
            role="tab"
            aria-selected={yearly}
            className={`toggle__btn${
              yearly ? " is-active" : ""
            }`}
            onClick={() => setYearly(true)}
          >
            Yearly
            <span className="toggle__badge">
              −69%
            </span>
          </button>
        </div>
      </div>

      {/* Payment message */}
      {message && (
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto 24px",
            padding: "14px 18px",
            borderRadius: 14,
            background: "#E8F7EC",
            color: "#176B2C",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto 24px",
            padding: "14px 18px",
            borderRadius: 14,
            background: "#FFF0ED",
            color: "#B42318",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="plans">
        {/* Free */}
        <article className="plan card-hover">
          <header>
            <p className="plan__name">
              Free
            </p>
          </header>

          <p
            style={{
              fontSize: 14,
              color: "#7C766C",
              marginBottom: 24,
            }}
          >
            Enough to see the whole picture.
          </p>

          <ul className="plan__features">
            {freeFeatures.map((f) => (
              <li
                key={f}
                className="plan__feature"
              >
                <span className="plan__feature-dot" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="btn btn--ghost btn--block"
          >
            Start free
          </Link>
        </article>

        {/* Premium */}
        <article className="plan plan--pro card-hover">
          <span className="plan__flag">
            Most popular
          </span>

          <header>
            <p className="plan__name">
              Premium
            </p>

            <div className="plan__price">
              <span className="plan__amt">
                {yearly
                  ? yearlyPrice
                  : monthlyPrice}
              </span>

              <span className="plan__per">
                /mo
              </span>
            </div>
          </header>

          <p className="plan__billing">
            {yearly
              ? "Billed yearly. Cancel anytime."
              : "Billed monthly. Cancel anytime."}
          </p>

          <ul className="plan__features">
            {proFeatures.map((f, i) => (
              <li
                key={i}
                className="plan__feature"
              >
                <span className="plan__feature-dot" />

                {f.bold ? (
                  <strong>{f.bold}</strong>
                ) : null}

                {f.rest}
              </li>
            ))}
          </ul>

          {isPro ? (
            <Link
              href="/dashboard"
              className="btn btn--rise btn--block"
            >
              ✓ Pro Active — Open Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="btn btn--rise btn--block"
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Processing..."
                : "Go Premium"}
            </button>
          )}
        </article>
      </div>
    </section>
  );
}