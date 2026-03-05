import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Public paths that don't require authentication
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/onboarding",
  "/auth/callback",
]);

const PUBLIC_PREFIXES = [
  "/api/auth/",
  "/api/cron/",
  "/_next/",
  "/favicon",
  "/icons/",
  "/images/",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Build a response to pass through so Supabase can update session cookies
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // API routes return 401 JSON; page routes redirect to /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Domain/admin gate — block sessions from unauthorized email domains
  const userEmail = (user.email ?? "").toLowerCase().trim();
  const userDomain = userEmail.split("@")[1] ?? "";
  const allowedDomains = (process.env.ALLOWED_DOMAINS ?? "dmillerlaw.com")
    .split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const isAllowed = allowedDomains.includes(userDomain) || adminEmails.includes(userEmail);

  if (!isAllowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/login?error=unauthorized_domain", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
