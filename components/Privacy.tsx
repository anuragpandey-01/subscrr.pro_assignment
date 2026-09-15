"use client";

import { useEffect, useState } from "react";

type Badge = {
  icon: string;
  label: string;
  title: string;
  description: string;
};

const badges: Badge[] = [
  {
    icon: "☁️",
    label: "Secure cloud sync",
    title: "Your subscriptions stay with your account.",
    description:
      "Your subscription information is securely associated with your Subscrr account so you can access it when you sign in on supported devices.",
  },
  {
    icon: "🚫",
    label: "No ads in the app",
    title: "A cleaner experience.",
    description:
      "Subscrr is designed without advertising inside the application. Your dashboard stays focused on subscriptions, payments and spending.",
  },
  {
    icon: "🔒",
    label: "No data sold",
    title: "Your data stays yours.",
    description:
      "Subscrr does not sell your personal information or subscription data to advertisers or use it to build advertising profiles.",
  },
  {
    icon: "👤",
    label: "Anonymous stats only",
    title: "Privacy-first product analytics.",
    description:
      "Product statistics can help us understand how the application is being used and improve the experience without being used to personally identify you.",
  },
];

export default function Privacy() {
  const [activeBadge, setActiveBadge] =
    useState<Badge | null>(null);

  useEffect(() => {
    if (!activeBadge) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveBadge(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [activeBadge]);

  return (
    <>
      <section
        className="privacy"
        id="privacy"
        aria-label="Privacy"
      >
        <span className="privacy__label">
          Private by Design.
        </span>

        <h2 className="privacy__title reveal-up">
          What you pay for lives in your own account.
          Your data stays protected, your experience
          stays clean, and privacy remains at the center
          of Subscrr.
        </h2>

        <div className="privacy__badges">
          {badges.map((badge) => (
            <button
              key={badge.label}
              type="button"
              className="privacy__badge"
              onClick={() => setActiveBadge(badge)}
              aria-label={`Learn more about ${badge.label}`}
            >
              <span
                aria-hidden="true"
                className="privacy__badge-icon"
              >
                {badge.icon}
              </span>

              <span className="privacy__badge-label">
                {badge.label}
              </span>

              <span
                aria-hidden="true"
                className="privacy__badge-arrow"
              >
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Privacy information modal */}

      {activeBadge && (
        <div
          className="privacy-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveBadge(null);
            }
          }}
          role="presentation"
        >
          <div
            className="privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
          >
            <button
              type="button"
              className="privacy-modal__close"
              onClick={() => setActiveBadge(null)}
              aria-label="Close privacy information"
            >
              ×
            </button>

            <div
              className="privacy-modal__icon"
              aria-hidden="true"
            >
              {activeBadge.icon}
            </div>

            <span className="privacy-modal__eyebrow">
              SUBSCRR · PRIVACY
            </span>

            <h3
              id="privacy-modal-title"
              className="privacy-modal__title"
            >
              {activeBadge.title}
            </h3>

            <p className="privacy-modal__description">
              {activeBadge.description}
            </p>

            <button
              type="button"
              className="privacy-modal__done"
              onClick={() => setActiveBadge(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .privacy__badge {
          appearance: none;
          cursor: pointer;
          border: 1px solid rgba(26, 23, 18, 0.04);
          font: inherit;
          color: inherit;
          transition:
            transform 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .privacy__badge:hover {
          transform: translateY(-3px);
          background: #ffffff !important;
          border-color: rgba(26, 23, 18, 0.1);
          box-shadow:
            0 10px 25px rgba(26, 23, 18, 0.08);
        }

        .privacy__badge:active {
          transform: translateY(-1px) scale(0.98);
        }

        .privacy__badge:focus-visible {
          outline: 3px solid rgba(255, 37, 0, 0.25);
          outline-offset: 3px;
        }

        .privacy__badge-icon {
          display: inline-flex;
          transition: transform 180ms ease;
        }

        .privacy__badge:hover
          .privacy__badge-icon {
          transform: scale(1.12);
        }

        .privacy__badge-arrow {
          display: inline-block;
          opacity: 0;
          transform: translateX(-5px);
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .privacy__badge:hover
          .privacy__badge-arrow {
          opacity: 0.55;
          transform: translateX(0);
        }

        .privacy-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(20, 20, 26, 0.58);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: privacyBackdropIn
            180ms ease-out both;
        }

        .privacy-modal {
          position: relative;
          width: min(100%, 500px);
          padding: 36px;
          border-radius: 30px;
          background: #f4f2ec;
          color: #1a1712;
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.25);
          animation: privacyModalIn
            260ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .privacy-modal__close {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(26, 23, 18, 0.08);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.7);
          color: #1a1712;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .privacy-modal__close:hover {
          transform: rotate(90deg);
          background: #ffffff;
        }

        .privacy-modal__close:focus-visible {
          outline: 3px solid
            rgba(255, 37, 0, 0.25);
          outline-offset: 2px;
        }

        .privacy-modal__icon {
          width: 62px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border-radius: 19px;
          background: #ffffff;
          font-size: 27px;
        }

        .privacy-modal__eyebrow {
          display: block;
          margin-bottom: 12px;
          color: #ff2500;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .privacy-modal__title {
          max-width: 410px;
          margin: 0;
          font-size: clamp(30px, 6vw, 46px);
          line-height: 0.98;
          letter-spacing: -0.04em;
        }

        .privacy-modal__description {
          margin: 22px 0 0;
          color: #7c766c;
          font-size: 16px;
          line-height: 1.65;
        }

        .privacy-modal__done {
          width: 100%;
          height: 50px;
          margin-top: 30px;
          border: 0;
          border-radius: 999px;
          background: #ff2500;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 180ms ease,
            opacity 180ms ease;
        }

        .privacy-modal__done:hover {
          transform: translateY(-2px);
          opacity: 0.92;
        }

        .privacy-modal__done:active {
          transform: scale(0.98);
        }

        @keyframes privacyBackdropIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes privacyModalIn {
          from {
            opacity: 0;
            transform: translateY(18px)
              scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(0)
              scale(1);
          }
        }

        @media (max-width: 700px) {
          .privacy-modal {
            padding: 30px 24px 24px;
            border-radius: 26px;
          }

          .privacy__badge-arrow {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .privacy__badge,
          .privacy__badge-icon,
          .privacy__badge-arrow,
          .privacy-modal-backdrop,
          .privacy-modal,
          .privacy-modal__close,
          .privacy-modal__done {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}