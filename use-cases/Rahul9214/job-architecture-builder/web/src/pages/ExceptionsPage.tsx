import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Empty, ErrorBanner, FitChip, Loading } from "../components/Status";
import { useCorpus } from "../corpus";
import type { ExceptionCard } from "../types";

export function ExceptionsPage() {
  const { corpusId, analyzed } = useCorpus();
  const [rows, setRows] = useState<{
    provisional: ExceptionCard[];
    hybrid_bridge: ExceptionCard[];
    misfit: ExceptionCard[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analyzed) {
      setRows(null);
      return;
    }
    let cancelled = false;
    api
      .exceptions(corpusId)
      .then((payload) => {
        if (!cancelled) setRows(payload);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load exceptions.");
      });
    return () => {
      cancelled = true;
    };
  }, [corpusId, analyzed]);

  if (!analyzed) return <Empty>Analyze the corpus to review provisional and misfit roles.</Empty>;
  if (error) return <ErrorBanner message={error} />;
  if (!rows) return <Loading label="Loading exceptions" />;

  return (
    <section>
      <h1>Provisional and misfit review</h1>
      <p>
        Misfits are valid architecture findings, not errors to auto-assign. They require an
        architecture decision.
      </p>
      <Bucket title="Provisional" items={rows.provisional} />
      <Bucket title="Hybrid / bridge" items={rows.hybrid_bridge} />
      <Bucket title="Misfit" items={rows.misfit} />
    </section>
  );
}

function Bucket({ title, items }: { title: string; items: ExceptionCard[] }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <Empty>None in this bucket.</Empty>
      ) : (
        <div className="grid-2">
          {items.map((item) => (
            <article className="card" key={item.role_id}>
              <h3>{item.title}</h3>
              <div className="actions">
                <FitChip status={item.fit_status} />
                <span className="chip">{item.status.replace(/_/g, " ")}</span>
              </div>
              <p>{item.why}</p>
              {item.nearest_cluster_id ? (
                <p>
                  Nearest architecture context: cluster {item.nearest_cluster_id}
                  {item.nearest_similarity != null ? ` (${item.nearest_similarity.toFixed(2)})` : ""}.
                </p>
              ) : null}
              {item.has_normalized_profile ? null : <p>Shown as a review artifact, not a normalized profile.</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
