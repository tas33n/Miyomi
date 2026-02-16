import { useDataCache } from './useDataCache';
import { supabase } from '@/integrations/supabase/client';
import type { ExtensionData } from '../types/data';

export function useExtensions(): { extensions: ExtensionData[]; loading: boolean } {
    const fetchExtensions = async (): Promise<ExtensionData[]> => {
        const { data, error } = await supabase
            .from('extensions')
            .select('*')
            .order('name');

        if (error) throw error;

        return (data || []).map((ext: any) => ({
            id: ext.id,
            slug: ext.slug,
            name: ext.name,
            info: ext.info || '',
            logoUrl: ext.icon_url,
            types: ext.types || [],
            region: ext.region || 'Global',
            accentColor: ext.accent_color,
            autoUrl: ext.auto_url,
            manualUrl: ext.manual_url,
            supportedApps: (ext.compatible_with || []).map((app: string) => app.toLowerCase()),
            lastUpdated: ext.last_updated || ext.updated_at,
            overview: ext.info,
            github: ext.repo_url,
            website: ext.website_url,
            keywords: [],
            tutorials: [],
            rating: 0,
            downloadCount: 0
        }));
    };

    const { data: extensions, loading } = useDataCache<ExtensionData[]>(
        'extensions_list_v1',
        fetchExtensions,
        { ttl: 1000 * 60 * 10 } // 10 minutes fresh
    );

    return { extensions: extensions || [], loading };
}
