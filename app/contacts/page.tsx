import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithAccounts } from "@/lib/utils/get-user-accounts";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import { detectProviderType } from "@/lib/providers/registry";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import ContactsClient from "@/components/contacts/ContactsClient";
import { getUnreadCount } from "@/lib/utils/get-unread-count";

// ─── Graph shapes ─────────────────────────────────────────────────────────────

interface GraphContact {
  id: string;
  displayName: string;
  emailAddresses: { address: string; name: string }[];
  mobilePhone?: string;
  jobTitle?: string;
  companyName?: string;
  department?: string;
}

interface GraphContactList {
  value: GraphContact[];
}

// ─── Clean shape ──────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  displayName: string;
  email: string;
  jobTitle: string;
  company: string;
  phone: string;
  initials: string;
  isVIP: boolean;
  frequencyScore: number;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getUserWithAccounts(user.id);
  if (!dbUser) redirect("/onboarding");

  const dbDefault = dbUser.defaultAccount;
  if (!dbDefault) redirect("/onboarding");
  const { getActiveAccountId } = await import("@/lib/utils/get-active-account");
  const savedAccountId = await getActiveAccountId();
  const defaultAccount = (savedAccountId ? dbUser.allAccounts.find((a) => a.homeAccountId === savedAccountId) : null) ?? dbDefault;

  let contacts: Contact[] = [];
  const unreadCountPromise = getUnreadCount(user.id, defaultAccount.homeAccountId);
  try {
    // Try DB cache first
    const cached = await prisma.cachedContact.findMany({
      where: { userId: user.id, homeAccountId: defaultAccount.homeAccountId },
      orderBy: { displayName: "asc" },
    });

    if (cached.length > 0) {
      contacts = cached.map((c): Contact => ({
        id: c.id,
        displayName: c.displayName,
        email: c.emailAddress,
        jobTitle: c.jobTitle,
        company: c.company,
        phone: c.phone,
        initials: c.displayName.slice(0, 2).toUpperCase(),
        isVIP: c.isVIP,
        frequencyScore: c.frequencyScore,
      }));
    } else {
      const providerType = detectProviderType(defaultAccount.homeAccountId);

      if (providerType === "jmap") {
        // Use JMAP provider for contacts
        const { JmapProvider } = await import("@/lib/providers/jmap");
        const provider = new JmapProvider();
        try {
          const jmapContacts = await provider.fetchContacts(user.id, defaultAccount.homeAccountId, { top: 100 });
          contacts = jmapContacts.map((c): Contact => ({
            id: c.id,
            displayName: c.displayName,
            email: c.email,
            jobTitle: c.jobTitle,
            company: c.company,
            phone: c.phone,
            initials: c.displayName.slice(0, 2).toUpperCase(),
            isVIP: false,
            frequencyScore: 0,
          }));
        } catch {
          // JMAP contacts scope may not be available
        }
      } else {
        // Microsoft Graph path (existing code)
        const data = await graphGet<GraphContactList>(
          user.id,
          defaultAccount.homeAccountId,
          `/me/contacts?$top=100&$select=id,displayName,emailAddresses,jobTitle,companyName,department&$orderby=displayName`
        );
        contacts = (data.value ?? [])
          .filter((c) => c.displayName)
          .map((c): Contact => ({
            id: c.id,
            displayName: c.displayName,
            email: c.emailAddresses?.[0]?.address ?? "",
            jobTitle: c.jobTitle ?? "",
            company: c.companyName ?? "",
            phone: c.mobilePhone ?? "",
            initials: c.displayName.slice(0, 2).toUpperCase(),
            isVIP: false,
            frequencyScore: 0,
          }));
      }
    }
  } catch {
    // Contacts scope may not be consented — not fatal
  }

  const userName = dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";

  const unreadCount = await unreadCountPromise;

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} imapAccounts={dbUser.imapAccounts} jmapAccounts={dbUser.jmapAccounts} inboxUnread={unreadCount} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount.email}
      />
      <ContactsClient contacts={contacts} />
    </div>
  );
}
