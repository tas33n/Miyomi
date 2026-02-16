import { Mail } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface FeedbackTriggerProps {
  onToggle: () => void;
  isOpen: boolean;
  title: string;
}

export function FeedbackTrigger({ onToggle, isOpen, title }: FeedbackTriggerProps) {
  const [showText, setShowText] = useState(false);
  const [hasGlow, setHasGlow] = useState(false);

  useEffect(() => {
    // After 1.5 seconds, show text with glow
    const showTimer = setTimeout(() => {
      setShowText(true);
      setHasGlow(true);
    }, 1500);

    // After 5 seconds total, hide text and glow
    const hideTimer = setTimeout(() => {
      setShowText(false);
      setHasGlow(false);
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <button
      onClick={onToggle}
      className={`group relative flex items-center rounded-full transition-all duration-300 ${
        showText ? 'gap-2 pl-2 pr-3 py-2' : 'p-2'
      } ${
        isOpen && showText
          ? 'bg-[var(--brand)] text-white shadow-lg'
          : 'text-[var(--text-secondary)]'
      }`}
      aria-label={`Send feedback or feature request for ${title} page`}
      title="Send Feedback / Feature Request"
    >
      {/* Glow effect when text is showing */}
      {hasGlow && (
        <div className="absolute inset-0 rounded-full bg-[var(--brand)] opacity-40 blur-xl animate-pulse -z-10"></div>
      )}

      {/* Icon with circular background */}
      <div className={`relative p-2 rounded-full transition-all duration-200 ${
        isOpen 
          ? 'bg-[var(--brand)] shadow-md' 
          : 'bg-[var(--chip-bg)] group-hover:bg-[var(--brand)] group-hover:shadow-md'
      }`}>
        <Mail className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all duration-200 ${
          isOpen 
            ? 'text-white scale-110' 
            : 'text-[var(--text-secondary)] group-hover:text-white group-hover:scale-110'
        }`} />
      </div>
      
      {/* Text that expands and collapses */}
      <span 
        className={`text-xs sm:text-sm font-['Inter',sans-serif] whitespace-nowrap transition-all duration-500 overflow-hidden ${
          showText ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
        } ${
          isOpen ? 'text-white' : 'text-[var(--text-primary)]'
        }`}
        style={{ fontWeight: 600 }}
      >
        Send Feedback
      </span>
    </button>
  );
}