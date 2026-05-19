export interface ScrapedBusiness {
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

export interface ScrapeOptions {
  query: string;
  maxResults: number;
}

export interface ListingBasic {
  name: string;
  detailUrl: string;
  rating: number;
  reviews: number;
  hasWebsite: boolean;
  detectedCategory: string;
}
