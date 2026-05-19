import { Router } from "express";
import { scrapeMaps } from "../lib/scraper/index.js";

const scrapeRouter = Router();

/**
 * GET /api/ping
 * Quick health-check for the scraper service (no browser launch).
 */
scrapeRouter.get("/ping", (_req, res) => {
  res.json({ status: "ok", message: "LeadHunter backend running", engine: "playwright" });
});

/**
 * GET /api/scrape?q=<query>&max=<number>
 *
 * Scrapes Google Maps for businesses matching the query.
 *
 * Query params:
 *   q   – Search query, e.g. "dental clinics in Velachery"
 *   max – Maximum results to return (capped at 40, default 20)
 *
 * Response:
 *   { results: ScrapedBusiness[], count: number, source: string }
 */
scrapeRouter.get("/scrape", async (req, res) => {
  const query = (req.query["q"] as string | undefined) ?? "";
  const max = Math.min(parseInt((req.query["max"] as string | undefined) ?? "20", 10), 40);

  if (!query.trim()) {
    res.status(400).json({ error: "Query parameter 'q' is required." });
    return;
  }

  req.log.info({ query, max }, "Scrape request started");

  try {
    const results = await scrapeMaps({ query, maxResults: max });
    req.log.info({ count: results.length }, "Scrape completed");
    res.json({ results, count: results.length, source: "playwright" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err: message }, "Scrape failed");
    res.status(500).json({ error: "Scrape failed: " + message });
  }
});

export default scrapeRouter;
