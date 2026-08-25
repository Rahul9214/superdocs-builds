import { useEffect, useState } from "react";
import { api, ApiError } from "../api";
import { Empty, ErrorBanner, Loading } from "../components/Status";
import { useCorpus } from "../corpus";
import type { ProfileSummary, SuperDocsStatus } from "../types";

export function ExportPage() {
  const { corpusId, analyzed } = useCorpus();
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [profileId, setProfileId] = useState("");
  const [status, setStatus] = useState<SuperDocsStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [downloadHref, setDownloadHref] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setMessage(null);
      setDownloadHref(null);
      try {
        const superdocs = await api.superdocs();
        if (!cancelled) setStatus(superdocs);
        if (analyzed) {
          const payload = await api.profiles(corpusId);
          if (!cancelled) {
            setProfiles(payload.profiles);
            setProfileId(payload.profiles[0]?.profile_id ?? "");
          }
        } else if (!cancelled) {
          setProfiles([]);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load export status.");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [analyzed, corpusId]);

  async function exportKind(kind: "framework" | "profile") {
    setError(null);
    setMessage(null);
    setDownloadHref(null);
    try {
      const result = await api.exportLocal(corpusId, kind, kind === "profile" ? profileId : undefined);
      if (!result.ok) {
        setError("Export did not produce an artifact.");
        return;
      }
      setMessage(`Local ${kind} artifact written: ${result.filename} (${result.via}). SuperDocs was not called.`);
      setDownloadHref(`/api/export/${corpusId}/download/${encodeURIComponent(result.filename)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed.");
    }
  }

  if (error && !status) return <ErrorBanner message={error} />;
  if (!status) return <Loading label="Loading export status" />;

  return (
    <section>
      <h1>Export</h1>
      <p>Local DOCX export writes a real file. SuperDocs live export is not performed from this screen.</p>
      {error ? <ErrorBanner message={error} /> : null}
      {!analyzed ? <Empty>Analyze the corpus before exporting framework or profiles.</Empty> : null}
      <div className="grid-2">
        <article className="card">
          <h2>Framework</h2>
          <button
            type="button"
            className="primary"
            disabled={!analyzed}
            onClick={() => void exportKind("framework")}
          >
            Export framework
          </button>
        </article>
        <article className="card">
          <h2>Selected role profile</h2>
          {profiles.length === 0 ? (
            <Empty>No profile available to export.</Empty>
          ) : (
            <>
              <label htmlFor="export-profile">
                Profile
                <select
                  id="export-profile"
                  value={profileId}
                  onChange={(event) => setProfileId(event.target.value)}
                >
                  {profiles.map((item) => (
                    <option key={item.profile_id} value={item.profile_id}>
                      {item.display_title} ({item.level_label})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="primary"
                disabled={!analyzed || !profileId}
                onClick={() => void exportKind("profile")}
              >
                Export selected profile
              </button>
            </>
          )}
        </article>
      </div>
      {message ? <p>{message}</p> : null}
      {downloadHref ? (
        <p>
          <a href={downloadHref}>Download generated DOCX</a>
        </p>
      ) : null}
      <article className="card" style={{ marginTop: "1rem" }}>
        <h2>SuperDocs live export</h2>
        <span className={`chip ${status.configured ? "good" : "warn"}`}>
          {status.configured ? "configured" : "not configured"}
        </span>
        <p>{status.live_export_reason}</p>
        <button type="button" className="ghost" disabled>
          Live SuperDocs export unavailable
        </button>
      </article>
    </section>
  );
}
