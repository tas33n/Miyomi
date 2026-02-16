import { useDataCache } from './useDataCache';
import { supabase } from '@/integrations/supabase/client';
import type { AppData } from '../types/data';

export function useAppMeta(): { apps: AppData[]; loading: boolean } {
    const fetchApps = async (): Promise<AppData[]> => {
        const { data, error } = await supabase
            .from('apps')
            .select('*')
            .eq('status', 'approved');

        if (error) throw error;

        return (data || []).map((app: any) => ({
            id: app.slug || app.id,
            name: app.name,
            shortDescription: app.short_description || app.metadata?.shortDescription,
            description: app.description || '',
            contentTypes: app.content_types || [],
            platforms: app.platforms || [],
            iconColor: app.accent_color,
            accentColor: app.accent_color,
            logoUrl: app.icon_url,
            author: app.author,
            keywords: app.tags || [],
            supportedExtensions: app.supported_extensions || [],
            lastUpdated: app.last_release_date || app.updated_at || app.created_at,
            githubUrl: app.repo_url,
            officialSite: app.website_url,
            discordUrl: app.discord_url,
            tutorials: app.tutorials || [],
            forkOf: app.fork_of,
            upstreamUrl: app.upstream_url,
            status: app.status,
            downloads: app.download_count || undefined,
            likes: app.likes_count || undefined,
            rating: app.metadata?.rating || undefined,
        }));
    };

    const { data: apps, loading } = useDataCache<AppData[]>(
        'apps_list_meta',
        fetchApps,
        { ttl: 1000 * 60 * 5 } // 5 minutes fresh
    );

    return { apps: apps || [], loading };
}
