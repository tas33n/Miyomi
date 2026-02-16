import { useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { UAParser } from 'ua-parser-js';
import { supabase } from '@/integrations/supabase/client';

export function useSessionTracker() {
    const trackSession = useCallback(async (sessionType: 'login' | 'logout') => {
        try {
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            const fingerprint = result.visitorId;

            const parser = new UAParser();
            const ua = parser.getResult();

            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const { ip } = await ipResponse.json();

            let country = null;
            let city = null;
            try {
                const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
                const geo = await geoResponse.json();
                if (geo.status === 'success') {
                    country = geo.country;
                    city = geo.city;
                }
            } catch {
                // Geolocation optional, ignore errors
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: admin } = await supabase
                .from('admins')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!admin) return;

            await supabase.from('admin_sessions').insert({
                admin_id: admin.id,
                session_type: sessionType,
                ip_address: ip,
                user_agent: navigator.userAgent,
                browser: ua.browser.name || null,
                browser_version: ua.browser.version || null,
                os: ua.os.name || null,
                os_version: ua.os.version || null,
                device_type: ua.device.type || 'desktop',
                device_vendor: ua.device.vendor || null,
                device_model: ua.device.model || null,
                device_fingerprint: fingerprint,
                country,
                city,
            });
        } catch (error) {
            console.error('Session tracking error:', error);
            // Don't throw - session tracking should not interrupt login/logout flow
        }
    }, []); // Stable reference - no dependencies needed

    return { trackSession };
}
