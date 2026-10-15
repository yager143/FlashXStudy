interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, className = '', showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, var(--accent), #f43f5e)',
          }}
        />
      </div>
      {showLabel && (
        <span className="absolute -top-5 right-0 text-xs font-medium text-[var(--text-muted)]">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
