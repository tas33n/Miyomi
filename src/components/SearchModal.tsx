import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--divider)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--divider)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Global Search
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--chip-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <form onSubmit={handleSearch} className="p-6">
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-page)] border-2 border-[var(--divider)] focus-within:border-[var(--brand)] rounded-xl transition-all">
                  <Search className="w-5 h-5 text-[var(--text-secondary)]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search apps, extensions, or guides..."
                    className="flex-1 bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>

                {/* Hints */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">Try:</span>
                  {['anime', 'manga', 'extensions', 'mihon', 'aniyomi'].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setQuery(hint)}
                      className="px-3 py-1 text-sm bg-[var(--chip-bg)] hover:bg-[var(--brand)] text-[var(--text-secondary)] hover:text-white rounded-lg transition-all"
                    >
                      {hint}
                    </button>
                  ))}
                </div>

                {/* Keyboard hint */}
                <div className="mt-6 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>Press Enter to search</span>
                  <span>Press Esc to close</span>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
