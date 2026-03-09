"use server";

import { supabase } from "@/lib/supabase";
import { redis } from "@/lib/redis";
import { z } from "zod";

// Zod schema for strict validation
const urlSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  alias: z
    .string()
    .min(3, { message: "Alias must be at least 3 characters." })
    .max(30, { message: "Alias is too long." })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Alias can only contain letters, numbers, and hyphens.",
    })
    .optional()
    .or(z.literal("")), // Allow empty string
});

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

  // 1. Validate Input
  const parsed = urlSchema.safeParse({ url: rawUrl, alias: rawAlias });
  if (!parsed.success) {
    return { error: (parsed.error as any).errors[0].message };
  }

  const originalUrl = parsed.data.url;
  const shortCode = parsed.data.alias || generateShortCode();

  // 2. Check for Alias Collisions in Supabase
  const { data: existing } = await supabase
    .from("urls")
    .select("short_code")
    .eq("short_code", shortCode)
    .single();

  if (existing) {
    return { error: "That custom alias is already taken. Try another one!" };
  }

  // 3. Save to Supabase
  const { error: dbError } = await supabase
    .from("urls")
    .insert([{ short_code: shortCode, original_url: originalUrl }]);

  if (dbError) {
    console.error("Database Error:", dbError);
    return { error: "Failed to save to database." };
  }

  // 4. Cache in Redis
  await redis.set(`url:${shortCode}`, originalUrl);

  return { shortCode, originalUrl };
}
