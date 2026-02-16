interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ variant = 'primary', children, onClick, disabled = false }: ButtonProps) {
  const baseStyles = 'px-3 sm:px-5 py-2 transition-all font-["Inter",sans-serif] text-sm';
  
  const variants = {
    primary: `${baseStyles} rounded-[20px] bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] active:bg-[var(--brand-strong)] disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: `${baseStyles} rounded-xl border border-[var(--divider)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elev-1)] active:bg-[var(--chip-bg)] disabled:opacity-50 disabled:cursor-not-allowed`,
    ghost: `${baseStyles} text-[var(--brand)] hover:text-[var(--brand-strong)] active:text-[var(--brand-strong)] disabled:opacity-50 disabled:cursor-not-allowed`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={variants[variant]}
      style={{ fontWeight: variant === 'ghost' ? 500 : 600 }}
    >
      {children}
    </button>
  );
}
