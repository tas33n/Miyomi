import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ExtensionData } from '../types/data';

export function useExtension(extensionId: string): { extension: ExtensionData | null; loading: boolean } {
    const [extension, setExtension] = useState<ExtensionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!extensionId) {
            setLoading(false);
            return;
        }

        async function fetchExtension() {
            setLoading(true);
            try {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(extensionId);

                let query = (supabase.from('extensions').select('*') as any).eq('status', 'approved');
                if (isUuid) {
                    query = query.eq('id', extensionId);
                } else {
                    query = query.eq('slug', extensionId);
                }

                const { data, error } = await query.maybeSingle();

                if (error) throw error;
                if (data) {
                    setExtension({
                        id: data.id,
                        slug: data.slug || undefined,
                        name: data.name,
                        info: data.short_description || data.description || '', // Prefer short_description for info (legacy)
                        shortDescription: data.short_description, // Map short_description
                        logoUrl: data.icon_url,
                        types: data.types || data.tags || [],
                        region: data.region || 'Global',
                        accentColor: data.accent_color || data.icon_color,
                        autoUrl: data.auto_url || '',
                        manualUrl: data.manual_url || '',
                        supportedApps: data.compatible_with || [],
                        lastUpdated: data.updated_at || data.created_at,
                        overview: data.description || data.info, // Map description to overview
                        github: data.repo_url,
                        website: data.website_url,
                        keywords: data.tags || [],
                        tutorials: [],
                        rating: 0,
                        downloadCount: data.download_count || 0,
                        likes: data.likes_count || 0
                    });
                } else {
                    setExtension(null);
                }
            } catch (err) {
                console.error('Failed to fetch extension:', err);
                setExtension(null);
            } finally {
                setLoading(false);
            }
        }
        fetchExtension();
    }, [extensionId]);

    return { extension, loading };
}
