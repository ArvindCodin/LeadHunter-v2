import type { ScrapeResponse } from "./types";

/**
 * Calls the LeadHunter backend scrape endpoint.
 * @param backendUrl - Base URL of the backend, e.g. "https://yourapp.replit.app"
 * @param query - Google Maps search query, e.g. "dental clinics in Velachery"
 * @param max - Maximum number of results to fetch (capped at 40 server-side)
 */
export async function scrapeLeads(
  backendUrl: string,
  query: string,
  max: number,
): Promise<ScrapeResponse> {
  const url = new URL("/api/scrape", backendUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("max", String(max));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<ScrapeResponse>;
}

/**
 * Pings the backend to verify it's reachable and healthy.
 * Returns true if the backend is up.
 */
export async function pingBackend(backendUrl: string): Promise<boolean> {
  try {
    const url = new URL("/api/ping", backendUrl);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
