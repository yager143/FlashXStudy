interface BadgeProps {
  count: number;
  variant?: 'success' | 'danger' | 'accent' | 'muted';
  label?: string;
}

const variantMap: Record<string, { bg: string; text: string }> = {
  success: { bg: 'bg-[var(--success-dim)]', text: 'text-[var(--success)]' },
  danger: { bg: 'bg-[var(--danger-dim)]', text: 'text-[var(--danger)]' },
  accent: { bg: 'bg-[var(--accent)]/20', text: 'text-[var(--accent)]' },
  muted: { bg: 'bg-[var(--surface-2)]', text: 'text-[var(--text-muted)]' },
};

export default function Badge({ count, variant = 'muted', label }: BadgeProps) {
  const styles = variantMap[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${styles.bg} ${styles.text}`}>
      <span className="text-base font-bold">{count}</span>
      {label && <span className="font-medium">{label}</span>}
    </span>
  );
}
