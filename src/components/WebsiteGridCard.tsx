import { Globe, ExternalLink } from 'lucide-react';

interface WebsiteGridCardProps {
  name: string;
  url: string;
  description: string;
  category: string;
  color: string;
}

export function WebsiteGridCard({ name, url, description, category, color }: WebsiteGridCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 sm:p-6 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl hover:shadow-lg transition-all group"
      style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform"
        style={{ backgroundColor: color }}
      >
        <Globe className="w-7 h-7" />
      </div>
      
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-['Inter',sans-serif] text-[var(--text-primary)] flex-1" style={{ fontWeight: 600, fontSize: '16px' }}>
          {name}
        </h3>
        <ExternalLink className="w-4 h-4 text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
      
      <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-3 line-clamp-2" style={{ fontSize: '14px' }}>
        {description}
      </p>
      
      <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-[var(--chip-bg)] text-[var(--text-secondary)] font-['Inter',sans-serif]" style={{ fontWeight: 500 }}>
        {category}
      </span>
    </a>
  );
}
