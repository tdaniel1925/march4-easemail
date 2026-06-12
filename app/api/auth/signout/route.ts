import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { audit } from "@/lib/audit";

async function signOutAndRedirect(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      void audit({ action: "auth.signout", userId: user.id, actorEmail: user.email, req });
    }
    await supabase.auth.signOut();
  } catch {
    // Always redirect to login even if signout fails
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

// CSRF mitigation: reject cross-site requests. Same-origin navigations
// (the in-app "Sign Out" links) send Sec-Fetch-Site: same-origin; a cross-site
// image/iframe/form forcing a logout sends "cross-site".
function isCrossSite(req: NextRequest): boolean {
  return req.headers.get("sec-fetch-site") === "cross-site";
}

export async function GET(req: NextRequest) {
  if (isCrossSite(req)) {
    return NextResponse.json({ error: "Cross-site signout not allowed" }, { status: 403 });
  }
  return signOutAndRedirect(req);
}

export async function POST(req: NextRequest) {
  if (isCrossSite(req)) {
    return NextResponse.json({ error: "Cross-site signout not allowed" }, { status: 403 });
  }
  return signOutAndRedirect(req);
}
