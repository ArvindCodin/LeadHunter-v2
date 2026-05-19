# LeadHunter v2

A local lead generation tool that scrapes Google Maps for real businesses in your target area, extracts their phone numbers, and lets you contact them directly via WhatsApp.

## How It Works

1. You run the **backend** (Express API + Playwright) on a server or Replit
2. You open the **frontend** (React app) in your browser
3. Enter your backend URL, pick a category + area, hit "Hunt Leads"
4. The backend scrapes Google Maps in two passes:
   - **Pass 1**: Collect business names, ratings, and detail page URLs from the search results list
   - **Pass 2**: Navigate to each business's individual Google Maps page to extract the real phone number
5. Results appear with WhatsApp links and a CSV export button

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express + Playwright backend
│   │   └── src/
│   │       ├── lib/scraper/ # Modular scraper (types, extractor, chain-filter, index)
│   │       └── routes/      # HTTP route handlers
│   └── leadhunter/          # React frontend
│       └── src/
│           ├── components/  # Header, SearchForm, ResultsTable, EmptyState
│           ├── lib/         # api.ts, csv-export.ts, types.ts
│           └── pages/       # Home page
├── lib/                     # Shared TypeScript libraries
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-spec/            # OpenAPI spec + Orval config
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM schema + client
└── scripts/                 # Utility scripts
```

## Running Locally

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Playwright Chromium browsers

### Install

```bash
pnpm install
playwright install chromium
```

### Run the backend

```bash
pnpm --filter @workspace/api-server run dev
```

The API will be available at `http://localhost:5000`.

### Run the frontend

```bash
pnpm --filter @workspace/leadhunter run dev
```

Open `http://localhost:5173` in your browser.

### In the app
1. Enter the backend URL (`http://localhost:5000` for local, or your deployed URL for production)
2. Click **Test** to verify the connection
3. Select a category (e.g. "Dental Clinic") and an area (e.g. "Velachery")
4. Click **Hunt Leads**

## Running on Replit

1. Fork or upload this project to Replit
2. The backend and frontend each have their own workflow configured
3. Copy the backend's public URL and paste it into the frontend's "Backend URL" field

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

The core scraper does not require any API keys — it uses Playwright to scrape Google Maps directly.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ping` | Health check |
| GET | `/api/scrape?q=<query>&max=<n>` | Scrape Google Maps |
| GET | `/api/healthz` | Server health status |

### Example

```
GET /api/scrape?q=dental+clinics+in+Velachery&max=20
```

```json
{
  "results": [
    {
      "name": "Smile Dental Care",
      "category": "Dental clinic",
      "area": "Velachery",
      "rating": 4.6,
      "reviews": 128,
      "hasWebsite": false,
      "phone": "+91 98765 43210",
      "address": "42, Main Road, Velachery, Chennai",
      "source": "playwright"
    }
  ],
  "count": 1,
  "source": "playwright"
}
```

## Notes

- Scraping takes 1–3 minutes depending on how many results you request, because the backend navigates to each individual business page to get the phone number
- Results are filtered to exclude large chain businesses (KFC, Apollo Pharmacy, etc.) to focus on local independent businesses
- WhatsApp links are generated using the `wa.me/<phone>` format

## Important: Secrets

Never commit real secrets to GitHub. Use `.env` for local secrets and Replit Secrets for deployed secrets.
