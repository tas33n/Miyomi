import { Search } from 'lucide-react';

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AdminSearchBar({ value, onChange, placeholder = 'Search…' }: AdminSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all border focus:ring-2"
        style={{
          background: 'var(--bg-elev-1)',
          borderColor: 'var(--divider)',
          color: 'var(--text-primary)',
          '--tw-ring-color': 'var(--brand)',
        } as React.CSSProperties}
      />
    </div>
  );
}
