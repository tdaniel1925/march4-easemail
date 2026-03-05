"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId =
  | "getting-started"
  | "account-billing"
  | "features-tools"
  | "integrations"
  | "troubleshooting"
  | "security-privacy";

interface Article {
  title: string;
  tab: TabId;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ARTICLES: Article[] = [
  { title: "Create Account", tab: "getting-started" },
  { title: "Quick Setup Checklist", tab: "getting-started" },
  { title: "Video Tutorials", tab: "getting-started" },
  { title: "Sign Up & Verify Email", tab: "getting-started" },
  { title: "Complete Your Profile", tab: "getting-started" },
  { title: "Explore the Dashboard", tab: "getting-started" },
  { title: "Connect Your Email Account", tab: "getting-started" },
  { title: "Use AI Tools", tab: "getting-started" },
  { title: "Update Account Information", tab: "account-billing" },
  { title: "Change Password", tab: "account-billing" },
  { title: "Two-Factor Authentication", tab: "account-billing" },
  { title: "Manage Notification Preferences", tab: "account-billing" },
  { title: "Delete Account", tab: "account-billing" },
  { title: "View Billing History", tab: "account-billing" },
  { title: "Upgrade or Downgrade Plan", tab: "account-billing" },
  { title: "Update Payment Method", tab: "account-billing" },
  { title: "Cancel Subscription", tab: "account-billing" },
  { title: "Request Invoice", tab: "account-billing" },
  { title: "AI Composer Guide", tab: "features-tools" },
  { title: "AI Dictate Setup", tab: "features-tools" },
  { title: "Attachments Hub", tab: "features-tools" },
  { title: "Calendar Integration", tab: "features-tools" },
  { title: "Contacts Management", tab: "features-tools" },
  { title: "Search & Filters", tab: "features-tools" },
  { title: "Connect Microsoft 365", tab: "integrations" },
  { title: "Outlook Integration", tab: "integrations" },
  { title: "Exchange Server Setup", tab: "integrations" },
  { title: "Microsoft Teams", tab: "integrations" },
  { title: "Emails Not Loading", tab: "troubleshooting" },
  { title: "Sign-In Issues", tab: "troubleshooting" },
  { title: "AI Features Not Working", tab: "troubleshooting" },
  { title: "Data Encryption", tab: "security-privacy" },
  { title: "Privacy Policy", tab: "security-privacy" },
  { title: "GDPR Compliance", tab: "security-privacy" },
  { title: "Data Retention Policy", tab: "security-privacy" },
];

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "getting-started", label: "Getting Started", emoji: "🚀" },
  { id: "account-billing", label: "Account & Billing", emoji: "👤" },
  { id: "features-tools", label: "Features & Tools", emoji: "⚙️" },
  { id: "integrations", label: "Integrations", emoji: "🔗" },
  { id: "troubleshooting", label: "Troubleshooting", emoji: "🛠️" },
  { id: "security-privacy", label: "Security & Privacy", emoji: "🔒" },
];

