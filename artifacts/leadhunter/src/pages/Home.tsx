import { useState } from "react";
import { Header } from "../components/Header";
import { SearchForm } from "../components/SearchForm";
import { ResultsTable } from "../components/ResultsTable";
import { EmptyState } from "../components/EmptyState";
import { scrapeLeads, pingBackend } from "../lib/api";
import type { Business, SearchParams } from "../lib/types";

export function Home() {
  const [leads, setLeads] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"unknown" | "ok" | "error">("unknown");
  const [hasResults, setHasResults] = useState(false);

  async function handleTestBackend(url: string) {
    if (!url) return;
    const ok = await pingBackend(url);
    setBackendStatus(ok ? "ok" : "error");
  }

  async function handleSearch(params: SearchParams) {
    setLoading(true);
    setError(null);

    try {
      const data = await scrapeLeads(params.backendUrl, params.query, params.max);
      setLeads(data.results);
      setHasResults(true);
      setBackendStatus("ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError("Scrape failed: " + msg);
      setBackendStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const withPhone = leads.filter((b) => !!b.phone).length;
  const noWebsite = leads.filter((b) => !b.hasWebsite).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Header totalLeads={leads.length} withPhone={withPhone} noWebsite={noWebsite} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 310,
            background: "var(--s1)",
            borderRight: "1px solid var(--b)",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <SearchForm
            onSearch={handleSearch}
            loading={loading}
            backendStatus={backendStatus}
            onTestBackend={handleTestBackend}
          />
        </aside>

        {/* Main area */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          {hasResults && !loading && !error ? (
            <ResultsTable leads={leads} />
          ) : (
            <EmptyState loading={loading} error={error} />
          )}
        </main>
      </div>
    </div>
  );
}
