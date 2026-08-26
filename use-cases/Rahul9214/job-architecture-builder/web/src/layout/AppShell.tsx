import { NavLink, Outlet } from "react-router-dom";
import { useCorpus } from "../corpus";

const LINKS = [
  ["/", "Overview"],
  ["/sources", "Sources"],
  ["/architecture", "Architecture"],
  ["/exceptions", "Exceptions"],
  ["/framework", "Framework"],
  ["/profiles", "Profiles"],
  ["/impact", "Change Impact"],
  ["/review", "Review"],
  ["/export", "Export"],
] as const;

export function AppShell() {
  const { corpora, corpusId, setCorpusId, analyzed, analyze, loading, error } = useCorpus();
  const current = corpora.find((item) => item.corpus_id === corpusId);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          Job architecture
          <span>Reviewer workspace</span>
        </div>
        <nav className="nav" aria-label="Primary">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="corpus-context">
            <label htmlFor="corpus">
              Organization
              <select
                id="corpus"
                value={corpusId}
                onChange={(event) => setCorpusId(event.target.value)}
              >
                {corpora.map((item) => (
                  <option key={item.corpus_id} value={item.corpus_id}>
                    {item.organization}
                  </option>
                ))}
              </select>
            </label>
            <p className="corpus-meta">
              {current
                ? `${current.role_count} source roles · titles never determine level`
                : "Select a corpus to begin."}
            </p>
          </div>
          <div className="actions">
            <span className={`chip ${analyzed ? "good" : "warn"}`}>
              {analyzed ? "Analyzed" : "Not analyzed"}
            </span>
            <button type="button" className="primary" onClick={() => void analyze()} disabled={loading}>
              Analyze corpus
            </button>
          </div>
        </header>
        <main className="content">
          {error ? (
            <div className="error" role="alert">
              {error}
            </div>
          ) : null}
          <div className="page">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
