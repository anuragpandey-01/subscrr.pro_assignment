"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Hero() {
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <section className="hero" aria-label="Hero">
      {/* Left — copy */}
      <div className="hero__content">
        <h1 className="hero__title hero__title--long">
          All your subscriptions. And what they really cost.
        </h1>

        <p className="hero__lead">
          Everything you pay for in one place, the honest total per day, month
          and year, and a quiet nudge the day before the money leaves.
        </p>

        <div className="hero__cta">
          {/* App Store button */}
          <button
            type="button"
            onClick={() => setShowComingSoon(true)}
            className="btn btn--solid btn--lg"
            aria-label="Download on the App Store"
          >
            Download on the App Store
          </button>

          <Link href="#work" className="btn btn--ghost btn--lg">
            See it in motion
          </Link>
        </div>
      </div>

      {/* Right — device */}
      <div className="hero__stage">
        <div className="hero__device">
          {/* Screen behind the frame */}
          <div className="hero__screen">
            <video
              src="/assets/hero-screen.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          </div>

          {/* Frame on top */}
          <Image
            src="/assets/hero-frame.png"
            alt="Subscrr on iPhone"
            width={1350}
            height={2760}
            className="hero__bezel"
            priority
          />

          {/* QR code floating card */}
          <div className="hero__qr hero__qr-glass">
            <button
              type="button"
              onClick={() => setShowComingSoon(true)}
              className="block cursor-pointer"
              aria-label="Download Subscrr on the App Store"
            >
              <Image
                src="/assets/qr-appstore.svg"
                alt="QR code — download Subscrr on the App Store"
                width={312}
                height={312}
              />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Coming Soon Modal */}
      {showComingSoon && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] bg-[#F4F2EC] p-8 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowComingSoon(false)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-lg transition hover:bg-black hover:text-white"
            >
              ×
            </button>

            {/* Apple icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A1712] text-2xl text-white">
              
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Subscrr for iOS
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#7C766C]">
              We're preparing the mobile experience. The web app is currently
              available on desktop and mobile browsers.
            </p>

            <div className="mt-6 inline-flex rounded-full bg-[#FF2500] px-5 py-2.5 text-sm font-medium text-white">
              Coming Soon
            </div>
          </div>
        </div>
      )}
    </section>
  );
}