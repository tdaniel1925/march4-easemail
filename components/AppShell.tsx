"use client";

import { useState, useEffect, useCallback, Suspense, lazy, useRef } from "react";
import { useAccountStore } from "@/lib/stores/account-store";
import {
  useDataCacheStore,
  pathToView,
  type AppView,
} from "@/lib/stores/data-cache";

// ─── Lazy-load all client components ─────────────────────────────────────────

const InboxClient = lazy(() => import("@/components/inbox/InboxClient"));
const CalendarClient = lazy(() => import("@/components/calendar/CalendarClient"));
const DashboardClient = lazy(() => import("@/components/dashboard/DashboardClient"));
const ContactsClient = lazy(() => import("@/components/contacts/ContactsClient"));
const FolderClient = lazy(() => import("@/components/folder/FolderClient"));
const AttachmentsClient = lazy(() => import("@/components/attachments/AttachmentsClient"));
const ComposeClient = lazy(() => import("@/components/compose/ComposeClient"));
const SettingsClient = lazy(() => import("@/components/settings/SettingsClient"));
const HelpClient = lazy(() => import("@/components/help/HelpClient"));
const AccountsClient = lazy(() => import("@/components/accounts/AccountsClient"));
const SignaturesClient = lazy(() => import("@/components/signatures/SignaturesClient"));
const EmailRulesClient = lazy(() => import("@/components/email-rules/EmailRulesClient"));
const TemplatesClient = lazy(() => import("@/components/templates/TemplatesClient"));
const TeamsClient = lazy(() => import("@/components/teams/TeamsClient"));
const EmailReadClient = lazy(() => import("@/components/inbox/EmailReadClient"));

// ─── Types ───────────────────────────────────────────────────────────────────

import type { EmailMessage } from "@/lib/types/email";
import type { CalEvent } from "@/lib/types/calendar";
import type { ProviderType } from "@/lib/providers/types";

interface CalendarEvent {
  id: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  attendeeCount: number;
}

interface ComposeAccount {
  id: string;
  homeAccountId: string;
  msEmail: string;
  displayName: string | null;
  isDefault: boolean;
}

interface AccountItem {
  id: string;
  msEmail: string;
  email: string;
  displayName: string;
  homeAccountId: string;
  isDefault: boolean;
  connectedAt: string;
  providerType: ProviderType;
}

interface DashboardData {
  userName: string;
  events: CalendarEvent[];
  recentUnread: (EmailMessage & { accountName?: string })[];
  eventsToday: number;
  emailsData: number[];
  sentData: number[];
  draftsCount: number;
  hoursWaiting: number;
  attachmentsToday: number;
  unreadTrend: number;
}

/** Initial SSR data passed from the layout */
export interface AppShellProps {
  initialEmails: EmailMessage[];
  initialNextLink: string | null;
  totalUnread: number;
  initialEvents: CalEvent[];
  weekStart: string;
  userTimeZone: string;
  dashboardData: DashboardData;
  profile: { name: string; email: string };
  composeAccounts: ComposeAccount[];
  accountsList: AccountItem[];
  userName: string;
  userEmail: string;
  initialView: AppView;
  initialFolderId?: string;
  initialEmailId?: string;
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function ViewSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ color: "rgb(155 155 155)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgb(220 220 220)", borderTopColor: "rgb(138 9 9)" }} />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}

