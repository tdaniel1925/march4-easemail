import { graphGet } from "@/lib/microsoft/graph";
import { prisma } from "@/lib/prisma";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

interface GraphContact {
  id: string;
  displayName: string;
  emailAddresses?: { address?: string }[];
  mobilePhone?: string;
  jobTitle?: string;
  companyName?: string;
}

interface GraphContactList {
  value: GraphContact[];
  "@odata.nextLink"?: string;
}

export async function syncContacts(
  userId: string,
  homeAccountId: string
): Promise<void> {
  const all: GraphContact[] = [];
  let path: string | null =
    "/me/contacts?$select=id,displayName,emailAddresses,mobilePhone,jobTitle,companyName&$top=999";

  while (path) {
    const data: GraphContactList = await graphGet<GraphContactList>(userId, homeAccountId, path);
    all.push(...(data.value ?? []));
    const next: string | null = data["@odata.nextLink"] ?? null;
    path = next
      ? next.startsWith(GRAPH_BASE)
        ? next.slice(GRAPH_BASE.length)
        : next
      : null;
  }

  const contacts = all
    .filter((c) => c.displayName)
    .map((c) => ({
      id: c.id,
      userId,
      homeAccountId,
      displayName: c.displayName,
      emailAddress: c.emailAddresses?.[0]?.address ?? "",
      phone: c.mobilePhone ?? "",
      jobTitle: c.jobTitle ?? "",
      company: c.companyName ?? "",
    }));

  // Full refresh — delete all for this user+account then recreate
  await prisma.$transaction([
    prisma.cachedContact.deleteMany({ where: { userId, homeAccountId } }),
    prisma.cachedContact.createMany({ data: contacts }),
  ]);
}
