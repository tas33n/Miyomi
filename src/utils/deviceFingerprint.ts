
async function hashSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Miyomi fp', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Miyomi fp', 4, 17);

    return canvas.toDataURL();
  } catch {
    return '';
  }
}

function getHardwareInfo(): string {
  const info = [
    navigator.hardwareConcurrency || 0,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.maxTouchPoints || 0,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform,
  ];
  return info.join('|');
}

export async function getDeviceFingerprint(): Promise<{
  fingerprint: string;
  method: string;
}> {
  // Check for legacy ID from localStorage
  if (typeof window !== 'undefined') {
    const legacyId = localStorage.getItem('miyomi_anon_id');
    if (legacyId) {
      return { fingerprint: legacyId, method: 'legacy_local_storage' };
    }
  }

  const components = [
    getCanvasFingerprint(),
    getHardwareInfo(),
  ];

  const raw = components.join('::');
  const fingerprint = await hashSHA256(raw);

  return { fingerprint, method: 'canvas+hardware' };
}

export async function getUserAgentHash(): Promise<string> {
  return hashSHA256(navigator.userAgent);
}
