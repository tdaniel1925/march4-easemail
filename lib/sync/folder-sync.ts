import { graphGet } from "@/lib/microsoft/graph";
import { prisma } from "@/lib/prisma";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
// Note: wellKnownName cannot be in $select - it's returned by default when available
const FOLDER_SELECT =
  "id,displayName,parentFolderId,unreadItemCount,totalItemCount,childFolderCount";

interface GraphFolder {
  id: string;
  displayName: string;
  parentFolderId?: string | null;
  unreadItemCount: number;
  totalItemCount: number;
  childFolderCount: number;
  wellKnownName?: string | null;
}

interface GraphFolderList {
  value: GraphFolder[];
  "@odata.nextLink"?: string;
}

async function fetchAllFolders(
  userId: string,
  homeAccountId: string,
  path: string
): Promise<GraphFolder[]> {
  const all: GraphFolder[] = [];
  let currentPath: string | null = path;
  while (currentPath) {
    const data: GraphFolderList = await graphGet<GraphFolderList>(userId, homeAccountId, currentPath);
    all.push(...(data.value ?? []));
    const next: string | null = data["@odata.nextLink"] ?? null;
    currentPath = next
      ? next.startsWith(GRAPH_BASE)
        ? next.slice(GRAPH_BASE.length)
        : next
      : null;
  }
  return all;
}

export interface FolderRef {
  folderId: string;
  wellKnownName: string | null;
}

const MAX_DEPTH = 10;

/** Recursively fetch all child folders up to MAX_DEPTH levels deep */
async function fetchChildrenRecursive(
  userId: string,
  homeAccountId: string,
  parentId: string,
  depth: number
): Promise<GraphFolder[]> {
  if (depth > MAX_DEPTH) return [];
  const children = await fetchAllFolders(
    userId,
    homeAccountId,
    `/me/mailFolders/${parentId}/childFolders?$select=${FOLDER_SELECT}&$top=100`
  );
  const deeper: GraphFolder[] = [];
  for (const child of children) {
    if (child.childFolderCount > 0) {
      const grandchildren = await fetchChildrenRecursive(userId, homeAccountId, child.id, depth + 1);
      deeper.push(...grandchildren);
    }
  }
  return [...children, ...deeper];
}

export async function syncFolders(
  userId: string,
  homeAccountId: string
): Promise<FolderRef[]> {
  const topFolders = await fetchAllFolders(
    userId,
    homeAccountId,
    `/me/mailFolders?$select=${FOLDER_SELECT}&$top=100`
  );

  // Recursively fetch children up to 10 levels deep
  const childFolders: GraphFolder[] = [];
  for (const f of topFolders) {
    if (f.childFolderCount > 0) {
      const children = await fetchChildrenRecursive(userId, homeAccountId, f.id, 1);
      childFolders.push(...children);
    }
  }

  const allFolders = [...topFolders, ...childFolders];

  await Promise.all(
    allFolders.map((f) =>
      prisma.cachedFolder.upsert({
        where: { id: f.id },
        update: {
          displayName: f.displayName,
          parentFolderId: f.parentFolderId ?? null,
          unreadCount: f.unreadItemCount ?? 0,
          totalCount: f.totalItemCount ?? 0,
          wellKnownName: f.wellKnownName ?? null,
          syncedAt: new Date(),
        },
        create: {
          id: f.id,
          userId,
          homeAccountId,
          displayName: f.displayName,
          parentFolderId: f.parentFolderId ?? null,
          unreadCount: f.unreadItemCount ?? 0,
          totalCount: f.totalItemCount ?? 0,
          wellKnownName: f.wellKnownName ?? null,
        },
      })
    )
  );

  return allFolders.map((f) => ({
    folderId: f.id,
    wellKnownName: f.wellKnownName ?? null,
  }));
}
