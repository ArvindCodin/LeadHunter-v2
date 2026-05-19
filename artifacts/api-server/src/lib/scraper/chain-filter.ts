const CHAIN_KEYWORDS: string[] = [
  "naturals", "ccd", "cafe coffee day", "saravana stores", "saravana bhavan",
  "hotel saravana", "kfc", "mcdonalds", "dominos", "pizza hut", "subway",
  "burger king", "apollo pharmacy", "medplus", "wellness forever",
  "reliance fresh", "reliance digital", "spencer", "lifestyle", "shoppers stop",
  "decathlon", "zara", "h&m", "tanishq", "malabar gold", "kalyan jewellers",
  "muthoot", "manappuram", "airtel store", "jio point", "samsung", "lg showroom",
  "honda", "hyundai", "maruti", "tvs motors", "bajaj", "royal enfield",
  "hdfc bank", "icici bank", "sbi", "canara", "indian bank", "axis bank", "kotak",
  "chennai silks", "rmkv", "nalli", "pothy", "kumaran silks", "kalanikethan",
  "heritage", "aavin", "nilgiris", "bigbasket", "haldirams", "bikanervala",
  "ananda bhavan", "murugan idli", "sangeetha", "forest essentials", "fab india",
  "westside",
];

export function isChain(name: string): boolean {
  const lower = name.toLowerCase();
  return CHAIN_KEYWORDS.some((keyword) => lower.includes(keyword));
}
