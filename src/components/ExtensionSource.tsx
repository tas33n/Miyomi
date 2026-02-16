import { Button } from './Button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ExtensionSourceProps {
  name: string;
  language: string;
  url: string;
  compatibility: string[];
  iconColor: string;
}

export function ExtensionSource({ name, language, url, compatibility, iconColor }: ExtensionSourceProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-xl hover:bg-[var(--bg-elev-1)] transition-all">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
        style={{ backgroundColor: iconColor, fontWeight: 600, fontSize: '16px' }}
      >
        {name.charAt(0)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-['Inter',sans-serif] text-[var(--text-primary)] mb-0.5" style={{ fontWeight: 600, fontSize: '14px' }}>
          {name}
        </div>
        <div className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-1.5" style={{ fontSize: '12px' }}>
          {language}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {compatibility.map((app, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--chip-bg)] text-[var(--text-secondary)] font-['Inter',sans-serif]"
              style={{ fontWeight: 500 }}
            >
              {app}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <Button variant="primary" onClick={() => toast.success('Installing extension...')}>
          Install
        </Button>
        <button
          onClick={handleCopyUrl}
          className="px-4 py-2 rounded-xl border border-[var(--divider)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elev-1)] transition-all font-['Inter',sans-serif] flex items-center gap-2"
          style={{ fontWeight: 600 }}
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Copy URL</span>
        </button>
      </div>
    </div>
  );
}
