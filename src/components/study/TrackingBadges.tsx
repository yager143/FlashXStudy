import { X, Check } from 'lucide-react';

interface TrackingBadgesProps {
  knownCount: number;
  missedCount: number;
}

export default function TrackingBadges({ knownCount, missedCount }: TrackingBadgesProps) {
  return (
    <div className="flex items-center justify-between px-2">
      {/* Still Learning */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--danger-dim)] border border-[var(--danger)]/20">
        <X size={16} className="text-[var(--danger)]" strokeWidth={2.5} />
        <span className="text-2xl font-bold text-[var(--danger)]">{missedCount}</span>
        <span className="text-xs font-semibold text-[var(--danger)]/70">Still Learning</span>
      </div>

      {/* Know */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--success-dim)] border border-[var(--success)]/20">
        <span className="text-xs font-semibold text-[var(--success)]/70">Know It</span>
        <span className="text-2xl font-bold text-[var(--success)]">{knownCount}</span>
        <Check size={16} className="text-[var(--success)]" strokeWidth={2.5} />
      </div>
    </div>
  );
}
