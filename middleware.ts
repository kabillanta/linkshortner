import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Ignore system routes, API, and the dashboard
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/dashboard") ||
    path === "/"
  ) {
    return NextResponse.next();
  }

  const shortCode = path.slice(1); // Remove the leading slash

  // 1. Check Redis for blazing fast lookup
  const originalUrl = await redis.get<string>(`url:${shortCode}`);

  if (originalUrl) {
    // 2. Fire and forget analytics to Supabase via Edge compatible fetch
    // We don't await this so the redirect isn't blocked
    const country = req.geo?.country || "Unknown";
    const city = req.geo?.city || "Unknown";
    const userAgent = req.headers.get("user-agent") || "";
    const device = userAgent.includes("Mobile") ? "Mobile" : "Desktop";

    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clicks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      body: JSON.stringify({
        short_code: shortCode,
        country,
        city,
        device,
      }),
    }).catch((err) => console.error("Failed to log click:", err));

    // 3. Redirect user
    return NextResponse.redirect(new URL(originalUrl));
  }

  // If not found, just continue (will hit your 404)
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
