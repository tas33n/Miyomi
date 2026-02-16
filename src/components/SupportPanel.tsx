import { MessageCircle, BookOpen, HelpCircle } from 'lucide-react';

export function SupportPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* FAQ Card */}
      <div
        className="p-5 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl"
        style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-[var(--brand)]" />
          <h3 className="font-['Inter',sans-serif] text-[var(--text-primary)]" style={{ fontWeight: 600 }}>
            FAQ
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {['How to install?', 'Troubleshooting', 'Updates', 'Compatibility'].map((item, index) => (
            <a
              key={index}
              href="#"
              className="text-sm text-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors font-['Inter',sans-serif]"
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Tutorials Card */}
      <div
        className="p-5 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl"
        style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-[var(--brand)]" />
          <h3 className="font-['Inter',sans-serif] text-[var(--text-primary)]" style={{ fontWeight: 600 }}>
            Tutorials
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {['Getting Started', 'Advanced Features'].map((item, index) => (
            <a
              key={index}
              href="#"
              className="text-sm text-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors font-['Inter',sans-serif]"
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Support Card */}
      <div
        className="p-5 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl"
        style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-[var(--brand)]" />
          <h3 className="font-['Inter',sans-serif] text-[var(--text-primary)]" style={{ fontWeight: 600 }}>
            Support
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {['Discord Community', 'GitHub Issues'].map((item, index) => (
            <a
              key={index}
              href="#"
              className="text-sm text-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors font-['Inter',sans-serif]"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
