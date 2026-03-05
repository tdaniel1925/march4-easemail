import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { graphGet } from "@/lib/microsoft/graph";

type Params = { params: Promise<{ id: string }> };

interface GraphMessage {
  id: string;
  subject?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  toRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  ccRecipients?: { emailAddress?: { name?: string; address?: string } }[];
  body?: { contentType?: string; content?: string };
  receivedDateTime?: string;
}

// ─── GET /api/mail/message/[id] ───────────────────────────────────────────────
// Fetches a single message from MS Graph for reply/forward pre-fill.

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const account = await prisma.msConnectedAccount.findFirst({
    where: { userId: user.id, isDefault: true },
  });
  if (!account) return NextResponse.json({ error: "No connected account" }, { status: 404 });

  const msg = await graphGet<GraphMessage>(
    user.id,
    account.homeAccountId,
    `/me/messages/${id}?$select=id,subject,from,toRecipients,ccRecipients,body,receivedDateTime`
  );

  return NextResponse.json(msg);
}
