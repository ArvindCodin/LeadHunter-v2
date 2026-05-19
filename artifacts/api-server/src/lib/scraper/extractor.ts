import type { Page } from "playwright";

const CHROMIUM_PATH =
  "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";

export const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-first-run",
];

export const CHROMIUM_EXEC_PATH = CHROMIUM_PATH;

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Extracts the phone number from an already-open Google Maps business detail page.
 * Tries multiple selector strategies in order.
 */
export async function extractPhoneFromDetailPage(page: Page): Promise<string> {
  // Strategy 1: data-item-id attribute — most reliable.
  // Google Maps phone buttons carry "phone:tel:+XXXXXXXXXX" in this attribute.
  try {
    const phoneBtn = await page.waitForSelector('[data-item-id^="phone:tel:"]', {
      timeout: 4000,
    });
    if (phoneBtn) {
      const itemId = await phoneBtn.getAttribute("data-item-id");
      if (itemId) return itemId.replace("phone:tel:", "").trim();
    }
  } catch {
    // fall through to next strategy
  }

  // Strategy 2: tel: hyperlink
  try {
    const telLink = await page.$('a[href^="tel:"]');
    if (telLink) {
      const href = await telLink.getAttribute("href");
      if (href) return href.replace("tel:", "").trim();
    }
  } catch {
    // fall through
  }

  // Strategy 3: aria-label containing phone-like pattern
  try {
    const spans = await page.$$('[aria-label]');
    for (const span of spans) {
      const label = (await span.getAttribute("aria-label")) ?? "";
      const match = label.match(/\+?\d[\d\s\-().]{8,}/);
      if (match) return match[0].replace(/\s/g, "");
    }
  } catch {
    // fall through
  }

  return "";
}

/**
 * Extracts the business address from an open Google Maps detail page.
 */
export async function extractAddressFromDetailPage(
  page: Page,
  fallback: string,
): Promise<string> {
  try {
    const addrBtn = await page.$('[data-item-id="address"]');
    if (addrBtn) {
      const text = await addrBtn.innerText();
      const trimmed = text.trim();
      if (trimmed) return trimmed;
    }
  } catch {
    // fall through
  }
  return fallback;
}

/**
 * From the Google Maps search-results page, collects basic listing info
 * (name, category, rating, review count, website presence) plus the URL
 * to the individual business detail page.
 *
 * Returns an array ready for the second pass that navigates each detail URL.
 */
export async function collectListingsFromFeed(
  page: Page,
  category: string,
  area: string,
  limit: number,
): Promise<
  Array<{
    name: string;
    detailUrl: string;
    rating: number;
    reviews: number;
    hasWebsite: boolean;
    detectedCategory: string;
  }>
> {
  const { isChain } = await import("./chain-filter.js");

  // Wait for the results feed and scroll to load more listings.
  const feedSelector = '[role="feed"]';
  try {
    await page.waitForSelector(feedSelector, { timeout: 8000 });
    const feed = page.locator(feedSelector).first();
    for (let i = 0; i < 4; i++) {
      await feed.evaluate((el) => {
        (el as HTMLElement).scrollTop += 2000;
      });
      await page.waitForTimeout(1000);
    }
  } catch {
    // If no feed, try keyboard scrolling
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("End");
      await page.waitForTimeout(800);
    }
  }

  const articles = await page.$$('[role="article"]');
  const results: Array<{
    name: string;
    detailUrl: string;
    rating: number;
    reviews: number;
    hasWebsite: boolean;
    detectedCategory: string;
  }> = [];

  for (const article of articles) {
    if (results.length >= limit) break;

    try {
      // Business name
      const nameEl = await article.$('[class*="fontHeadlineSmall"]');
      const name = nameEl ? (await nameEl.innerText()).trim() : "";
      if (!name || isChain(name)) continue;

      // Href to the individual business detail page
      const link = await article.$('a[href*="/maps/place/"]');
      const detailUrl = link ? (await link.getAttribute("href")) ?? "" : "";
      if (!detailUrl) continue;

      // Rating and review count
      let rating = 0;
      let reviews = 0;
      try {
        const ratingEl = await article.$('span[aria-label*="star"]');
        if (ratingEl) {
          const label = (await ratingEl.getAttribute("aria-label")) ?? "";
          const ratingMatch = label.match(/(\d+\.?\d*)/);
          if (ratingMatch) rating = parseFloat(ratingMatch[1]);
          const reviewMatch = label.match(/([\d,]+)\s+review/);
          if (reviewMatch) reviews = parseInt(reviewMatch[1].replace(/,/g, ""), 10);
        }
      } catch {
        // ok, keep defaults
      }

      // Whether the listing shows a "Website" button
      const hasWebsite = !!(await article.$('[data-item-id="authority"]'));

      // Detected sub-category from the listing card text
      let detectedCategory = category;
      try {
        const spans = await article.$$('[class*="fontBodyMedium"] span');
        for (const span of spans) {
          const txt = (await span.innerText()).trim();
          if (txt && txt.length < 60 && !txt.match(/^[\d.+\-()]/)) {
            detectedCategory = txt;
            break;
          }
        }
      } catch {
        // keep default
      }

      results.push({ name, detailUrl, rating, reviews, hasWebsite, detectedCategory });
    } catch {
      continue;
    }
  }

  return results;
}
