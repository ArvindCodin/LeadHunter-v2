import { chromium } from "playwright";
import type { ScrapedBusiness, ScrapeOptions } from "./types.js";
import {
  CHROMIUM_EXEC_PATH,
  LAUNCH_ARGS,
  USER_AGENT,
  collectListingsFromFeed,
  extractPhoneFromDetailPage,
  extractAddressFromDetailPage,
} from "./extractor.js";

/**
 * Scrapes Google Maps for local businesses matching the query.
 *
 * Two-pass strategy:
 *   Pass 1 – Search results page: collect names, ratings, category, and the
 *             direct URL to each business detail page.
 *   Pass 2 – Individual detail pages: navigate to each URL and extract the
 *             phone number (and full address).
 *
 * This is necessary because Google Maps only exposes phone numbers inside the
 * individual business panels, not in the search-results list view.
 */
export async function scrapeMaps(options: ScrapeOptions): Promise<ScrapedBusiness[]> {
  const { query, maxResults } = options;

  const parts = query.split(" in ");
  const category = (parts[0] ?? query).trim();
  const area = (parts[1] ?? "Chennai").replace(/ Chennai$/i, "").trim();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_EXEC_PATH,
    args: LAUNCH_ARGS,
  });

  try {
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    // -----------------------------------------------------------------------
    // Pass 1: Load search results and collect listing metadata + detail URLs
    // -----------------------------------------------------------------------
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { timeout: 30000, waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const listings = await collectListingsFromFeed(page, category, area, maxResults);

    // -----------------------------------------------------------------------
    // Pass 2: Navigate to each listing's own URL to extract phone number
    // -----------------------------------------------------------------------
    const results: ScrapedBusiness[] = [];

    for (const listing of listings) {
      try {
        await page.goto(listing.detailUrl, {
          timeout: 20000,
          waitUntil: "domcontentloaded",
        });
        await page.waitForTimeout(2000);

        const phone = await extractPhoneFromDetailPage(page);
        const address = await extractAddressFromDetailPage(page, `${area}, Chennai`);

        results.push({
          name: listing.name,
          category: listing.detectedCategory,
          area,
          rating: listing.rating,
          reviews: listing.reviews,
          hasWebsite: listing.hasWebsite,
          phone,
          address,
          source: "playwright",
        });
      } catch {
        // If the detail page fails, still include the listing without phone
        results.push({
          name: listing.name,
          category: listing.detectedCategory,
          area,
          rating: listing.rating,
          reviews: listing.reviews,
          hasWebsite: listing.hasWebsite,
          phone: "",
          address: `${area}, Chennai`,
          source: "playwright",
        });
      }
    }

    return results;
  } finally {
    await browser.close();
  }
}
