"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
}

interface UserSettings {
  renewalReminders: boolean;
  emailNotifications: boolean;
  compactDashboard: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  renewalReminders: true,
  emailNotifications: true,
  compactDashboard: false,
};

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Panels
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Settings
  const [settings, setSettings] =
    useState<UserSettings>(DEFAULT_SETTINGS);

  // -----------------------------
  // Scroll effect
  // -----------------------------
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // -----------------------------
  // Check authentication
  // -----------------------------
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      setUser(data.user ?? null);
    } catch (error) {
      console.error("Navbar auth check failed:", error);
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // -----------------------------
  // Check auth when page changes
  // -----------------------------
  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  // -----------------------------
  // Listen for login/logout
  // -----------------------------
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuth();
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
  }, [checkAuth]);

  // -----------------------------
  // Load saved settings
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    try {
      const savedSettings = localStorage.getItem(
        "subscrr-settings"
      );

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, [user]);

  // -----------------------------
  // Save settings
  // -----------------------------
  const updateSetting = (
    key: keyof UserSettings,
    value: boolean
  ) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(updatedSettings);

    try {
      localStorage.setItem(
        "subscrr-settings",
        JSON.stringify(updatedSettings)
      );

      // Notify dashboard/components if they want to react
      window.dispatchEvent(
        new CustomEvent("subscrr-settings-change", {
          detail: updatedSettings,
        })
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // -----------------------------
  // Close profile when clicking outside
  // -----------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".nav-profile")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // -----------------------------
  // Close panels with Escape
  // -----------------------------
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfilePanelOpen(false);
        setSettingsPanelOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // -----------------------------
  // Logout
  // -----------------------------
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setProfileOpen(false);
      setProfilePanelOpen(false);
      setSettingsPanelOpen(false);

      window.dispatchEvent(
        new Event("subscrr-auth-change")
      );

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  // -----------------------------
  // Open profile
  // -----------------------------
  function openProfile() {
    setProfileOpen(false);
    setSettingsPanelOpen(false);
    setProfilePanelOpen(true);
  }

  // -----------------------------
  // Open settings
  // -----------------------------
  function openSettings() {
    setProfileOpen(false);
    setProfilePanelOpen(false);
    setSettingsPanelOpen(true);
  }

  // -----------------------------
  // User initials
  // -----------------------------
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <>
      <header
        className={`nav${scrolled ? " is-scrolled" : ""}`}
        id="top"
      >
        {/* Brand */}
        <Link
          href="/"
          className="nav__brand"
          aria-label="Subscrr home"
        >
          <span className="nav__brand-icon">
            <Image
              src="/assets/Icon.png"
              alt="Subscrr"
              width={30}
              height={30}
            />
          </span>

          <span>Subscrr</span>
        </Link>

        {/* Navigation */}
        <nav className="nav__links" aria-label="Primary">
          <Link href="#work">Overview</Link>

          <Link href="#ai">AI Spend</Link>

          <Link href="#assistant">Assistant</Link>

          <Link href="#privacy">Privacy</Link>

          <Link href="#pricing">Pricing</Link>

          <Link href="#blog">Blog</Link>
        </nav>

        {/* Authentication + App */}
        <div className="nav__actions">
          {checkingAuth ? (
            <div
              className="h-10 w-24"
              aria-hidden="true"
            />
          ) : user ? (
            <>
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className="btn btn--solid btn--sm magnetic"
              >
                Dashboard
              </Link>

              {/* Profile */}
              <div className="nav-profile relative">
                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen((current) => !current)
                  }
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1712] text-sm font-semibold text-white transition hover:scale-105"
                >
                  {initials}
                </button>

                {profileOpen && (
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

                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex rounded-full bg-[#F4F2EC] px-3 py-1 text-xs font-medium capitalize text-[#1A1712]">
                          {user.plan} plan
                        </span>

                        <span className="text-[11px] font-medium text-[#4C63C7]">
                          ● Active
                        </span>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-2">
                      {/* Dashboard */}
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm font-medium text-[#1A1712] transition hover:bg-[#F4F2EC]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2EC]">
                          ▦
                        </span>

                        Dashboard
                      </Link>

                      {/* Profile */}
                      <button
                        type="button"
                        onClick={openProfile}
                        className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left text-sm font-medium text-[#1A1712] transition hover:bg-[#F4F2EC]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F2EC]">
                          ◯
                        </span>

                        My Profile
                      </button>

                      {/* Settings */}
                      <button
                        type="button"
                        onClick={openSettings}
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

                        {loggingOut
                          ? "Logging out..."
                          : "Log out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/login"
                className="nav__login"
              >
                Log in
              </Link>

              {/* Register */}
              <Link
                href="/register"
                className="btn btn--solid btn--sm magnetic"
              >
                Get&nbsp;started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ===================================================== */}
      {/* PROFILE PANEL */}
      {/* ===================================================== */}

      {profilePanelOpen && user && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1712]/30 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProfilePanelOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(26,23,18,0.22)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7C766C]">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#1A1712]">
                  My Profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setProfilePanelOpen(false)
                }
                aria-label="Close profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2EC] text-lg text-[#1A1712] transition hover:scale-105"
              >
                ×
              </button>
            </div>

            {/* Profile content */}
            <div className="p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF2500] text-lg font-bold text-white">
                  {initials}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-[#1A1712]">
                    {user.name}
                  </h3>

                  <p className="truncate text-sm text-[#7C766C]">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-[18px] bg-[#F4F2EC] px-4 py-3">
                  <span className="text-sm text-[#7C766C]">
                    Plan
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-[#1A1712]">
                    {user.plan}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#F4F2EC] px-4 py-3">
                  <span className="text-sm text-[#7C766C]">
                    Account status
                  </span>

                  <span className="text-sm font-semibold text-[#4C63C7]">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#F4F2EC] px-4 py-3">
                  <span className="text-sm text-[#7C766C]">
                    Account ID
                  </span>

                  <span className="max-w-[180px] truncate text-xs font-medium text-[#1A1712]">
                    {user.id}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-[18px] bg-[#F4F2EC] px-4 py-3">
                  <span className="text-sm text-[#7C766C]">
                    Member since
                  </span>

                  <span className="text-sm font-semibold text-[#1A1712]">
                    Since signup
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 rounded-[18px] border border-black/10 bg-white px-4 py-3">
                <p className="text-xs leading-5 text-[#7C766C]">
                  Your account information is used to manage your
                  Subscrr experience, subscriptions, reminders and
                  plan access.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* SETTINGS PANEL */}
      {/* ===================================================== */}

      {settingsPanelOpen && user && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1712]/30 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSettingsPanelOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(26,23,18,0.22)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7C766C]">
                  Preferences
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#1A1712]">
                  Settings
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettingsPanelOpen(false)
                }
                aria-label="Close settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2EC] text-lg text-[#1A1712] transition hover:scale-105"
              >
                ×
              </button>
            </div>

            {/* Settings */}
            <div className="p-6">
              <div className="space-y-3">
                {/* Renewal reminders */}
                <div className="flex items-center justify-between gap-4 rounded-[20px] border border-black/10 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1712]">
                      Renewal reminders
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7C766C]">
                      Get reminders before your subscriptions
                      renew.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "renewalReminders",
                        !settings.renewalReminders
                      )
                    }
                    aria-label="Toggle renewal reminders"
                    aria-pressed={
                      settings.renewalReminders
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      settings.renewalReminders
                        ? "bg-[#FF2500]"
                        : "bg-[#D7D3CB]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        settings.renewalReminders
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Email notifications */}
                <div className="flex items-center justify-between gap-4 rounded-[20px] border border-black/10 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1712]">
                      Email notifications
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7C766C]">
                      Receive important account and renewal
                      updates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "emailNotifications",
                        !settings.emailNotifications
                      )
                    }
                    aria-label="Toggle email notifications"
                    aria-pressed={
                      settings.emailNotifications
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      settings.emailNotifications
                        ? "bg-[#FF2500]"
                        : "bg-[#D7D3CB]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        settings.emailNotifications
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Compact dashboard */}
                <div className="flex items-center justify-between gap-4 rounded-[20px] border border-black/10 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A1712]">
                      Compact dashboard
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7C766C]">
                      Use a more compact layout for dashboard
                      content.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "compactDashboard",
                        !settings.compactDashboard
                      )
                    }
                    aria-label="Toggle compact dashboard"
                    aria-pressed={
                      settings.compactDashboard
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      settings.compactDashboard
                        ? "bg-[#FF2500]"
                        : "bg-[#D7D3CB]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        settings.compactDashboard
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mt-5 rounded-[18px] bg-[#F4F2EC] px-4 py-3">
                <p className="text-xs leading-5 text-[#7C766C]">
                  Settings are saved automatically on this
                  device.
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() =>
                  setSettingsPanelOpen(false)
                }
                className="mt-5 w-full rounded-full bg-[#1A1712] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}