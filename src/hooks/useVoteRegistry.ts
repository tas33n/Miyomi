import { useState, useEffect } from 'react';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';
import { voteStorage, VoteRegistry } from '../utils/voteStorage';

export interface VoteData {
    count: number;
    loved: boolean;
}

/**
 * Legacy support for fetching the entire vote/like registry.
 * This now uses the Supabase Edge Function instead of the old /api/vote.
 */
export function useVoteRegistry() {
    const [votes, setVotes] = useState<VoteRegistry>(() => voteStorage.get());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllVotes = async () => {
            try {
                const { fingerprint } = await getDeviceFingerprint();

                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote?fingerprint=${fingerprint}`,
                    {
                        headers: {
                            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                        },
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setVotes(data);
                    voteStorage.set(data);
                }
            } catch (error) {
                console.error('Failed to fetch vote registry from edge function', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllVotes();
    }, []);

    return { votes, loading };
}