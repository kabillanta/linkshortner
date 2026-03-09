"use server";

import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { z } from "zod";

const urlSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  alias: z.string().max(30).optional().or(z.literal("")),
  maxClicks: z.number().positive().optional().or(z.nan()), // New optional limit
});

// THE MISSING FUNCTION: Generates the random 6-character string
function generateShortCode() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 })
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
}

export async function createShortUrl(formData: FormData) {
  const rawUrl = formData.get("url") as string;
  const rawAlias = formData.get("alias") as string;
  const rawMaxClicks = formData.get("maxClicks") as string;

  const maxClicks = rawMaxClicks ? parseInt(rawMaxClicks, 10) : undefined;

  const parsed = urlSchema.safeParse({
    url: rawUrl,
    alias: rawAlias,
    maxClicks,
  });
  if (!parsed.success)
    return { error: (parsed.error as any).errors[0].message };

  const originalUrl = parsed.data.url;
  const shortCode = parsed.data.alias || generateShortCode();

  // Save to DB with new max_clicks field
  const { error: dbError } = await supabase.from("urls").insert([
    {
      short_code: shortCode,
      original_url: originalUrl,
      max_clicks: parsed.data.maxClicks || null,
    },
  ]);

  if (dbError) return { error: "Alias already taken or database error." };

  // Cache object in Redis instead of just string
  await redis.set(
    `url:${shortCode}`,
    JSON.stringify({
      originalUrl,
      isActive: true,
      maxClicks: parsed.data.maxClicks || null,
    }),
  );

  return { shortCode, originalUrl };
}

// Toggle Link Status
export async function toggleLinkStatus(
  shortCode: string,
  currentStatus: boolean,
) {
  const newStatus = !currentStatus;

  const { data, error } = await supabase
    .from("urls")
    .update({ is_active: newStatus })
    .eq("short_code", shortCode)
    .select()
    .single();

  if (!error && data) {
    // Update Edge Cache
    await redis.set(
      `url:${shortCode}`,
      JSON.stringify({
        originalUrl: data.original_url,
        isActive: data.is_active,
        maxClicks: data.max_clicks,
      }),
    );
  }
  return { success: !error };
}

// Edit Destination URL
export async function updateDestination(shortCode: string, newUrl: string) {
  try {
    new URL(newUrl); // Validate
  } catch {
    return { error: "Invalid URL format" };
  }

  const { data, error } = await supabase
    .from("urls")
    .update({ original_url: newUrl })
    .eq("short_code", shortCode)
    .select()
    .single();

  if (!error && data) {
    // Update Edge Cache
    await redis.set(
      `url:${shortCode}`,
      JSON.stringify({
        originalUrl: data.original_url,
        isActive: data.is_active,
        maxClicks: data.max_clicks,
      }),
    );
  }
  return { success: !error };
}
