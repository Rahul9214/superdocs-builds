import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api";
import { Empty, ErrorBanner, Loading } from "../components/Status";
import { useCorpus } from "../corpus";
import type { FrameworkPayload, ImpactPayload, UpdatePlanView } from "../types";

const DIMENSION_LABELS: Record<string, string> = {
  scope: "Scope",
  autonomy: "Autonomy",
  decision_authority: "Decision authority",
  complexity: "Complexity",
  impact: "Impact",
  leadership: "Leadership",
  people_management: "People management",
};

export function ImpactPage() {
  const { corpusId, analyzed } = useCorpus();
  const [framework, setFramework] = useState<FrameworkPayload | null>(null);
  const [levelId, setLevelId] = useState("");
  const [dimension, setDimension] = useState("scope");
  const [value, setValue] = useState("");
  const [impact, setImpact] = useState<ImpactPayload | null>(null);
  const [plans, setPlans] = useState<UpdatePlanView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!analyzed) {
      setFramework(null);
      return;
    }
    let cancelled = false;
    api
      .framework(corpusId)
      .then((payload) => {
        if (cancelled) return;
        setFramework(payload);
        const nextLevel = payload.default_occupied_level_id ?? payload.levels[0]?.id ?? "";
        setLevelId(nextLevel);
        setDimension(payload.editable_dimensions?.[0] ?? "scope");
        setValue("");
        setImpact(null);
        setPlans([]);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Unable to load framework.");
      });
    return () => {
      cancelled = true;
    };
  }, [analyzed, corpusId]);

  const selected = framework?.levels.find((item) => item.id === levelId);
  const oldValue = useMemo(() => {
    if (!selected) return "";
    const raw = selected[dimension as keyof typeof selected];
    return typeof raw === "string" ? raw : String(raw ?? "");
  }, [dimension, selected]);

  async function runImpact() {
    setBusy(true);
    setError(null);
    try {
      const payload = await api.impact(corpusId, { level_id: levelId, dimension, value });
      setImpact(payload);
      setPlans([]);
    } catch (err) {
      setImpact(null);
      setPlans([]);
      setError(err instanceof ApiError ? err.message : "Impact analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runPlan() {
    setBusy(true);
    setError(null);
    try {
      const payload = await api.plan(corpusId, { level_id: levelId, dimension, value });
      setImpact(payload.impact);
      setPlans(payload.plans);
    } catch (err) {
      setPlans([]);
      setError(err instanceof ApiError ? err.message : "Update planning failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!analyzed) return <Empty>Analyze the corpus before proposing a canonical level change.</Empty>;
  if (!framework && !error) return <Loading label="Loading occupied levels" />;
  if (!framework) return error ? <ErrorBanner message={error} /> : null;

  const dimensions = framework.editable_dimensions?.length
    ? framework.editable_dimensions
    : ["scope"];

  return (
    <section>
      <h1>Change impact</h1>
      <p>
        Edit one canonical dimension. Impact analysis and update planning run against the live domain
        engine. Nothing is applied until human review.
      </p>
      {error ? <ErrorBanner message={error} /> : null}
      <div className="grid-2">
        <label htmlFor="level">
          Occupied level
          <select id="level" value={levelId} onChange={(event) => setLevelId(event.target.value)}>
            {framework.levels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} v{item.version}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="dimension">
          Canonical dimension
          <select
            id="dimension"
            value={dimension}
            onChange={(event) => setDimension(event.target.value)}
          >
            {dimensions.map((item) => (
              <option key={item} value={item}>
                {DIMENSION_LABELS[item] ?? item.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="before-after" style={{ marginTop: "1rem" }}>
        <article className="card">
          <h2>OLD</h2>
          <p>Current {DIMENSION_LABELS[dimension] ?? dimension} value.</p>
          <pre className="mono">{oldValue || "—"}</pre>
        </article>
        <article className="card">
          <h2>NEW</h2>
          <label htmlFor="proposed">
            Proposed value
            <textarea
              id="proposed"
              rows={6}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>
        </article>
      </div>
      <div className="actions" style={{ margin: "1rem 0" }}>
        <button type="button" className="ghost" onClick={() => void runImpact()} disabled={busy}>
          Analyze impact
        </button>
        <button type="button" className="primary" onClick={() => void runPlan()} disabled={busy}>
          Plan targeted updates
        </button>
      </div>
      {impact ? (
        <>
          <div className="metrics">
            <div className="metric">
              <strong>{impact.affected_profiles_count}</strong>
              <span>affected profiles</span>
            </div>
            <div className="metric">
              <strong>{impact.unaffected_profiles_count}</strong>
              <span>unaffected profiles</span>
            </div>
            <div className="metric">
              <strong>{impact.changed_dimensions.join(", ") || "none"}</strong>
              <span>canonical dimensions changed</span>
            </div>
          </div>
          {impact.affected_profiles_count === 0 ? (
            <Empty>No affected profiles for this edit.</Empty>
          ) : (
            <>
              <h2>Why profiles are affected</h2>
              <ul>
                {impact.affected_sections.map((item) => (
                  <li key={`${item.profile_id}-${item.section_id}-${item.edge_id}`}>
                    {item.profile_id} / {item.section_id}: {item.reason} (edge {item.edge_id})
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : null}
      {plans.length ? (
        <>
          <h2>Targeted update plans</h2>
          <p>Unrelated sections preserved. Only listed fields change.</p>
          <div className="stack">
            {plans.map((plan) => (
              <article className="card" key={plan.plan_id}>
                <h3>
                  {plan.profile_id} · {plan.section_id}
                </h3>
                <p>{plan.reason}</p>
                <p>
                  Dependency {plan.dependency.id} · source v{plan.dependency.source_version}
                </p>
                <div className="before-after">
                  <div>
                    <strong>Before</strong>
                    <pre className="mono">{plan.before}</pre>
                  </div>
                  <div>
                    <strong>After</strong>
                    <pre className="mono">{plan.after}</pre>
                  </div>
                </div>
                <p>
                  Unrelated sections preserved: {plan.preserved_rendered_fields.join(", ") || "none listed"}
                </p>
              </article>
            ))}
          </div>
          <p>
            Continue to <Link to="/review">human review</Link>. No default approval.
          </p>
        </>
      ) : null}
    </section>
  );
}
