import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Always redirect to login even if signout fails
  }
  return NextResponse.redirect(new URL("/login", req.url));
}
