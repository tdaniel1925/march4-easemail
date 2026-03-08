"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsSection =
  | "profile"
  | "notifications"
  | "appearance"
  | "privacy"
  | "signout";

interface Profile {
  name: string;
  email: string;
}

interface NotificationSettings {
  newEmail: boolean;
  dailyDigest: boolean;
  aiReplySuggestions: boolean;
  calendarReminders: boolean;
  weeklyReport: boolean;
}

type FontSize = "default" | "compact" | "comfortable";
type EmailDensity = "comfortable" | "compact";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
      style={{ backgroundColor: on ? "rgb(138 9 9)" : "rgb(212 212 212)" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(24px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  label,
  active,
  onClick,
  isDestructive,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  isDestructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? "rgb(253 235 235)" : "transparent",
        color: isDestructive
          ? "rgb(185 28 28)"
          : active
          ? "rgb(83 5 5)"
          : "rgb(82 82 82)",
      }}
    >
      {label}
    </button>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ profile }: { profile: Profile }) {
  const [saved, setSaved] = useState(false);

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile.email.slice(0, 2).toUpperCase();

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "rgb(27 29 29)" }}
        >
          Profile
        </h2>
        <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
          Your account details and connected services.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-[14px] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ backgroundColor: "rgb(138 9 9)" }}
        >
          {initials}
        </div>
        <div>
          <p
            className="text-base font-semibold"
            style={{ color: "rgb(27 29 29)" }}
          >
            {profile.name || "No name set"}
          </p>
          <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
            {profile.email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "rgb(82 82 82)" }}
          >
            Full Name
          </label>
          <input
            type="text"
            defaultValue={profile.name}
            readOnly
            placeholder="Your name"
            className="w-full px-4 py-2.5 text-sm rounded-[10px] border border-neutral-200 bg-neutral-50 outline-none"
            style={{ color: "rgb(27 29 29)" }}
          />
          <p className="text-xs mt-1" style={{ color: "rgb(160 160 160)" }}>
            Name is managed via your Microsoft account.
          </p>
        </div>

        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "rgb(82 82 82)" }}
          >
            Email Address
          </label>
          <input
            type="email"
            defaultValue={profile.email}
            readOnly
            className="w-full px-4 py-2.5 text-sm rounded-[10px] border border-neutral-200 bg-neutral-50 outline-none"
            style={{ color: "rgb(27 29 29)" }}
          />
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[10px] border border-neutral-200"
          style={{ backgroundColor: "rgb(250 250 250)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "rgb(22 163 74)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm" style={{ color: "rgb(55 55 55)" }}>
            Microsoft 365
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
            style={{
              backgroundColor: "rgb(220 252 231)",
              color: "rgb(22 101 52)",
            }}
          >
            Connected
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-[10px] text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "rgb(138 9 9)" }}
        >
          Save Changes
        </button>
        {saved && (
          <span
            className="text-sm font-medium flex items-center gap-1.5"
            style={{ color: "rgb(22 163 74)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Notifications section ────────────────────────────────────────────────────

function NotificationsSection() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newEmail: true,
    dailyDigest: false,
    aiReplySuggestions: true,
    calendarReminders: true,
    weeklyReport: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences from API on mount
  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            newEmail: data.notificationNewEmail,
            dailyDigest: data.notificationDailyDigest,
            aiReplySuggestions: data.notificationAiReplies,
            calendarReminders: data.notificationCalendarReminders,
            weeklyReport: data.notificationWeeklyReport,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Save to API whenever settings change
  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    setSaving(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationNewEmail: newSettings.newEmail,
          notificationDailyDigest: newSettings.dailyDigest,
          notificationAiReplies: newSettings.aiReplySuggestions,
          notificationCalendarReminders: newSettings.calendarReminders,
          notificationWeeklyReport: newSettings.weeklyReport,
        }),
      });
    } catch (err) {
      console.error("Failed to save notification settings:", err);
    } finally {
      setSaving(false);
    }
  }, []);

  function toggle(key: keyof NotificationSettings) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      saveSettings(updated);
      return updated;
    });
  }

  const rows: {
    key: keyof NotificationSettings;
    label: string;
    desc: string;
  }[] = [
    {
      key: "newEmail",
      label: "New email notifications",
      desc: "Get notified when new emails arrive in your inbox.",
    },
    {
      key: "dailyDigest",
      label: "Daily digest",
      desc: "Receive a morning summary of unread emails and upcoming events.",
    },
    {
      key: "aiReplySuggestions",
      label: "AI reply suggestions",
      desc: "Show AI-generated quick reply options when reading emails.",
    },
    {
      key: "calendarReminders",
      label: "Calendar reminders",
      desc: "Notify you 15 minutes before calendar events.",
    },
    {
      key: "weeklyReport",
      label: "Weekly activity report",
      desc: "A summary of your email and calendar activity each Monday.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "rgb(27 29 29)" }}
        >
          Notifications
        </h2>
        <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
          Choose which notifications you want to receive.
        </p>
      </div>

      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-4 px-4 py-4 rounded-[14px] border border-neutral-200 bg-white"
          >
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(27 29 29)" }}
              >
                {row.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgb(115 115 115)" }}>
                {row.desc}
              </p>
            </div>
            <Toggle
              on={settings[row.key]}
              onChange={() => toggle(row.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appearance section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const [fontSize, setFontSize] = useState<FontSize>("default");
  const [density, setDensity] = useState<EmailDensity>("comfortable");
  const [loading, setLoading] = useState(true);

  // Load preferences from API on mount
  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setFontSize(data.fontSize as FontSize);
          setDensity(data.emailDensity as EmailDensity);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Save fontSize to API
  const saveFontSize = async (newSize: FontSize) => {
    setFontSize(newSize);
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontSize: newSize }),
      });
    } catch (err) {
      console.error("Failed to save fontSize:", err);
    }
  };

  // Save density to API
  const saveDensity = async (newDensity: EmailDensity) => {
    setDensity(newDensity);
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailDensity: newDensity }),
      });
    } catch (err) {
      console.error("Failed to save emailDensity:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "rgb(27 29 29)" }}
        >
          Appearance
        </h2>
        <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
          Customise how EaseMail looks and feels.
        </p>
      </div>

      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "rgb(115 115 115)" }}
        >
          Theme
        </p>
        <div className="flex gap-3">
          <div
            className="flex-1 rounded-[14px] border-2 p-4 cursor-default"
            style={{ borderColor: "rgb(138 9 9)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "rgb(138 9 9)" }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(138 9 9)" }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "rgb(27 29 29)" }}
              >
                Light
              </span>
            </div>
            <div className="h-8 rounded-[6px] bg-white border border-neutral-200" />
          </div>

          <div
            className="flex-1 rounded-[14px] border-2 border-neutral-200 p-4 cursor-not-allowed opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />
              <span
                className="text-sm font-medium"
                style={{ color: "rgb(82 82 82)" }}
              >
                Dark
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full ml-auto"
                style={{
                  backgroundColor: "rgb(243 243 243)",
                  color: "rgb(115 115 115)",
                }}
              >
                Coming soon
              </span>
            </div>
            <div className="h-8 rounded-[6px]" style={{ backgroundColor: "rgb(40 40 40)" }} />
          </div>
        </div>
      </div>

      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "rgb(115 115 115)" }}
        >
          Font Size
        </p>
        <div className="flex gap-2">
          {(["default", "compact", "comfortable"] as FontSize[]).map((size) => (
            <button
              key={size}
              onClick={() => saveFontSize(size)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors border"
              style={{
                borderColor:
                  fontSize === size ? "rgb(138 9 9)" : "rgb(212 212 212)",
                backgroundColor:
                  fontSize === size ? "rgb(253 235 235)" : "white",
                color:
                  fontSize === size ? "rgb(83 5 5)" : "rgb(82 82 82)",
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor:
                    fontSize === size ? "rgb(138 9 9)" : "rgb(212 212 212)",
                }}
              >
                {fontSize === size && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "rgb(138 9 9)" }}
                  />
                )}
              </div>
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "rgb(115 115 115)" }}
        >
          Email Density
        </p>
        <div className="flex gap-2">
          {(["comfortable", "compact"] as EmailDensity[]).map((d) => (
            <button
              key={d}
              onClick={() => saveDensity(d)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors border"
              style={{
                borderColor:
                  density === d ? "rgb(138 9 9)" : "rgb(212 212 212)",
                backgroundColor:
                  density === d ? "rgb(253 235 235)" : "white",
                color: density === d ? "rgb(83 5 5)" : "rgb(82 82 82)",
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor:
                    density === d ? "rgb(138 9 9)" : "rgb(212 212 212)",
                }}
              >
                {density === d && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "rgb(138 9 9)" }}
                  />
                )}
              </div>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Privacy section ──────────────────────────────────────────────────────────

function PrivacySection() {
  const items = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
      title: "AI data usage",
      desc: "Email content is processed by AI only when you use AI features such as AI Composer, Dictate, or Remix. Your emails are never processed in the background.",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
        />
      ),
      title: "No permanent storage",
      desc: "No email data is stored permanently — only active session tokens are kept. When you sign out, your session is invalidated immediately.",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      ),
      title: "Disconnect anytime",
      desc: "You can disconnect your Microsoft account at any time from the Email Accounts page. All associated tokens are revoked instantly.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "rgb(27 29 29)" }}
        >
          Privacy
        </h2>
        <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
          How EaseMail handles your data.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[14px] border border-neutral-200 bg-white p-5 flex items-start gap-4"
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgb(253 235 235)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                style={{ color: "rgb(138 9 9)" }}
              >
                {item.icon}
              </svg>
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "rgb(27 29 29)" }}
              >
                {item.title}
              </p>
              <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsClient({ profile }: { profile: Profile }) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const navItems: { id: SettingsSection; label: string; isDestructive?: boolean }[] =
    [
      { id: "profile", label: "Profile" },
      { id: "notifications", label: "Notifications" },
      { id: "appearance", label: "Appearance" },
      { id: "privacy", label: "Privacy" },
      { id: "signout", label: "Sign Out", isDestructive: true },
    ];

  return (
    <div className="flex flex-col flex-1" style={{ minWidth: 0, height: "100vh" }}>
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Nav */}
        <aside
          className="flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col pt-6 px-3 gap-1"
          style={{ width: "12rem" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider px-3 mb-2"
            style={{ color: "rgb(160 160 160)" }}
          >
            Settings
          </p>
          {navItems.map((item) => {
            if (item.id === "signout") {
              return (
                <a
                  key={item.id}
                  href="/api/auth/signout"
                  className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors"
                  style={{ color: "rgb(185 28 28)" }}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <NavItem
                key={item.id}
                label={item.label}
                active={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
                isDestructive={item.isDestructive}
              />
            );
          })}
          {/* Email settings links */}
          <div className="my-2 border-t border-neutral-100" />
          <p
            className="text-xs font-semibold uppercase tracking-wider px-3 mb-1"
            style={{ color: "rgb(160 160 160)" }}
          >
            Email
          </p>
          <Link
            href="/signatures"
            className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100"
          >
            Signatures
          </Link>
          <Link
            href="/email-rules"
            className="w-full text-left px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-neutral-600 hover:bg-neutral-100"
          >
            Email Rules
          </Link>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl">
            {activeSection === "profile" && (
              <ProfileSection profile={profile} />
            )}
            {activeSection === "notifications" && <NotificationsSection />}
            {activeSection === "appearance" && <AppearanceSection />}
            {activeSection === "privacy" && <PrivacySection />}
          </div>
        </div>
      </div>
    </div>
  );
}
