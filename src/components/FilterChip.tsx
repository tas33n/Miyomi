interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, selected = false, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl transition-all font-['Inter',sans-serif] ${
        selected
          ? 'bg-[var(--brand)] text-white'
          : 'bg-[var(--chip-bg)] text-[var(--text-primary)] hover:bg-[var(--brand)] hover:text-white'
      }`}
      style={{ fontWeight: selected ? 600 : 400 }}
    >
      {label}
    </button>
  );
}
