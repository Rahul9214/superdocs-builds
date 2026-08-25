import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { useCorpus } from "../corpus";
import type { CorpusSummary } from "../types";
import { Empty, ErrorBanner, Loading } from "../components/Status";

export function SourcesPage() {
  const { corpusId } = useCorpus();
  const [corpus, setCorpus] = useState<CorpusSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .corpus(corpusId)
      .then((payload) => {
        if (!cancelled) setCorpus(payload);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load sources.");
      });
    return () => {
      cancelled = true;
    };
  }, [corpusId]);

  if (error) return <ErrorBanner message={error} />;
  if (!corpus) return <Loading label="Loading sources" />;

  return (
    <section>
      <h1>Sources</h1>
      <p>
        {corpus.organization}. {corpus.role_count} job descriptions. Analysis state:{" "}
        {corpus.analyzed ? "analyzed" : "not analyzed"}.
      </p>
      {corpus.roles.length === 0 ? (
        <Empty>No source roles in this corpus.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Team</th>
                <th>Filename</th>
                <th>Role id</th>
              </tr>
            </thead>
            <tbody>
              {corpus.roles.map((role) => (
                <tr key={role.role_id}>
                  <td>{role.title}</td>
                  <td>{role.team}</td>
                  <td>{role.filename}</td>
                  <td>{role.role_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
