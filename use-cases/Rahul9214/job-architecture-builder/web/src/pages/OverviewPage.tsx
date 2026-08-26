import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api";
import { useCorpus } from "../corpus";
import type { ArchitectureSummary, SuperDocsStatus } from "../types";
import { MetricsRow } from "../components/Metric";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, Loading } from "../components/Status";

export function OverviewPage() {
  const { corpusId, analyzed, analyze, loading } = useCorpus();
  const [summary, setSummary] = useState<ArchitectureSummary | null>(null);
  const [status, setStatus] = useState<SuperDocsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const superdocs = await api.superdocs();
        if (!cancelled) setStatus(superdocs);
        if (analyzed && corpusId) {
          const architecture = await api.architecture(corpusId);
          if (!cancelled) setSummary(architecture);
        } else if (!cancelled) {
          setSummary(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load overview.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [corpusId, analyzed]);

  if (loading && !summary) return <Loading label="Loading workspace" />;
  if (error) return <ErrorBanner message={error} />;

  const metrics = summary?.metrics;
  const nextAction = nextUsefulAction(analyzed, metrics);

  return (
    <section>
      <PageHeader kicker={summary?.organization ?? "Workspace"} title="Overview">
        Sources → Architecture → Exceptions → Framework → Profiles → Change impact → Human review →
        Export. The application uses the same domain engine as the CLI.
      </PageHeader>
      {!analyzed ? (
        <div className="empty">
          This corpus has not been analyzed yet.
          <div className="actions" style={{ marginTop: "0.75rem" }}>
            <button type="button" className="primary" onClick={() => void analyze()}>
              Analyze
            </button>
          </div>
        </div>
      ) : metrics ? (
        <>
          <MetricsRow metrics={metrics} />
          <p className="health-note">
            {healthCopy(metrics)} {nextAction}
          </p>
        </>
      ) : null}
      <div className="grid-2">
        <article className="card">
          <h2>Reviewer path</h2>
          <p>
            <Link to="/architecture">Inspect clusters</Link>, then{" "}
            <Link to="/exceptions">provisional and misfit findings</Link>, then a{" "}
            <Link to="/impact">canonical level edit</Link>.
          </p>
        </article>
        <article className="card">
          <h2>SuperDocs</h2>
          {status?.configured ? (
            <p>Configured on the server. Live export remains a CLI operation.</p>
          ) : (
            <p>Not configured. The architecture is fully browsable offline.</p>
          )}
          <p>{status?.live_export_reason}</p>
        </article>
      </div>
    </section>
  );
}

function healthCopy(metrics: ArchitectureSummary["metrics"]): string {
  const occupied = metrics.strong_fits + metrics.provisional;
  return `${metrics.proposed_families} families and ${metrics.tracks} tracks cover ${occupied} classified roles. ${metrics.misfits} misfit ${metrics.misfits === 1 ? "role sits" : "roles sit"} outside the architecture.`;
}

function nextUsefulAction(
  analyzed: boolean,
  metrics: ArchitectureSummary["metrics"] | undefined,
): ReactNode {
  if (!analyzed || !metrics) return null;
  if (metrics.misfits > 0 || metrics.provisional > 0) {
    return (
      <>
        Next: review <Link to="/exceptions">exceptions</Link>.
      </>
    );
  }
  return (
    <>
      Next: inspect <Link to="/architecture">clusters</Link> or a{" "}
      <Link to="/impact">canonical level change</Link>.
    </>
  );
}
