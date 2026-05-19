export interface Business {
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

export interface ScrapeResponse {
  results: Business[];
  count: number;
  source: string;
}

export interface SearchParams {
  query: string;
  max: number;
  backendUrl: string;
}
