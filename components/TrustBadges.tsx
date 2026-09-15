"use client";

import { useEffect, useState } from "react";

type TrustItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

const trustItems: TrustItem[] = [
  {
    id: "sync",
    icon: "☁️",
    title: "Secure cloud sync",
    description:
      "Your subscription data is securely associated with your Subscrr account so you can access it whenever you sign in.",
  },
  {
    id: "ads",
    icon: "🚫",
    title: "No ads in the app",
    description:
      "Subscrr is designed without advertising inside the application. Your experience stays focused on your subscriptions, payments and spending.",
  },
  {
    id: "data",
    icon: "🔒",
    title: "No data sold",
    description:
      "Your personal information and subscription data are not sold to advertisers or used to build advertising profiles.",
  },
  {
    id: "stats",
    icon: "👤",
    title: "Anonymous stats only",
    description:
      "Product statistics are designed to help improve Subscrr without being used to identify you personally.",
  },
];

export default function TrustBadges() {
  const [activeItem, setActiveItem] =
    useState<TrustItem | null>(null);

  // Close modal with Escape
  useEffect(() => {
    if (!activeItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveItem(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    // Prevent page scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [activeItem]);

  return (
    <>
      <section
        aria-label="Subscrr privacy and trust"
        style={{
          width: "100%",
          padding: "12px 24px 24px",
          background: "#F4F2EC",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {trustItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItem(item)}
              aria-label={`Learn more about ${item.title}`}
              className="trust-badge"
            >
              <span
                className="trust-badge__icon"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span>{item.title}</span>

              <span
                className="trust-badge__arrow"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}

      {activeItem && (
        <div
          className="trust-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveItem(null);
            }
          }}
        >
          <div
            className="trust-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trust-modal-title"
          >
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="trust-modal__close"
              aria-label="Close"
            >
              ×
            </button>

            <div className="trust-modal__icon">
              {activeItem.icon}
            </div>

            <p className="trust-modal__eyebrow">
              Subscrr · Privacy
            </p>

            <h2 id="trust-modal-title">
              {activeItem.title}
            </h2>

            <p className="trust-modal__description">
              {activeItem.description}
            </p>

            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="trust-modal__button"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .trust-badge {
          appearance: none;
          border: 1px solid rgba(26, 23, 18, 0.04);
          background: #e9e6df;
          color: #1a1712;
          min-height: 48px;
          padding: 0 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition:
            transform 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .trust-badge:hover {
          transform: translateY(-3px);
          background: #ffffff;
          border-color: rgba(26, 23, 18, 0.08);
          box-shadow:
            0 10px 25px rgba(26, 23, 18, 0.08);
        }

        .trust-badge:active {
          transform: translateY(-1px) scale(0.98);
        }

        .trust-badge:focus-visible {
          outline: 3px solid rgba(255, 37, 0, 0.25);
          outline-offset: 3px;
        }

        .trust-badge__icon {
          font-size: 16px;
          line-height: 1;
        }

        .trust-badge__arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition:
            opacity 180ms ease,
            transform 180ms ease;
          font-size: 15px;
        }

        .trust-badge:hover .trust-badge__arrow {
          opacity: 0.55;
          transform: translateX(0);
        }

        .trust-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(20, 20, 26, 0.58);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: trustBackdropIn 180ms ease-out both;
        }

        .trust-modal {
          position: relative;
          width: min(100%, 480px);
          background: #f4f2ec;
          color: #1a1712;
          border-radius: 30px;
          padding: 34px;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.22);
          animation: trustModalIn 260ms ease-out both;
        }

        .trust-modal__close {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(26, 23, 18, 0.08);
          background: rgba(255, 255, 255, 0.7);
          color: #1a1712;
          border-radius: 50%;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .trust-modal__close:hover {
          transform: rotate(90deg);
          background: #ffffff;
        }

        .trust-modal__close:focus-visible {
          outline: 3px solid rgba(255, 37, 0, 0.25);
          outline-offset: 2px;
        }

        .trust-modal__icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          margin-bottom: 24px;
        }

        .trust-modal__eyebrow {
          margin: 0 0 10px;
          color: #ff2500;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }

        .trust-modal h2 {
          margin: 0;
          max-width: 360px;
          font-size: clamp(30px, 6vw, 44px);
          line-height: 0.98;
          letter-spacing: -0.04em;
        }

        .trust-modal__description {
          margin: 20px 0 0;
          color: #7c766c;
          font-size: 16px;
          line-height: 1.65;
        }

        .trust-modal__button {
          margin-top: 28px;
          width: 100%;
          height: 48px;
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

        .trust-modal__button:hover {
          transform: translateY(-2px);
          opacity: 0.92;
        }

        .trust-modal__button:active {
          transform: scale(0.98);
        }

        @keyframes trustBackdropIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes trustModalIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 700px) {
          .trust-badge {
            flex: 1 1 calc(50% - 7px);
            min-width: 145px;
            padding: 0 14px;
            font-size: 14px;
          }

          .trust-badge__arrow {
            display: none;
          }

          .trust-modal {
            padding: 28px 24px 24px;
            border-radius: 26px;
          }
        }

        @media (max-width: 430px) {
          .trust-badge {
            flex-basis: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .trust-badge,
          .trust-badge__arrow,
          .trust-modal-backdrop,
          .trust-modal,
          .trust-modal__close,
          .trust-modal__button {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}