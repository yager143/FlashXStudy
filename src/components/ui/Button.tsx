import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] active:scale-95',
  ghost:
    'bg-transparent hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]',
  danger:
    'bg-[var(--danger)] hover:bg-rose-600 text-white shadow-lg hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-95',
  success:
    'bg-[var(--success)] hover:bg-emerald-600 text-white shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95',
  outline:
    'bg-transparent border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)] hover:text-[var(--accent)]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-lg',
  lg: 'px-6 py-3 text-base font-bold rounded-lg',
  xl: 'px-8 py-3.5 text-lg font-bold rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
