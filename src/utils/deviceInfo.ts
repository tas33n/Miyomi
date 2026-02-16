

export interface DeviceInfo {
    anonymous_id: string;
    browser: string;
    browser_version: string;
    os: string;
    os_version: string;
    device_type: 'mobile' | 'tablet' | 'desktop';
    device_vendor: string | null;
    device_model: string | null;
    user_agent: string;
    screen_resolution: string;
    timezone: string;
    language: string;
    referrer: string;
}


function getAnonymousId(): string {
    const key = 'miyomi_anonymous_id';
    let id = localStorage.getItem(key);

    if (!id) {

        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        localStorage.setItem(key, id);
    }

    return id;
}


function parseBrowser(ua: string): { name: string; version: string } {

    if (ua.includes('Edg/')) {
        const match = ua.match(/Edg\/([\d.]+)/);
        return { name: 'Edge', version: match?.[1] || 'unknown' };
    }

    if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
        const match = ua.match(/Chrome\/([\d.]+)/);
        return { name: 'Chrome', version: match?.[1] || 'unknown' };
    }

    if (ua.includes('Firefox/')) {
        const match = ua.match(/Firefox\/([\d.]+)/);
        return { name: 'Firefox', version: match?.[1] || 'unknown' };
    }

    if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        const match = ua.match(/Version\/([\d.]+)/);
        return { name: 'Safari', version: match?.[1] || 'unknown' };
    }

    if (ua.includes('OPR/')) {
        const match = ua.match(/OPR\/([\d.]+)/);
        return { name: 'Opera', version: match?.[1] || 'unknown' };
    }

    return { name: 'Unknown', version: 'unknown' };
}


function parseOS(ua: string): { name: string; version: string } {

    if (ua.includes('Windows NT')) {
        const match = ua.match(/Windows NT ([\d.]+)/);
        const version = match?.[1] || 'unknown';
        return { name: 'Windows', version };
    }

    if (ua.includes('Mac OS X')) {
        const match = ua.match(/Mac OS X ([\d_]+)/);
        const version = match?.[1]?.replace(/_/g, '.') || 'unknown';
        return { name: 'macOS', version };
    }

    if (ua.includes('iPhone') || ua.includes('iPad')) {
        const match = ua.match(/OS ([\d_]+)/);
        const version = match?.[1]?.replace(/_/g, '.') || 'unknown';
        return { name: 'iOS', version };
    }

    if (ua.includes('Android')) {
        const match = ua.match(/Android ([\d.]+)/);
        return { name: 'Android', version: match?.[1] || 'unknown' };
    }

    if (ua.includes('Linux')) {
        return { name: 'Linux', version: 'unknown' };
    }

    return { name: 'Unknown', version: 'unknown' };
}


function getDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}


function parseDevice(ua: string): { vendor: string | null; model: string | null } {

    if (ua.includes('iPhone')) {
        return { vendor: 'Apple', model: 'iPhone' };
    }

    if (ua.includes('iPad')) {
        return { vendor: 'Apple', model: 'iPad' };
    }

    if (ua.includes('Macintosh')) {
        return { vendor: 'Apple', model: 'Mac' };
    }

    if (ua.includes('SM-')) {
        const match = ua.match(/SM-[A-Z0-9]+/);
        return { vendor: 'Samsung', model: match?.[0] || 'Unknown' };
    }

    if (ua.includes('Android')) {
        return { vendor: 'Android', model: null };
    }

    return { vendor: null, model: null };
}


export function collectDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const browser = parseBrowser(ua);
    const os = parseOS(ua);
    const device = parseDevice(ua);

    return {
        anonymous_id: getAnonymousId(),
        browser: browser.name,
        browser_version: browser.version,
        os: os.name,
        os_version: os.version,
        device_type: getDeviceType(ua),
        device_vendor: device.vendor,
        device_model: device.model,
        user_agent: ua,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer || '',
    };
}