// ─── Shared FAQ Accordion ─────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-[14px] border border-neutral-200 bg-white overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <span className="text-sm font-semibold pr-4" style={{ color: "rgb(27 29 29)" }}>
              {faq.question}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 flex-shrink-0 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{
                color: "rgb(115 115 115)",
                transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded === i && (
            <div
              className="px-5 pb-4 text-sm border-t border-neutral-100"
              style={{ color: "rgb(82 82 82)" }}
            >
              <p className="pt-3 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GettingStartedPanel() {
  const faqs: FaqItem[] = [
    {
      question: "How do I connect my law firm's Microsoft 365 email account?",
      answer:
        "Go to Email Accounts in the sidebar and click 'Add Account'. You will be redirected to the Microsoft sign-in page. Sign in with your firm's Microsoft 365 credentials. If your IT department has restricted third-party OAuth apps, ask them to whitelist EaseMail in the Microsoft 365 admin portal under Azure Active Directory > Enterprise Applications.",
    },
    {
      question: "Can I connect multiple email accounts (e.g. personal and client-facing)?",
      answer:
        "Yes. EaseMail supports multiple connected Microsoft 365 accounts. Click 'Add Account' on the Email Accounts page to add a second or third address. Use the account switcher at the top of the sidebar to toggle between inboxes. Each account's emails, contacts, and calendar events are fetched independently.",
    },
    {
      question: "What Microsoft permissions does EaseMail request?",
      answer:
        "EaseMail requests read and send permissions for mail, read access to calendars, and read access to contacts via the Microsoft Graph API. These are the minimum scopes required to display your inbox, compose emails, and show calendar events. We do not request admin-level permissions and cannot access other users' mailboxes.",
    },
    {
      question: "Is EaseMail compatible with on-premises Exchange servers?",
      answer:
        "EaseMail connects via Microsoft Graph, which requires your Exchange environment to be accessible through Microsoft 365 (Exchange Online). Fully on-premises Exchange without a Microsoft 365 licence is not currently supported. Hybrid Exchange deployments that route through Exchange Online will work normally.",
    },
    {
      question: "How do I set a default email account for composing?",
      answer:
        "Go to Email Accounts and click the star icon next to the account you want as your default. The default account is pre-selected when you open the Compose window and is shown first in the account switcher. You can change the default at any time without losing data from other accounts.",
    },
    {
      question: "What is the AI Composer and how does it help legal professionals?",
      answer:
        "The AI Composer helps draft professional legal correspondence faster. It understands context such as reply threads and client names, and can generate formal legal tone emails. Use it from the Compose window by clicking 'AI Compose'. You can provide a brief prompt like 'Draft a follow-up to client about contract review deadline' and receive a polished draft to edit and send.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Create Account",
            desc: "Step-by-step guide to creating your EaseMail account.",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            ),
          },
          {
            title: "Quick Setup Checklist",
            desc: "Get up and running in under 5 minutes.",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
          },
          {
            title: "Video Tutorials",
            desc: "Watch walkthroughs for every major feature.",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-[14px] border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
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
                {card.icon}
              </svg>
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "rgb(27 29 29)" }}
            >
              {card.title}
            </h3>
            <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-neutral-200 bg-white p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Getting Started Steps
        </h3>
        <ol className="space-y-3">
          {[
            "Sign Up & Verify your email address",
            "Complete your profile with name and preferences",
            "Explore the Dashboard to familiarise yourself",
            "Connect Your Email account via Microsoft 365",
            "Use AI Tools to compose, remix, or dictate emails",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "rgb(138 9 9)" }}
              >
                {i + 1}
              </span>
              <span className="text-sm" style={{ color: "rgb(55 55 55)" }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="rounded-[14px] border border-neutral-200 bg-white p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Keyboard Shortcuts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-2 pr-8 font-semibold" style={{ color: "rgb(82 82 82)" }}>Action</th>
                <th className="text-left py-2 font-semibold" style={{ color: "rgb(82 82 82)" }}>Shortcut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {[
                { action: "Compose new email", shortcut: "C" },
                { action: "Reply to email", shortcut: "R" },
                { action: "Reply all", shortcut: "Shift + R" },
                { action: "Forward email", shortcut: "F" },
                { action: "Search inbox", shortcut: "/" },
                { action: "Go to Inbox", shortcut: "G then I" },
                { action: "Go to Drafts", shortcut: "G then D" },
                { action: "Go to Sent", shortcut: "G then S" },
                { action: "Go to Calendar", shortcut: "G then C" },
                { action: "Mark as read / unread", shortcut: "Shift + U" },
                { action: "Archive email", shortcut: "E" },
                { action: "Delete email", shortcut: "Delete / Backspace" },
                { action: "Open AI Composer", shortcut: "Ctrl + Shift + A" },
              ].map((row) => (
                <tr key={row.action}>
                  <td className="py-2 pr-8" style={{ color: "rgb(55 55 55)" }}>{row.action}</td>
                  <td className="py-2">
                    <kbd className="px-2 py-0.5 rounded text-xs font-mono border"
                      style={{ backgroundColor: "rgb(245 245 245)", borderColor: "rgb(214 214 214)", color: "rgb(58 58 58)" }}>
                      {row.shortcut}
                    </kbd>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Frequently Asked Questions
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

function AccountBillingPanel() {
  const faqs: FaqItem[] = [
    {
      question: "How is EaseMail priced for law firms?",
      answer:
        "EaseMail is priced per user per month. Law firms typically purchase a firm-wide plan that covers all fee earners and support staff. Volume discounts are available for firms with more than 20 users. Contact billing@easemail.com for a firm-wide quote. Enterprise plans include dedicated onboarding, SLA guarantees, and custom data retention policies.",
    },
    {
      question: "Can we pay by invoice rather than credit card?",
      answer:
        "Yes. Enterprise and firm-wide plans support invoice billing with net-30 payment terms. Contact billing@easemail.com to set up invoice billing. We will issue monthly or annual invoices depending on your billing cycle. Individual user plans require credit card payment via our secure payment portal.",
    },
    {
      question: "What happens to our email data if we cancel the subscription?",
      answer:
        "EaseMail does not store your email content — all email data is fetched live from Microsoft 365 via Graph API. Cancelling your subscription removes your EaseMail account and revokes our access to your Microsoft 365 mailbox. Your emails remain in your Microsoft 365 account entirely unaffected. We retain account metadata for 30 days after cancellation per our data retention policy.",
    },
    {
      question: "Is there a free trial available for firms evaluating EaseMail?",
      answer:
        "Yes. A 14-day free trial is available and includes full access to all features including AI Composer, AI Dictate, and calendar integration. No credit card is required to start a trial. At the end of the trial period, you can choose a plan or let the trial expire — your data is not affected either way.",
    },
    {
      question: "Can individual lawyers have separate billing from the firm?",
      answer:
        "Yes. Each EaseMail account is independent and billed separately by default. However, firm administrators can request consolidated billing where all lawyers under a firm domain are billed under a single account. This simplifies payment and allows central management of seats.",
    },
    {
      question: "How do I add or remove users from the firm plan?",
      answer:
        "Firm administrators can manage users from the Admin panel. Adding a new user sends them an invitation email with a link to set up their account under the firm plan. Removing a user immediately revokes their access and frees up the seat for reassignment. Unused seats are credited to the next billing cycle.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] border border-neutral-200 bg-white p-5">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "rgb(27 29 29)" }}
          >
            Account Management
          </h3>
          <ul className="space-y-2">
            {[
              "Update account information",
              "Change your password",
              "Enable two-factor authentication",
              "Manage notification preferences",
              "Delete your account",
            ].map((item) => (
              <li key={item}>
                <button
                  className="text-sm text-left w-full hover:underline"
                  style={{ color: "rgb(138 9 9)" }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[14px] border border-neutral-200 bg-white p-5">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "rgb(27 29 29)" }}
          >
            Billing & Payments
          </h3>
          <ul className="space-y-2">
            {[
              "View billing history",
              "Upgrade or downgrade your plan",
              "Update payment method",
              "Cancel subscription",
              "Request an invoice",
            ].map((item) => (
              <li key={item}>
                <button
                  className="text-sm text-left w-full hover:underline"
                  style={{ color: "rgb(138 9 9)" }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="rounded-[14px] border p-4 flex items-start gap-3"
        style={{
          backgroundColor: "rgb(253 235 235)",
          borderColor: "rgb(238 180 180)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "rgb(138 9 9)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm" style={{ color: "rgb(83 5 5)" }}>
          For billing questions, please contact our support team at{" "}
          <a
            href="mailto:billing@easemail.com"
            className="font-semibold underline"
          >
            billing@easemail.com
          </a>
          . We respond within 1 business day.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Frequently Asked Questions
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

function FeaturesToolsPanel() {
  const faqs: FaqItem[] = [
    {
      question: "How does the AI Composer generate legally appropriate email drafts?",
      answer:
        "The AI Composer uses the email thread context, your prompt, and the professional tone of your existing emails to generate drafts. It is trained on professional business correspondence and can adopt formal legal language. You should always review and edit AI-generated drafts before sending, especially for client-facing communications where accuracy and privilege considerations are paramount.",
    },
    {
      question: "Can AI Dictate be used during client calls?",
      answer:
        "Yes. AI Dictate captures your spoken words and converts them to text in real-time. You can use it hands-free during calls to draft email summaries or follow-up notes immediately after a call. Click the microphone icon in the Compose window and speak naturally. EaseMail processes audio locally in your browser — audio is not sent to external servers.",
    },
    {
      question: "How does the Attachments Hub help with case file management?",
      answer:
        "The Attachments Hub aggregates every attachment from your entire inbox into a single searchable view, filterable by file type, sender, or date range. For legal professionals, this means you can quickly locate all PDF documents from a specific client, find contracts sent over the past 30 days, or export a list of attachments related to a matter — without searching through hundreds of email threads.",
    },
    {
      question: "Can I label emails to organise by matter or client?",
      answer:
        "Yes. EaseMail supports labels powered by Microsoft Graph categories. Click any label in the sidebar (Work, Personal, Newsletters) to filter your inbox to emails tagged with that category. Labels are synced with your Microsoft 365 account so they persist across devices and Outlook. You can manage categories directly in Outlook or through the Microsoft 365 web portal.",
    },
    {
      question: "How does calendar integration work for scheduling client meetings?",
      answer:
        "The Calendar page pulls your Microsoft 365 calendar events in real-time. You can view today's schedule, upcoming deadlines, and court dates at a glance. The Dashboard also shows today's agenda. When composing an email, you can reference upcoming meetings to propose times. Direct event creation within EaseMail requires the calendar write permission — check Settings to verify your account has this enabled.",
    },
    {
      question: "What is AI Remix and when should I use it?",
      answer:
        "AI Remix rewrites an existing email draft in a different tone or format. For example, you can take a casually-worded internal note and remix it into formal client correspondence, or condense a lengthy email into a concise summary. Open Compose, write or paste your draft, then click 'AI Remix' and select the desired tone. This is particularly useful for junior associates who need to adjust the register of their drafts before sending.",
    },
  ];

  const features = [
    {
      name: "AI Composer",
      desc: "Write emails faster with AI-powered composition and suggestions.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      ),
    },
    {
      name: "AI Dictate",
      desc: "Speak your emails aloud and let AI transcribe them perfectly.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      ),
    },
    {
      name: "Attachments Hub",
      desc: "Browse and manage all attachments across your inbox in one place.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
        />
      ),
    },
    {
      name: "Calendar",
      desc: "View and manage your Microsoft 365 calendar events alongside email.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
    },
    {
      name: "Contacts",
      desc: "Search and manage your contacts synced from Microsoft 365.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      ),
    },
    {
      name: "Search",
      desc: "Find any email instantly with full-text and filter-based search.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="rounded-[14px] border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
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
                {feature.icon}
              </svg>
            </div>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "rgb(27 29 29)" }}
            >
              {feature.name}
            </h3>
            <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Frequently Asked Questions
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

function IntegrationsPanel() {
  const faqs: FaqItem[] = [
    {
      question: "How do I connect EaseMail to my firm's Microsoft 365 tenant?",
      answer:
        "Click 'Add Account' in Email Accounts and sign in with your Microsoft 365 credentials. EaseMail uses OAuth 2.0 via the Microsoft identity platform. Your IT administrator may need to grant admin consent for the required permissions in the Azure AD portal if your organisation has restricted user consent. The required permissions are: Mail.ReadWrite, Mail.Send, Calendars.Read, and Contacts.Read.",
    },
    {
      question: "Why is my IT department being asked to grant admin consent?",
      answer:
        "Some Microsoft 365 tenants are configured to require an administrator to pre-approve any third-party app before users can connect. This is controlled in Azure Active Directory under 'User consent settings'. Your IT administrator can grant admin consent for EaseMail by navigating to Azure AD > Enterprise Applications > EaseMail and clicking 'Grant admin consent'. This is a one-time action for the entire firm.",
    },
    {
      question: "Does EaseMail work with shared mailboxes used by practice groups?",
      answer:
        "Shared mailboxes in Microsoft 365 can be connected if the signed-in user has been granted access to the shared mailbox by an administrator. In Microsoft 365 admin, grant the user 'Full Access' to the shared mailbox. Then in EaseMail, add the account and when prompted during Microsoft sign-in, select the shared mailbox rather than your personal mailbox.",
    },
    {
      question: "Can I connect Exchange on-premises without Microsoft 365?",
      answer:
        "EaseMail requires Microsoft Graph API access, which is only available for mailboxes hosted in Microsoft 365 (Exchange Online). Purely on-premises Exchange 2016 or 2019 without a Microsoft 365 licence is not supported. However, Exchange hybrid deployments where mailboxes are synced or hosted in Exchange Online will work. Contact your IT team to check if your Exchange environment is hybrid.",
    },
    {
      question: "How often does EaseMail sync with Microsoft 365?",
      answer:
        "EaseMail fetches your inbox in real-time when you open the app and polls for new emails every 30 seconds while the tab is active. Calendar events are fetched on page load. There is no delayed sync — all data is pulled directly from Microsoft Graph at the time of request. If you see stale data, use the reconnect option in Email Accounts to refresh the session.",
    },
    {
      question: "Will connecting EaseMail affect my Outlook client or Outlook Web Access?",
      answer:
        "No. EaseMail reads and sends mail via the Microsoft Graph API as an authorised application on your account. It does not interfere with Outlook desktop, Outlook mobile, or Outlook Web Access. Changes made in EaseMail (sending email, marking as read, flagging) will appear in all other Outlook clients because they all connect to the same Microsoft 365 mailbox.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            name: "Microsoft 365",
            desc: "Connect your Microsoft 365 account to access email, calendar, and contacts.",
            badge: "Supported",
          },
          {
            name: "Outlook",
            desc: "Full Outlook inbox integration with real-time sync via Microsoft Graph.",
            badge: "Supported",
          },
          {
            name: "Exchange",
            desc: "Connect on-premises or hosted Exchange environments.",
            badge: "Supported",
          },
          {
            name: "Microsoft Teams",
            desc: "View Teams notifications and calendar events alongside your inbox.",
            badge: "Supported",
          },
        ].map((integration) => (
          <div
            key={integration.name}
            className="rounded-[14px] border border-neutral-200 bg-white p-5 flex items-start gap-4"
          >
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgb(240 240 240)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                style={{ color: "rgb(82 82 82)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "rgb(27 29 29)" }}
                >
                  {integration.name}
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: "rgb(220 252 231)",
                    color: "rgb(22 101 52)",
                  }}
                >
                  {integration.badge}
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
                {integration.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[14px] border border-neutral-200 bg-white p-5">
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "rgb(27 29 29)" }}
        >
          Integration Guides
        </h3>
        <ul className="space-y-2">
          {[
            "How to connect Microsoft 365 for the first time",
            "Troubleshooting OAuth permission errors",
            "Re-authenticating an expired account",
            "Connecting multiple email accounts",
            "Understanding sync frequency and refresh tokens",
          ].map((guide) => (
            <li key={guide} className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                style={{ color: "rgb(138 9 9)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <button
                className="text-sm hover:underline text-left"
                style={{ color: "rgb(138 9 9)" }}
              >
                {guide}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Frequently Asked Questions
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

function TroubleshootingPanel() {
  const faqs: FaqItem[] = [
    {
      question: "Emails not loading — what should I check first?",
      answer:
        "Try refreshing the page first. If emails still do not appear, go to Email Accounts and click 'Refresh Connection' next to your account. If the issue persists, disconnect and reconnect your Microsoft 365 account — this re-authorises the sync token. Also check that your Microsoft 365 subscription is active and that your IT department has not revoked the OAuth consent for EaseMail in the Azure AD portal.",
    },
    {
      question: "I can't sign in with my Microsoft work account",
      answer:
        "Ensure you are using the correct Microsoft account associated with your firm's Microsoft 365 tenancy. If your organisation restricts third-party app access, your IT administrator needs to grant admin consent in the Azure AD portal. Try clearing browser cookies and signing in via an incognito window. If you see an error mentioning 'AADSTS', note the error code and contact support — these codes identify the specific Azure AD issue.",
    },
    {
      question: "AI features (Composer, Dictate, Remix) are not responding",
      answer:
        "AI features require an active subscription with AI access enabled. Check your plan in Settings > Billing. If your plan includes AI but features are not working, try signing out and back in to refresh your session token. If the AI panels open but produce no output, check your browser console (F12 > Console) for API errors and contact support with the details including the error message.",
    },
    {
      question: "My calendar events are not showing in the Dashboard",
      answer:
        "Calendar data requires the Calendars.Read permission to be granted during Microsoft sign-in. If you connected your account before this permission was added, disconnect and reconnect your account to re-trigger the permission consent screen. Also verify that your Microsoft 365 calendar has events for today — if you use a separate Outlook calendar not linked to your Microsoft 365 account, those events will not appear.",
    },
    {
      question: "Email labels (categories) are not filtering correctly",
      answer:
        "Labels in EaseMail use Microsoft Graph categories. If clicking a label shows no results, verify that your emails in Outlook are actually tagged with that category name (case-sensitive: 'Work', 'Personal', 'Newsletters'). You can apply categories in Outlook by right-clicking an email > Categorize. Categories must be applied in Microsoft 365 for them to appear when filtering in EaseMail.",
    },
    {
      question: "I sent an email but it is not appearing in Sent",
      answer:
        "Sent emails are stored in your Microsoft 365 Sent Items folder and should appear immediately. If a sent email is not visible, try refreshing the Sent page. If using the AI Composer, confirm the email was sent (a confirmation message should have appeared). In rare cases, Microsoft Graph may delay the appearance of sent items by up to 30 seconds. If the email is missing after 5 minutes, check your Outlook Sent Items directly to confirm delivery.",
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className="rounded-[14px] border p-4 flex items-start gap-3"
        style={{
          backgroundColor: "rgb(255 251 235)",
          borderColor: "rgb(253 211 77)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: "rgb(146 64 14)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-sm" style={{ color: "rgb(120 53 15)" }}>
          Before contacting support, try the steps in each FAQ below. Most
          common issues are resolved within a few minutes.
        </p>
      </div>

      <FaqAccordion faqs={faqs} />
    </div>
  );
}

function SecurityPrivacyPanel() {
  const faqs: FaqItem[] = [
    {
      question: "Does EaseMail store copies of our emails on its servers?",
      answer:
        "No. EaseMail does not store your email content. All email data is fetched directly from Microsoft 365 via Graph API and rendered in your browser. When you close the tab, no email content is retained by EaseMail servers. We only store the minimal account metadata required to maintain your session (Microsoft account ID, display name, and encrypted refresh token).",
    },
    {
      question: "How are Microsoft access tokens stored and protected?",
      answer:
        "Microsoft access tokens and refresh tokens are stored encrypted in our Supabase database using AES-256 encryption at rest. Tokens are never exposed in client-side JavaScript. All token exchanges happen server-side in Next.js API routes over HTTPS. Tokens expire automatically per Microsoft's token lifetime policies and are refreshed silently without user intervention.",
    },
    {
      question: "Is EaseMail compliant with the UK GDPR and SRA data handling requirements?",
      answer:
        "EaseMail is designed with GDPR compliance in mind. We act as a data processor on behalf of your firm (the data controller). We do not process personal data beyond what is necessary to provide the service. A Data Processing Agreement (DPA) is available on request for firms that need it for compliance with SRA data handling guidance or ICO requirements. Contact legal@easemail.com for the DPA.",
    },
    {
      question: "Can our IT team review the permissions EaseMail requests from Microsoft 365?",
      answer:
        "Yes. All permissions requested by EaseMail are visible in the Microsoft 365 admin portal under Azure Active Directory > Enterprise Applications > EaseMail > Permissions. The required scopes are: Mail.ReadWrite, Mail.Send, Calendars.Read, Contacts.Read, and User.Read. We do not request administrative permissions, delegated permissions to other users' mailboxes, or SharePoint access.",
    },
    {
      question: "What happens to our data if we request account deletion?",
      answer:
        "When you delete your EaseMail account, all stored metadata (account information, encrypted tokens, to-do items, and rules) is permanently deleted within 7 days. Since email content is never stored, there is no email data to delete. We will send a deletion confirmation email. If you need immediate deletion for compliance reasons, contact support@easemail.com and we will process it within 24 hours.",
    },
    {
      question: "Does the AI Composer send our email content to third-party AI providers?",
      answer:
        "When you use the AI Composer, Dictate, or Remix features, the email content you provide as context is sent to our AI processing infrastructure. We use enterprise-grade AI APIs with data processing agreements that prohibit training on your data. Audio from AI Dictate is processed in your browser and is not transmitted to external servers. You can review our AI data processing policy in full at easemail.com/privacy.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-[14px] border border-neutral-200 bg-white p-5">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "rgb(27 29 29)" }}
          >
            Security Features
          </h3>
          <ul className="space-y-2">
            {[
              "End-to-end encrypted token storage",
              "OAuth 2.0 via Microsoft identity platform",
              "No passwords stored — token-only authentication",
              "Automatic token expiry and refresh",
              "Session invalidation on sign-out",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm"
                style={{ color: "rgb(55 55 55)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "rgb(22 163 74)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[14px] border border-neutral-200 bg-white p-5">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "rgb(27 29 29)" }}
          >
            Privacy Information
          </h3>
          <ul className="space-y-2">
            {[
              "GDPR compliant data processing",
              "No email content sold or shared with third parties",
              "AI processes email only when you initiate AI features",
              "Data retention aligned with your subscription",
              "Full data export available on request",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm"
                style={{ color: "rgb(55 55 55)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ color: "rgb(22 163 74)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "rgb(27 29 29)" }}>
          Frequently Asked Questions
        </h3>
        <FaqAccordion faqs={faqs} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HelpClient() {
  const [activeTab, setActiveTab] = useState<TabId>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const searchResults =
    debouncedQuery.trim().length > 1
      ? ARTICLES.filter((a) =>
          a.title.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 6)
      : [];

  const showDropdown = debouncedQuery.trim().length > 1;

  return (
    <div className="flex flex-col flex-1" style={{ minWidth: 0 }}>
      <div
        className="flex-1 overflow-y-auto"
        style={{ height: "100vh" }}
      >
        {/* Hero */}
        <div
          className="px-8 py-16 text-center"
          style={{ backgroundColor: "rgb(83 5 5)" }}
        >
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{
              backgroundColor: "rgba(255 255 255 / 0.15)",
              color: "rgb(255 210 210)",
            }}
          >
            Help Center
          </span>
          <h1 className="text-3xl font-bold text-white mb-3">
            How can we help you?
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgb(255 210 210)" }}>
            Browse guides, FAQs, and tutorials to get the most out of EaseMail.
          </p>

          <div className="relative max-w-xl mx-auto">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                style={{ color: "rgb(160 160 160)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm bg-white rounded-[10px] outline-none"
                style={{ color: "rgb(27 29 29)" }}
              />
            </div>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[14px] border border-neutral-200 shadow-lg z-10 overflow-hidden">
                {searchResults.length > 0 ? (
                  searchResults.map((article) => (
                    <button
                      key={`${article.tab}-${article.title}`}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                      onClick={() => {
                        setActiveTab(article.tab);
                        setSearchQuery("");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: "rgb(138 9 9)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "rgb(27 29 29)" }}
                        >
                          {article.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "rgb(115 115 115)" }}
                        >
                          {TABS.find((t) => t.id === article.tab)?.label}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm" style={{ color: "rgb(115 115 115)" }}>
                    No articles found for &ldquo;{debouncedQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-8 py-8 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-center gap-12">
            {[
              { value: "120+", label: "Help Articles" },
              { value: "24/7", label: "Support Available" },
              { value: "98%", label: "Issues Resolved" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-2xl font-bold"
                  style={{ color: "rgb(138 9 9)" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-8 pt-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "rgb(138 9 9)"
                      : "rgb(243 243 243)",
                    color: isActive ? "white" : "rgb(82 82 82)",
                  }}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === "getting-started" && <GettingStartedPanel />}
            {activeTab === "account-billing" && <AccountBillingPanel />}
            {activeTab === "features-tools" && <FeaturesToolsPanel />}
            {activeTab === "integrations" && <IntegrationsPanel />}
            {activeTab === "troubleshooting" && <TroubleshootingPanel />}
            {activeTab === "security-privacy" && <SecurityPrivacyPanel />}
          </div>
        </div>

        {/* Contact Support Banner */}
        <div
          className="mx-8 mb-8 rounded-[14px] border border-neutral-200 bg-white p-6 flex items-center justify-between gap-6"
        >
          <div>
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "rgb(27 29 29)" }}
            >
              Still need help?
            </h3>
            <p className="text-sm" style={{ color: "rgb(115 115 115)" }}>
              Our support team is available around the clock to help with any
              issue.
            </p>
          </div>
          <a
            href="mailto:support@easemail.com"
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-sm font-medium text-white flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: "rgb(138 9 9)" }}
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send Message
          </a>
        </div>
      </div>
    </div>
  );
}
