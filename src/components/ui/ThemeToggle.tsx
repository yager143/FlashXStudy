import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useAppStore();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--border)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text)]"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
