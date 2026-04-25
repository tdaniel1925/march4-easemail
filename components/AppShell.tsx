"use client";

import { useEffect, useCallback, Suspense, lazy, useRef } from "react";
import { useAccountStore } from "@/lib/stores/account-store";
import {
  useDataCacheStore,
  pathToView,
  viewToPath,
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

/** Initial SSR data passed from the layout */
export interface AppShellProps {
  /** Initial inbox emails for the active account */
  initialEmails: EmailMessage[];
  initialNextLink: string | null;
  totalUnread: number;
  /** Initial calendar events for the current week */
  initialEvents: CalEvent[];
  weekStart: string;
  userTimeZone: string;
  /** Dashboard data */
  dashboardData: {
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
  };
  /** User profile */
  profile: { name: string; email: string };
  /** Compose accounts */
  composeAccounts: ComposeAccount[];
  /** Accounts list */
  accountsList: AccountItem[];
  /** User info for Teams/Sidebar */
  userName: string;
  userEmail: string;
  /** The initial view to render based on the URL */
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
  const prevAccountRef = useRef(activeAccount?.homeAccountId);

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
        });
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // ── Background polling (30s) for active account inbox ──────────────────────
  useEffect(() => {
    if (!activeAccount) return;
    const interval = setInterval(() => {
      const hid = activeAccount.homeAccountId;
      fetch(`/api/mail/inbox?homeAccountId=${encodeURIComponent(hid)}&$top=5`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.unreadCount != null) {
            useAccountStore.getState().setInboxUnread(data.unreadCount);
          }
        })
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [activeAccount?.homeAccountId]);

  // ── Render view ────────────────────────────────────────────────────────────
  const renderView = useCallback(() => {
    switch (activeView) {
      case "inbox":
        return (
          <InboxClient
            initialEmails={props.initialEmails}
            initialNextLink={props.initialNextLink}
            totalUnread={props.totalUnread}
          />
        );

      case "calendar":
        return (
          <CalendarClient
            weekStart={props.weekStart}
            events={props.initialEvents}
            userTimeZone={props.userTimeZone}
          />
        );

      case "dashboard":
        return (
          <DashboardClient
            userName={props.dashboardData.userName}
            events={props.dashboardData.events}
            recentUnread={props.dashboardData.recentUnread}
            eventsToday={props.dashboardData.eventsToday}
            emailsData={props.dashboardData.emailsData}
            sentData={props.dashboardData.sentData}
            draftsCount={props.dashboardData.draftsCount}
            hoursWaiting={props.dashboardData.hoursWaiting}
            attachmentsToday={props.dashboardData.attachmentsToday}
            unreadTrend={props.dashboardData.unreadTrend}
          />
        );

      case "contacts":
        return <ContactsClient contacts={[]} />;

      case "drafts":
        return <FolderClient folder="drafts" folderLabel="Drafts" initialEmails={[]} initialNextLink={null} />;

      case "sent":
        return <FolderClient folder="sent" folderLabel="Sent" initialEmails={[]} initialNextLink={null} />;

      case "starred":
        return <FolderClient folder="starred" folderLabel="Starred" initialEmails={[]} initialNextLink={null} />;

      case "trash":
        return <FolderClient folder="trash" folderLabel="Trash" initialEmails={[]} initialNextLink={null} />;

      case "attachments":
        return (
          <AttachmentsClient
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
            initialEmails={props.initialEmails}
            initialNextLink={props.initialNextLink}
            totalUnread={props.totalUnread}
          />
        );
    }
  }, [activeView, activeFolderId, activeEmailId, activeEmailAccountId, activeEmailReturnTo, composeParams, activeAccount?.homeAccountId, props]);

  return (
    <Suspense fallback={<ViewSkeleton />}>
      {renderView()}
    </Suspense>
  );
}
