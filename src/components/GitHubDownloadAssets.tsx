import React from 'react';
import { Download } from 'lucide-react';
import type { ReleaseData } from '../hooks/useGitHubRelease';

type ReleaseAsset = ReleaseData['assets'][number];

interface GitHubDownloadAssetsProps {
  assets?: ReleaseAsset[];
  releaseUrl?: string;
  className?: string;
}

export function GitHubDownloadAssets({
  assets = [],
  releaseUrl,
  className = 'mt-4 pt-4 border-t border-[var(--divider)]',
}: GitHubDownloadAssetsProps) {
  if (!assets.length) {
    return null;
  }

  const assetLabelMap: Record<string, string> = {
    apk: 'Android APK',
    aab: 'Android App Bundle',
    exe: 'Windows EXE',
    msi: 'Windows MSI',
    msix: 'Windows MSIX',
    msixbundle: 'Windows MSIX Bundle',
    dmg: 'macOS DMG',
    pkg: 'macOS PKG',
    appimage: 'Linux AppImage',
    flatpakref: 'Flatpak Ref',
    deb: 'Debian Package',
    rpm: 'RPM Package',
    snap: 'Snap Package',
    tar: 'TAR Archive',
    'tar.gz': 'TAR.GZ Archive',
    'tar.xz': 'TAR.XZ Archive',
    gz: 'GZip Archive',
    xz: 'XZ Archive',
    zip: 'ZIP Archive',
    rar: 'RAR Archive',
    '7z': '7z Archive',
    ipa: 'iOS IPA',
    jar: 'Java JAR',
    wasm: 'WebAssembly Binary',
  };

  const getAssetTypeLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.tar.gz')) {
      return assetLabelMap['tar.gz'];
    }
    if (lower.endsWith('.tar.xz')) {
      return assetLabelMap['tar.xz'];
    }
    const ext = lower.split('.').pop() || '';
    return assetLabelMap[ext] || ext.toUpperCase() || 'File';
  };

  const typeCounts = assets.reduce<Record<string, number>>((acc, asset) => {
    const label = getAssetTypeLabel(asset.name);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const summaryText = Object.entries(typeCounts)
    .map(([label, count]) => (count > 1 ? `${label} (${count})` : label))
    .join(', ');

  return (
    <div className={className}>
      {releaseUrl ? (
        <a
          href={releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-[var(--divider)] bg-[var(--bg-surface)] px-4 py-3 transition-all hover:border-[var(--brand)] hover:shadow-sm mt-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--chip-bg)] text-[var(--brand)]">
            <Download className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[var(--text-primary)] font-['Inter',sans-serif]"
              style={{ fontWeight: 600, fontSize: '14px' }}
            >
              View GitHub Release
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-['Inter',sans-serif] truncate">
              Assets: {summaryText || 'Various files'}
            </p>
          </div>
          <span className="text-lg text-[var(--divider)]">&rarr;</span>
        </a>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--divider)] bg-[var(--chip-bg)] px-4 py-3">
          <Download className="w-4 h-4 text-[var(--brand)]" />
          <p className="text-xs text-[var(--text-secondary)] font-['Inter',sans-serif]">
            Assets available: {summaryText || 'Various files'}
          </p>
        </div>
      )}
    </div>
  );
}
