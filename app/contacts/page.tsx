import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";
import Sidebar from "@/components/Sidebar";
import { StoreInitializer } from "@/components/StoreInitializer";
import ContactsClient from "@/components/contacts/ContactsClient";

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
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { msAccounts: { orderBy: { isDefault: "desc" } } },
  });
  if (!dbUser) redirect("/onboarding");

  const defaultAccount = dbUser.msAccounts.find((a) => a.isDefault) ?? dbUser.msAccounts[0];
  if (!defaultAccount) redirect("/onboarding");

  let contacts: Contact[] = [];
  try {
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
      }));
  } catch {
    // Contacts scope may not be consented — not fatal
  }

  const userName = dbUser.name ?? defaultAccount.displayName ?? user.email ?? "You";

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <StoreInitializer accounts={dbUser.msAccounts} inboxUnread={0} />
      <Sidebar
        userName={userName}
        userEmail={defaultAccount.msEmail}
      />
      <ContactsClient contacts={contacts} />
    </div>
  );
}
