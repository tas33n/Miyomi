interface UseAccentColorOptions {
  logoUrl?: string; // Kept for compatibility but unused
  preferredColor?: string;
  defaultColor?: string;
}

/**
 * Returns the preferred color if provided, otherwise the default color.
 * No longer extracts colors from images for performance reasons.
 */
export function useAccentColor({
  preferredColor,
  defaultColor = 'var(--brand)',
}: UseAccentColorOptions): string {
  return preferredColor || defaultColor;
}
