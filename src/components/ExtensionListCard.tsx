import React, { useState } from 'react';
import { Download, Github, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import type { ExtensionData } from '../types/data';
import { FlagDisplay } from './FlagDisplay';
import { StarRating } from './StarRating';
import { useAccentColor } from '../hooks/useAccentColor';
import { LoveButton } from './LoveButton';

interface ExtensionListCardProps {
  extension: ExtensionData;
  voteData?: { count: number; loved: boolean };
  allowFetch?: boolean;
  isHighlighted?: boolean;
  onSelect: (extensionId: string) => void;
}

export function ExtensionListCard({ extension, voteData, allowFetch = true, isHighlighted, onSelect }: ExtensionListCardProps) {
  const handleSelect = () => onSelect(extension.slug || extension.id);
  const accentColor = useAccentColor({
    logoUrl: extension.logoUrl,
    preferredColor: extension.accentColor,
    defaultColor: 'var(--brand)',
  });
  const [imageError, setImageError] = useState(false);

  // Only use layoutId on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const renderLogo = () => {
    const showFallback = imageError || !extension.logoUrl?.trim();

    if (showFallback) {
      return (
        <div
          className="w-full h-full flex items-center justify-center text-white"
          style={{ backgroundColor: accentColor, fontWeight: 600, fontSize: '20px' }}
        >
          {extension.name.charAt(0)}
        </div>
      );
    }

    return (
      <img
        src={extension.logoUrl}
        alt={`${extension.name} logo`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <motion.div
      onClick={handleSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={`group bg-[var(--bg-surface)] border border-[var(--divider)] border-l-4 rounded-2xl p-3 sm:p-5 transition-all hover:shadow-lg hover:border-[var(--brand)] cursor-pointer ${isHighlighted
          ? 'ring-2 ring-[var(--brand)] shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_0_4px_rgba(var(--brand-rgb),0.2)]'
          : 'shadow-[0_4px_16px_0_rgba(0,0,0,0.06)]'
        }`}
      style={{ borderLeftColor: accentColor }}
    >
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[var(--chip-bg)]">
            {renderLogo()}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-['Inter',sans-serif] text-[var(--text-primary)] mb-2"
              style={{ fontWeight: 600, fontSize: '16px' }}
            >
              {extension.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <FlagDisplay region={extension.region} size="small" />
              <span>|</span>
              <span
                className="font-['Inter',sans-serif] tracking-wide text-[11px]"
                style={{ fontWeight: 600 }}
              >
                {extension.types.join(' + ')}
              </span>
            </div>
            {extension.info && (
              <p className="mt-3 text-sm text-[var(--text-secondary)] font-['Inter',sans-serif] line-clamp-2">
                {extension.info}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3">
          <LoveButton itemId={extension.id} preloadedState={voteData} allowFetch={allowFetch} />

          <button
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
            className="px-4 py-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--chip-bg)] text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white transition-all font-['Inter',sans-serif]"
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            <Download className="w-4 h-4" />
            View
          </button>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex lg:hidden items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-[var(--chip-bg)]">
          {renderLogo()}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-['Inter',sans-serif] text-[var(--text-primary)] truncate mb-1"
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            {extension.name}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <FlagDisplay region={extension.region} size="small" />
            <span>|</span>
            <span>{extension.types.join(' + ')}</span>
          </div>
        </div>

        {/* View Button & Love Button - Right Side */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
            className="w-8 h-8 rounded-lg bg-[var(--chip-bg)] group-hover:bg-[var(--brand)] flex items-center justify-center transition-all"
            aria-label="View extension details"
          >
            <ExternalLink className="w-4 h-4 text-[var(--text-primary)] group-hover:text-white transition-colors" />
          </button>
          <div className="w-8 h-8 flex items-center justify-center">
            <LoveButton itemId={extension.id} preloadedState={voteData} allowFetch={allowFetch} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
