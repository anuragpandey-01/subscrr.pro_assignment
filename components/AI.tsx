"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

interface ExtractedReceipt {
  name: string | null;
  price: number | null;
  currency: string | null;
  billingCycle: "monthly" | "yearly" | null;
  nextBillingDate: string | null;
  category: string | null;
}

export default function AI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [result, setResult] =
    useState<ExtractedReceipt | null>(null);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] =
    useState<string>("");

  const [error, setError] =
    useState<string>("");

  // -----------------------------------------
  // Particle animation
  // -----------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    };

    const particles: Particle[] = [];

    const count = 280;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        ctx.beginPath();

        ctx.arc(
          p.x,
          p.y,
          p.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(255,37,0,${p.alpha})`;

        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(raf);
  }, []);

  // -----------------------------------------
  // Select receipt
  // -----------------------------------------

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");
    setResult(null);

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
  }

  // -----------------------------------------
  // Analyze receipt
  // -----------------------------------------

  async function handleAnalyze() {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("receipt", selectedFile);

      const response = await fetch(
        "/api/ai-snap",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to analyze receipt."
        );
      }

      setResult(data.extracted);

      setMessage(
        "Receipt analyzed successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // Save subscription
  // -----------------------------------------

  async function handleSave() {
    if (!result) return;

    if (
      !result.name ||
      result.price === null ||
      !result.currency ||
      !result.billingCycle
    ) {
      setError(
        "The AI could not extract enough information. Please use a clearer receipt."
      );

      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/subscriptions",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: result.name,
            price: result.price,
            currency: result.currency,
            billingCycle: result.billingCycle,

            nextBillingDate:
              result.nextBillingDate ||
              new Date().toISOString(),

            category:
              result.category || "Other",

            icon: "credit-card",

            color: "#FF2500",

            reminderEnabled: true,

            reminderDaysBefore: 3,

            status: "active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save subscription."
        );
      }

      setMessage(
        "Subscription added successfully."
      );

      setSelectedFile(null);
      setPreview(null);
      setResult(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      window.dispatchEvent(
        new Event("subscrr-subscription-created")
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="ai-section"
      id="ai"
      aria-label="Premium · AI Spend"
    >
      <div className="ai__card">

        {/* -------------------------------- */}
        {/* TEXT */}
        {/* -------------------------------- */}

        <div className="ai__text">

          <span className="ai__eyebrow">
            Premium · AI Spend
          </span>

          <h2 className="ai__heading">
            Snap a receipt.
            <br />
            Let AI do the math.
          </h2>

          <p className="ai__desc">
            Typing receipts is a chore. Snapping
            one is a tap. AI extracts the
            subscription details and lets you add
            them directly to your Subscrr account.
          </p>

          {/* -------------------------------- */}
          {/* Upload */}
          {/* -------------------------------- */}

          <div className="mt-6 flex flex-wrap gap-3">

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="ai-snap-input"
            />

            <label
              htmlFor="ai-snap-input"
              className="cursor-pointer rounded-full bg-[#FF2500] px-5 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
            >
              {selectedFile
                ? "Change receipt"
                : "Snap / Upload receipt"}
            </label>

            {selectedFile && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium transition hover:border-[#FF2500] hover:text-[#FF2500] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze with AI"}
              </button>
            )}

          </div>

          {/* -------------------------------- */}
          {/* Preview */}
          {/* -------------------------------- */}

          {preview && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-white">
              <img
                src={preview}
                alt="Selected receipt"
                className="max-h-56 w-full object-contain"
              />
            </div>
          )}

          {/* -------------------------------- */}
          {/* Status */}
          {/* -------------------------------- */}

          {message && (
            <p className="mt-4 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* -------------------------------- */}
          {/* AI Result */}
          {/* -------------------------------- */}

          {result && (
            <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5">

              <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                AI extracted
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-black/40">
                    Subscription
                  </p>

                  <p className="font-medium">
                    {result.name || "Not detected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black/40">
                    Price
                  </p>

                  <p className="font-medium">
                    {result.price !== null
                      ? `${result.currency || ""} ${result.price}`
                      : "Not detected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black/40">
                    Billing
                  </p>

                  <p className="font-medium capitalize">
                    {result.billingCycle ||
                      "Not detected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-black/40">
                    Category
                  </p>

                  <p className="font-medium">
                    {result.category ||
                      "Other"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-black/40">
                    Next billing
                  </p>

                  <p className="font-medium">
                    {result.nextBillingDate ||
                      "Not detected"}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-5 w-full rounded-full bg-[#FF2500] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Adding..."
                  : "Add to my subscriptions"}
              </button>

            </div>
          )}

          <div className="ai__particle-wrap">
            <canvas
              ref={canvasRef}
              className="particle-canvas"
              width={770}
              height={120}
              aria-hidden="true"
            />
          </div>

        </div>

        {/* -------------------------------- */}
        {/* EXISTING VISUAL */}
        {/* -------------------------------- */}

        <div className="ai__media">

          <div
            className="ai__phone"
            aria-label="AI Spend analyzing a receipt"
          >
            <video
              src="/assets/ai-device.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          </div>

        </div>

      </div>
    </section>
  );
}