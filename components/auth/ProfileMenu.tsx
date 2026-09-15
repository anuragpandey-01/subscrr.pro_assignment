"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
}

interface ProfileMenuProps {
  user: User;
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1712] text-sm font-semibold text-white transition hover:scale-105"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(26,23,18,0.14)]">
          {/* User information */}
          <div className="border-b border-black/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF2500] text-sm font-semibold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1A1712]">
                  {user.name}
                </p>

                <p className="truncate text-xs text-[#7C766C]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <span className="inline-flex rounded-full bg-[#F4F2EC] px-3 py-1 text-xs font-medium capitalize text-[#1A1712]">
                {user.plan} plan
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm font-medium text-[#1A1712] transition hover:bg-[#F4F2EC]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2EC]">
                ▦
              </span>

              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-medium text-[#1A1712] transition hover:bg-[#F4F2EC]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2EC]">
                ◯
              </span>

              My Profile
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-medium text-[#1A1712] transition hover:bg-[#F4F2EC]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2EC]">
                ⚙
              </span>

              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-black/10 p-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-medium text-[#FF2500] transition hover:bg-[#FFF1EE] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1EE]">
                ↪
              </span>

              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}