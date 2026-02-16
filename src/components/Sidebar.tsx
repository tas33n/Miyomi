interface SidebarProps {
  activeItem?: string;
  onNavigate?: (page: string) => void;
  items?: string[];
}

export function Sidebar({ activeItem = 'Apps', onNavigate, items = ['Apps', 'Support', 'FAQ', 'Tutorials'] }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-60 flex-col gap-1 sticky top-20">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onNavigate?.(item)}
          className={`px-4 py-2.5 rounded-xl transition-all font-['Inter',sans-serif] text-left ${
            item === activeItem
              ? 'bg-[var(--chip-bg)] text-[var(--brand)]'
              : 'text-[var(--text-primary)] hover:bg-[var(--bg-elev-1)]'
          }`}
          style={{ fontWeight: item === activeItem ? 600 : 400 }}
        >
          {item}
        </button>
      ))}
    </aside>
  );
}