// ─── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell(props: AppShellProps) {
  const activeView = useDataCacheStore((s) => s.activeView);
  const activeFolderId = useDataCacheStore((s) => s.activeFolderId);
  const activeEmailId = useDataCacheStore((s) => s.activeEmailId);
  const activeEmailAccountId = useDataCacheStore((s) => s.activeEmailAccountId);
  const activeEmailReturnTo = useDataCacheStore((s) => s.activeEmailReturnTo);
  const composeParams = useDataCacheStore((s) => s.composeParams);
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const inboxUnread = useAccountStore((s) => s.inboxUnread);
  const prevAccountRef = useRef(activeAccount?.homeAccountId);

  // ── Account-specific data (starts with SSR props, refetched on account switch)
  const [inboxEmails, setInboxEmails] = useState(props.initialEmails);
  const [inboxNextLink, setInboxNextLink] = useState(props.initialNextLink);
  const [calEvents, setCalEvents] = useState(props.initialEvents);
  const [calWeekStart, setCalWeekStart] = useState(props.weekStart);
  const [dashData, setDashData] = useState(props.dashboardData);
  const [accountSwitching, setAccountSwitching] = useState(false);

  // ── Load draft count on mount and on account switch ───────────────────────
  useEffect(() => {
    if (!activeAccount) return;
    const hid = encodeURIComponent(activeAccount.homeAccountId);
    fetch(`/api/drafts?homeAccountId=${hid}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.drafts != null) {
          useAccountStore.getState().setDraftCount(
            Array.isArray(data.drafts) ? data.drafts.length : 0
          );
        }
      })
      .catch(() => {});
  }, [activeAccount?.homeAccountId]);

  // ── Initialize view from URL on mount ──────────────────────────────────────
  useEffect(() => {
    const { view, folderId, emailId } = pathToView(window.location.pathname);
    useDataCacheStore.getState().setActiveView(view);
    if (folderId) useDataCacheStore.getState().setActiveFolderId(folderId);
    if (emailId) {
      const sp = new URLSearchParams(window.location.search);
      useDataCacheStore.getState().setActiveEmail(
        emailId,
        sp.get("homeAccountId"),
        sp.get("returnTo") ?? "/inbox"
      );
    }
    if (view === "compose") {
      const sp = new URLSearchParams(window.location.search);
      useDataCacheStore.getState().setComposeParams({
        mode: (sp.get("mode") as "reply" | "replyAll" | "forward") || undefined,
        messageId: sp.get("messageId") || undefined,
        draftId: sp.get("draftId") || undefined,
        homeAccountId: sp.get("homeAccountId") || undefined,
        panel: sp.get("panel") || undefined,
        to: sp.get("to") || undefined,
      });
    }
  }, []);

  // ── Handle browser back/forward ────────────────────────────────────────────
  useEffect(() => {
    function onPopState() {
      const { view, folderId, emailId } = pathToView(window.location.pathname);
      useDataCacheStore.getState().setActiveView(view);
      if (folderId) useDataCacheStore.getState().setActiveFolderId(folderId);
      if (emailId) {
        const sp = new URLSearchParams(window.location.search);
        useDataCacheStore.getState().setActiveEmail(
          emailId,
          sp.get("homeAccountId"),
          sp.get("returnTo") ?? "/inbox"
        );
      }
      if (view === "compose") {
        const sp = new URLSearchParams(window.location.search);
        useDataCacheStore.getState().setComposeParams({
          mode: (sp.get("mode") as "reply" | "replyAll" | "forward") || undefined,
          messageId: sp.get("messageId") || undefined,
          draftId: sp.get("draftId") || undefined,
          homeAccountId: sp.get("homeAccountId") || undefined,
          panel: sp.get("panel") || undefined,
          to: sp.get("to") || undefined,
        });
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // ── Refetch data when account changes ──────────────────────────────────────
  useEffect(() => {
    const currentId = activeAccount?.homeAccountId;
    if (!currentId || currentId === prevAccountRef.current) return;
    prevAccountRef.current = currentId;
    setAccountSwitching(true);

    const hid = encodeURIComponent(currentId);

    // Compute current week start (Monday) for calendar fetch
    const now = new Date();
    const dow = now.getDay();
    const mondayOffset = dow === 0 ? 6 : dow - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    const weekStartStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

    // Fetch inbox + calendar + drafts count in parallel on account switch
    Promise.all([
      fetch(`/api/mail/inbox?homeAccountId=${hid}&$top=50`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(`/api/calendar/week?start=${weekStartStr}&homeAccountId=${hid}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(`/api/drafts?homeAccountId=${hid}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null),
    ]).then(([inboxData, calData, draftsData]) => {
      if (inboxData) {
        setInboxEmails(inboxData.emails ?? []);
        setInboxNextLink(inboxData.nextLink ?? null);
        if (inboxData.unreadCount != null) {
          useAccountStore.getState().setInboxUnread(inboxData.unreadCount);
        }
      }
      if (calData) {
        setCalEvents(calData.events ?? []);
        if (calData.weekStart) setCalWeekStart(calData.weekStart);
      }
      if (draftsData?.drafts != null) {
        useAccountStore.getState().setDraftCount(
          Array.isArray(draftsData.drafts) ? draftsData.drafts.length : 0
        );
      }
      setAccountSwitching(false);
    });
  }, [activeAccount?.homeAccountId]);

  // ── Background polling (30s) for active account inbox ──────────────────────
  useEffect(() => {
    if (!activeAccount) return;
    const interval = setInterval(() => {
      const hid = activeAccount.homeAccountId;
      fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(hid)}&$top=5`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data) return;
          if (data.unreadCount != null) {
            useAccountStore.getState().setInboxUnread(data.unreadCount);
          }
          // Prepend any emails not already in the list
          if (Array.isArray(data.emails) && data.emails.length > 0) {
            setInboxEmails((prev) => {
              const existingIds = new Set(prev.map((e: { id: string }) => e.id));
              const fresh = data.emails.filter((e: { id: string }) => !existingIds.has(e.id));
              return fresh.length > 0 ? [...fresh, ...prev] : prev;
            });
          }
        })
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [activeAccount?.homeAccountId]);

  // ── Render view ────────────────────────────────────────────────────────────
  const renderView = useCallback(() => {
    // Show skeleton during account switch for data-heavy views
    if (accountSwitching && ["inbox", "calendar", "dashboard"].includes(activeView)) {
      return <ViewSkeleton />;
    }

    switch (activeView) {
      case "inbox":
        return (
          <InboxClient
            initialEmails={inboxEmails}
            initialNextLink={inboxNextLink}
            totalUnread={inboxUnread}
          />
        );

      case "calendar":
        return (
          <CalendarClient
            weekStart={calWeekStart}
            events={calEvents}
            userTimeZone={props.userTimeZone}
          />
        );

      case "dashboard":
        return (
          <DashboardClient
            userName={dashData.userName}
            events={dashData.events}
            recentUnread={dashData.recentUnread}
            eventsToday={dashData.eventsToday}
            emailsData={dashData.emailsData}
            sentData={dashData.sentData}
            draftsCount={dashData.draftsCount}
            hoursWaiting={dashData.hoursWaiting}
            attachmentsToday={dashData.attachmentsToday}
            unreadTrend={dashData.unreadTrend}
          />
        );

      case "contacts":
        return <ContactsClient key={activeAccount?.homeAccountId ?? "contacts"} contacts={[]} />;

      case "drafts":
        return <FolderClient key={`drafts-${activeAccount?.homeAccountId}`} folder="drafts" folderLabel="Drafts" initialEmails={[]} initialNextLink={null} />;

      case "sent":
        return <FolderClient key={`sent-${activeAccount?.homeAccountId}`} folder="sent" folderLabel="Sent" initialEmails={[]} initialNextLink={null} />;

      case "starred":
        return <FolderClient key={`starred-${activeAccount?.homeAccountId}`} folder="starred" folderLabel="Starred" initialEmails={[]} initialNextLink={null} />;

      case "trash":
        return <FolderClient key={`trash-${activeAccount?.homeAccountId}`} folder="trash" folderLabel="Trash" initialEmails={[]} initialNextLink={null} />;

      case "attachments":
        return (
          <AttachmentsClient
            key={`attachments-${activeAccount?.homeAccountId}`}
            attachments={[]}
            receivedNextLink={null}
            sentNextLink={null}
            homeAccountId={activeAccount?.homeAccountId ?? ""}
          />
        );

      case "compose":
        return (
          <ComposeClient
            accounts={props.composeAccounts}
            mode={composeParams?.mode}
            messageId={composeParams?.messageId}
            draftId={composeParams?.draftId}
            defaultAccountId={composeParams?.homeAccountId ?? activeAccount?.homeAccountId}
            initialTo={composeParams?.to}
            initialPanel={composeParams?.panel}
          />
        );

      case "settings":
        return <SettingsClient profile={props.profile} />;

      case "help":
        return <HelpClient />;

      case "accounts":
        return <AccountsClient accounts={props.accountsList} />;

      case "signatures":
        return <SignaturesClient userEmail={props.userEmail} />;

      case "email-rules":
        return <EmailRulesClient />;

      case "templates":
        return <TemplatesClient />;

      case "teams":
        return (
          <TeamsClient
            userName={props.userName}
            userEmail={props.userEmail}
          />
        );

      case "folder":
        return (
          <FolderClient
            key={`folder-${activeFolderId}-${activeAccount?.homeAccountId}`}
            folder={activeFolderId ?? ""}
            folderLabel="Folder"
            initialEmails={[]}
            initialNextLink={null}
          />
        );

      case "email-read":
        if (!activeEmailId) return <ViewSkeleton />;
        return (
          <EmailReadClient
            email={{
              id: activeEmailId,
              subject: "",
              bodyPreview: "",
              receivedDateTime: "",
              isRead: true,
              hasAttachments: false,
              flag: { flagStatus: "notFlagged" },
              from: { name: "", address: "" },
              to: [],
              cc: [],
              body: { content: "", contentType: "text" },
              attachments: [],
            }}
            homeAccountId={activeEmailAccountId ?? activeAccount?.homeAccountId ?? ""}
            returnTo={activeEmailReturnTo ?? "/inbox"}
          />
        );

      default:
        return (
          <InboxClient
            initialEmails={inboxEmails}
            initialNextLink={inboxNextLink}
            totalUnread={inboxUnread}
          />
        );
    }
  }, [activeView, activeFolderId, activeEmailId, activeEmailAccountId, activeEmailReturnTo, composeParams, activeAccount?.homeAccountId, props, inboxEmails, inboxNextLink, calEvents, calWeekStart, dashData, accountSwitching]);

  return (
    <Suspense fallback={<ViewSkeleton />}>
      {renderView()}
    </Suspense>
  );
}
