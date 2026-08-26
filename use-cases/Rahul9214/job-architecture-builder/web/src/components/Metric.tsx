import { metricLabel } from "../labels";

export function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function MetricsRow({ metrics }: { metrics: Record<string, string | number> }) {
  return (
    <div className="metrics">
      {Object.entries(metrics).map(([key, value]) => (
        <Metric key={key} value={value} label={metricLabel(key)} />
      ))}
    </div>
  );
}
