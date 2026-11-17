/**
 * Shared key between the edge middleware and /api/track, so nobody else can
 * write visits. Derived from a server-only secret (never the secret itself).
 * Uses Web Crypto, available in both the edge and Node runtimes.
 */
export async function trackingKey(): Promise<string | null> {
  const secret = process.env.ANALYTICS_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const data = new TextEncoder().encode(`${secret}:ilv-track-v1`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const TRACK_KEY_HEADER = "x-ilv-track-key";

/** Two views of the same page by the same visitor within this window count once. */
export const DEDUPE_SECONDS = 10;
