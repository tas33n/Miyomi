import { TagBadge } from './TagBadge';
import { Button } from './Button';
import { PlatformBadge } from './PlatformBadge';
import { Download, Package, Info } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { useAccentColor } from '../hooks/useAccentColor';

interface AppCardProps {
  name: string;
  description: string;
  tags: Array<'Manga' | 'Anime' | 'Light Novel' | 'Multi'>;
  platforms: Array<'Windows' | 'Mac' | 'Android' | 'iOS' | 'Linux' | 'Web'>;
  iconColor?: string;
  logoUrl?: string;
  onDownload?: () => void;
  onExtensions?: () => void;
  onDetails?: () => void;
}

export function AppCard({
  name,
  description,
  tags,
  platforms,
  iconColor,
  logoUrl,
  onDownload,
  onExtensions,
  onDetails,
}: AppCardProps) {
  const accentColor = useAccentColor({ logoUrl, preferredColor: iconColor });

  return (
    <div
      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl transition-all hover:shadow-lg group"
      style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)', minHeight: '120px' }}
    >
      {/* App Icon */}
      <div className="flex-shrink-0">
        <AppLogo
          name={name}
          logoUrl={logoUrl}
          iconColor={accentColor}
          className="w-14 h-14"
          roundedClass="rounded-xl"
          textClassName="text-2xl"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-['Inter',sans-serif] text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '16px' }}>
            {name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((tag, index) => (
              <TagBadge key={index} tag={tag} />
            ))}
          </div>
        </div>
        <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-2" style={{ fontSize: '14px' }}>
          {description}
        </p>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {platforms.map((platform, index) => (
            <PlatformBadge key={index} platform={platform} small />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0 w-full md:w-auto">
        <Button variant="primary" onClick={onDownload}>
          <span className="hidden sm:inline">Download</span>
          <Download className="w-4 h-4 sm:hidden" />
        </Button>
        <Button variant="secondary" onClick={onExtensions}>
          <span className="hidden sm:inline">Extensions</span>
          <Package className="w-4 h-4 sm:hidden" />
        </Button>
        <Button variant="ghost" onClick={onDetails}>
          <span className="hidden sm:inline">Details</span>
          <Info className="w-4 h-4 sm:hidden" />
        </Button>
      </div>
    </div>
  );
}
