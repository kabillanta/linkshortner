import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/status") ||
    path === "/"
  ) {
    return NextResponse.next();
  }

  const shortCode = path.slice(1);
  const cachedData = await redis.get<string>(`url:${shortCode}`);

  if (cachedData) {
    // Parse the new JSON structure
    const urlConfig =
      typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;

    // RULE 1: Is it disabled?
    if (!urlConfig.isActive) {
      return NextResponse.rewrite(new URL("/status/inactive", req.url));
    }

    // RULE 2: Has it hit the click limit?
    if (urlConfig.maxClicks) {
      // Check exact click count from DB via REST API for speed
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clicks?short_code=eq.${shortCode}&select=id`,
        {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        },
      );
      const clicks = await res.json();

      if (clicks.length >= urlConfig.maxClicks) {
        return NextResponse.rewrite(new URL("/status/expired", req.url));
      }
    }

    // Fire and forget analytics AND update last_accessed_at
    const country = req.headers.get("x-vercel-ip-country") || "Unknown";
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/log_click_and_access`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ p_short_code: shortCode, p_country: country }),
      },
    ).catch(() => {});

    return NextResponse.redirect(new URL(urlConfig.originalUrl));
  }

  return NextResponse.next();
}

export const config = { matcher: "/:path*" };
