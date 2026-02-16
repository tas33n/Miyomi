import { getPlatformIcon, getPlatformAccentClass } from '../utils/platformIcons';

interface PlatformBadgeProps {
  platform: string;
  small?: boolean;
}

export function PlatformBadge({ platform, small = false }: PlatformBadgeProps) {
  const icon = getPlatformIcon(platform, small ? 'sm' : 'md');
  const accentClass = getPlatformAccentClass(platform);

  return (
    <span
      className={`inline-flex items-center justify-center ${small ? 'p-1' : 'p-1.5'} rounded-md bg-[var(--chip-bg)] ${accentClass}`}
      title={platform}
    >
      {icon}
    </span>
  );
}
