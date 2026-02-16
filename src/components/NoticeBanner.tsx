import { useState, useEffect } from 'react';
import { X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotices } from '@/hooks/useNotices';
import { motion, AnimatePresence } from 'motion/react';

const typeConfig: Record<string, { icon: typeof Info; bg: string; border: string; text: string }> = {
  info: { icon: Info, bg: 'bg-[var(--bg-elev-1)]', border: 'border-[var(--brand)]', text: 'text-[var(--text-primary)]' },
  warning: { icon: AlertTriangle, bg: 'bg-[var(--warning-bg)]', border: 'border-[var(--warning-border)]', text: 'text-[var(--warning-text)]' },
  error: { icon: AlertCircle, bg: 'bg-[var(--destructive)]/10', border: 'border-[var(--destructive)]', text: 'text-[var(--destructive)]' },
};

export function NoticeBanner() {
  const { notices } = useNotices();
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('miyomi-dismissed-notices');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem('miyomi-dismissed-notices', JSON.stringify([...dismissed]));
  }, [dismissed]);

  const visibleNotices = notices.filter(n => !dismissed.has(n.id));
  if (visibleNotices.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {visibleNotices.map(notice => {
          const config = typeConfig[notice.type] || typeConfig.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${config.text}`}>{notice.title}</p>
                <p className={`text-sm opacity-80 ${config.text}`}>{notice.message}</p>
              </div>
              {notice.dismissible && (
                <button onClick={() => setDismissed(prev => new Set([...prev, notice.id]))} className={`flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${config.text}`}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
