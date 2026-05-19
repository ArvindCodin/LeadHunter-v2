import type { Business } from "./types";

/**
 * Opportunity Score (0–100)
 * Measures how good of a lead this business is for outreach.
 * Key signals: no website (biggest gap), has phone (contactable),
 * active reviews (real business), solid rating (quality).
 */
export function opportunityScore(b: Business): number {
  let score = 0;

  if (!b.hasWebsite) score += 35;
  if (b.phone) score += 15;

  if (b.reviews >= 100) score += 20;
  else if (b.reviews >= 50) score += 13;
  else if (b.reviews >= 20) score += 7;
  else if (b.reviews >= 5) score += 3;

  if (b.rating >= 4.5) score += 20;
  else if (b.rating >= 4.0) score += 13;
  else if (b.rating >= 3.5) score += 7;

  if (b.rating > 0) score += 10;

  return Math.min(score, 100);
}

/**
 * WTP Score — Willingness to Pay (0–100)
 * Estimates how likely the business owner is to pay for digital services
 * (website, SEO, ads, etc.). A business that's established, highly rated,
 * and has no website is the perfect target.
 */
export function wtpScore(b: Business): number {
  let score = 0;

  if (b.reviews >= 200) score += 30;
  else if (b.reviews >= 100) score += 22;
  else if (b.reviews >= 50) score += 14;
  else if (b.reviews >= 20) score += 8;
  else if (b.reviews >= 5) score += 3;

  if (b.rating >= 4.5) score += 25;
  else if (b.rating >= 4.0) score += 18;
  else if (b.rating >= 3.5) score += 10;

  if (!b.hasWebsite) score += 20;
  if (b.phone) score += 10;

  if (!b.hasWebsite && b.rating >= 4.0 && b.reviews >= 50) score += 15;

  return Math.min(score, 100);
}

export type ScoreLabel = "HOT" | "WARM" | "COLD" | "—";

export function scoreLabel(score: number): ScoreLabel {
  if (score >= 75) return "HOT";
  if (score >= 45) return "WARM";
  if (score > 0) return "COLD";
  return "—";
}

export function scoreColor(score: number): string {
  if (score >= 75) return "var(--acc)";
  if (score >= 45) return "var(--acc2)";
  if (score > 0) return "var(--sub)";
  return "var(--dim)";
}
