import { useMemo } from 'react';
import { useThemeEngineContext } from './useThemeEngine';

/**
 * Returns the appropriate asset (logo, avatar) based on the active theme.
 * Falls back to the defaultAsset if no theme is active or the asset key isn't defined.
 */
export function useSeasonalAsset(
    assetKey: 'logo' | 'homeAvatar',
    defaultAsset: string
): string {
    let themeAssets: { logo?: string; homeAvatar?: string } | null = null;
    let hasContext = true;

    try {
        const ctx = useThemeEngineContext();
        themeAssets = ctx.themeAssets;
    } catch {
        // Not inside ThemeEngineContext — use default
        hasContext = false;
    }

    return useMemo(() => {
        if (hasContext && themeAssets && themeAssets[assetKey]) {
            return themeAssets[assetKey]!;
        }
        return defaultAsset;
    }, [hasContext, themeAssets, assetKey, defaultAsset]);
}