import { Router } from "express";
import { chromium } from "playwright";

const scrapeRouter = Router();

const CHROMIUM_PATH =
  "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";

const CHAIN_KEYWORDS = [
  "naturals","ccd","cafe coffee day","saravana stores","saravana bhavan",
  "hotel saravana","kfc","mcdonalds","dominos","pizza hut","subway",
  "burger king","apollo pharmacy","medplus","wellness forever",
  "reliance fresh","reliance digital","spencer","lifestyle","shoppers stop",
  "decathlon","zara","h&m","tanishq","malabar gold","kalyan jewellers",
  "muthoot","manappuram","airtel store","jio point","samsung","lg showroom",
  "honda","hyundai","maruti","tvs motors","bajaj","royal enfield",
  "hdfc bank","icici bank","sbi","canara","indian bank","axis bank","kotak",
  "chennai silks","rmkv","nalli","pothy","kumaran silks","kalanikethan",
  "heritage","aavin","nilgiris","bigbasket","haldirams","bikanervala",
  "ananda bhavan","murugan idli","sangeetha","forest essentials","fab india","westside",
];

function isChain(name: string): boolean {
  const n = name.toLowerCase();
  return CHAIN_KEYWORDS.some((k) => n.includes(k));
}

interface ScrapedBusiness {
  name: string;
  category: string;
  area: string;
  rating: number;
  reviews: number;
  hasWebsite: boolean;
  phone: string;
  address: string;
  source: string;
}

async function scrapeMaps(query: string, maxResults: number): Promise<ScrapedBusiness[]> {
  const results: ScrapedBusiness[] = [];
  const parts = query.split(" in ");
  const category = parts[0] || query;
  const area = (parts[1] || "Chennai").replace(" Chennai", "").trim();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { timeout: 30000, waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Scroll the results feed to load more
    const feedSelector = '[role="feed"]';
    try {
      await page.waitForSelector(feedSelector, { timeout: 8000 });
      const feed = page.locator(feedSelector).first();
      for (let i = 0; i < 4; i++) {
        await feed.evaluate((el) => { (el as unknown as { scrollTop: number }).scrollTop += 2000; });
        await page.waitForTimeout(1200);
      }
    } catch {
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press("End");
        await page.waitForTimeout(1000);
      }
    }

    const listings = await page.$$('[role="article"]');

    for (const item of listings.slice(0, maxResults)) {
      try {
        const nameEl = await item.$('[class*="fontHeadlineSmall"]');
        const name = nameEl ? (await nameEl.innerText()).trim() : "";
        if (!name || isChain(name)) continue;

        // Rating and review count from aria-label
        let rating = 0;
        let reviews = 0;
        try {
          const ratingEl = await item.$('span[aria-label*="stars"]');
          if (ratingEl) {
            const label = (await ratingEl.getAttribute("aria-label")) || "";
            const rm = label.match(/(\d+\.?\d*)/);
            if (rm) rating = parseFloat(rm[1]);
            const rvm = label.match(/([\d,]+)\s+review/);
            if (rvm) reviews = parseInt(rvm[1].replace(/,/g, ""), 10);
          }
        } catch { /* ok */ }

        // Website check — look for the "Website" button in the listing
        const hasWebsite = !!(await item.$('[data-item-id="authority"]'));

        // Try to detect sub-category from the DOM
        let detectedCategory = category;
        try {
          const spans = await item.$$('[class*="fontBodyMedium"] span');
          for (const span of spans) {
            const txt = (await span.innerText()).trim();
            if (txt && txt.length < 50 && !txt.match(/^[\d\.\+\-\(\)]/)) {
              detectedCategory = txt;
              break;
            }
          }
        } catch { /* keep default */ }

        // Address
        let address = `${area}, Chennai`;
        try {
          const addrEl = await item.$('[data-item-id="address"] .fontBodyMedium');
          if (addrEl) address = (await addrEl.innerText()).trim();
        } catch { /* keep default */ }

        results.push({
          name,
          category: detectedCategory,
          area,
          rating,
          reviews,
          hasWebsite,
          phone: "",
          address,
          source: "playwright",
        });
      } catch {
        continue;
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

scrapeRouter.get("/ping", (_req, res) => {
  res.json({ status: "ok", message: "LeadHunter backend running", engine: "playwright" });
});

scrapeRouter.get("/scrape", async (req, res) => {
  const query = (req.query["q"] as string) || "";
  const max = Math.min(parseInt((req.query["max"] as string) || "20", 10), 40);

  if (!query) {
    res.status(400).json({ error: "No query provided" });
    return;
  }

  req.log.info({ query, max }, "Scrape request");

  try {
    const results = await scrapeMaps(query, max);
    res.json({ results, count: results.length, source: "playwright" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err: message }, "Scrape failed");
    res.status(500).json({ error: "Scrape failed: " + message });
  }
});

export default scrapeRouter;
