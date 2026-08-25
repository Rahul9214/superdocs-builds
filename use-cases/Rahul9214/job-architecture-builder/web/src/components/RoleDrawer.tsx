import type { RoleDetail } from "../types";
import { FitChip } from "./Status";

export function RoleDrawer({
  role,
  onClose,
}: {
  role: RoleDetail;
  onClose: () => void;
}) {
  return (
    <>
      <button type="button" className="backdrop" aria-label="Close role evidence" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-labelledby="role-drawer-title">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h2 id="role-drawer-title">{role.title}</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <p>
          {role.team} · {role.filename}
        </p>
        <div className="actions">
          <FitChip status={role.fit_status} />
          <span className="chip">{role.proposed_family ?? "unassigned family"}</span>
          <span className="chip">{role.career_track ?? "no track"}</span>
          <span className="chip">{role.level ?? "no level"}</span>
          <span className="chip">confidence {role.confidence.toFixed(1)}</span>
        </div>
        {role.title_conflict ? (
          <div className="title-vs-evidence">
            <h3>Title vs evidence</h3>
            <p>
              <strong>Title signal.</strong> {role.title_conflict.title_signal}.
            </p>
            <p>
              <strong>Evidence-based outcome.</strong> {role.title_conflict.evidence_result}.
            </p>
            <p>
              <strong>Why it differs.</strong> {role.title_conflict.summary} The title was not used to
              classify this role.
            </p>
          </div>
        ) : null}
        <h3>Supporting evidence</h3>
        <ul>
          {role.supporting_evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3>Counter-evidence</h3>
        {role.counter_evidence.length ? (
          <ul>
            {role.counter_evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>None recorded.</p>
        )}
        <h3>Evidence signals</h3>
        {Object.entries(role.signals).map(([key, value]) => (
          <p key={key}>
            <strong>{key.replace(/_/g, " ")}.</strong> {value}
          </p>
        ))}
        <h3>Source references</h3>
        <ul>
          {role.source_references.map((item) => (
            <li key={`${item.document_id}-${item.locator}`}>
              {item.document_id} · {item.locator}
              {item.excerpt ? ` — ${item.excerpt}` : ""}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
