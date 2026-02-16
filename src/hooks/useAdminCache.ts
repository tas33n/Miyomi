import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Global cache store
const cache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheOptions {
    table: 'apps' | 'extensions' | 'guides' | 'faqs' | 'likes';
    orderBy?: string;
    forceRefresh?: boolean;
}

/**
 * Admin data caching hook - provides instant data loading from cache
 * and automatic cache invalidation on mutations
 */
export function useAdminCache<T extends Tables<any>>(options: CacheOptions) {
    const { table, orderBy = 'name', forceRefresh = false } = options;
    const cacheKey = `${table}:${orderBy}`;

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (skipCache = false) => {
        // Check cache first unless skipCache is true
        if (!skipCache && !forceRefresh) {
            const cached = cache.get(cacheKey);
            const now = Date.now();

            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
                // Cache hit! Return immediately
                setData(cached.data);
                setLoading(false);
                return cached.data;
            }
        }

        // Cache miss or expired - fetch from Supabase
        setLoading(true);
        const { data: freshData, error } = await supabase
            .from(table)
            .select('*')
            .order(orderBy);

        if (!error && freshData) {
            // Update cache
            cache.set(cacheKey, { data: freshData, timestamp: Date.now() });
            setData(freshData as T[]);
        }

        setLoading(false);
        return freshData || [];
    }, [table, orderBy, cacheKey, forceRefresh]);

    // Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Invalidate cache for this table (call after create/update/delete)
    const invalidateCache = useCallback(() => {
        cache.delete(cacheKey);
        return fetchData(true); // Force refetch
    }, [cacheKey, fetchData]);

    // Optimistic update - update cache immediately without refetch
    const updateCacheOptimistically = useCallback((updater: (current: T[]) => T[]) => {
        setData(updater);
        const cached = cache.get(cacheKey);
        if (cached) {
            cache.set(cacheKey, { data: updater(cached.data), timestamp: cached.timestamp });
        }
    }, [cacheKey]);

    return {
        data,
        loading,
        refetch: fetchData,
        invalidateCache,
        updateCacheOptimistically,
    };
}

// Global cache invalidation for all tables (use when bulk changes happen)
export function invalidateAllAdminCaches() {
    cache.clear();
}

// Invalidate specific table cache from anywhere
export function invalidateTableCache(table: string) {
    for (const key of cache.keys()) {
        if (key.startsWith(`${table}:`)) {
            cache.delete(key);
        }
    }
}
