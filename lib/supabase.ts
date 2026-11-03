import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

let serverClient: SupabaseClient | null = null;

function ensureEnvLoaded() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  // Fallback to load directly from .env.local or .env in case dev server didn't reload environment
  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    try {
      const p = path.resolve(process.cwd(), file);
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, "utf8");
        for (const line of text.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
          if (match) {
            const k = match[1];
            let v = match[2].trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1);
            }
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }
}

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClient) return serverClient;

  ensureEnvLoaded();

  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  }

  serverClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}
