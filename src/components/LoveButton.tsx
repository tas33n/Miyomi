import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAnonymousId } from '../hooks/useAnonymousId';
import { voteStorage } from '../utils/voteStorage';
import { features } from '../config/features';
import { getDeviceFingerprint, getUserAgentHash } from '../utils/deviceFingerprint';
import { collectDeviceInfo } from '../utils/deviceInfo';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

interface LoveButtonProps {
    itemId: string;
    initialCount?: number;
    className?: string;
    preloadedState?: { count: number; loved: boolean };
    allowFetch?: boolean;
    size?: 'default' | 'lg';
}

export function LoveButton({
    itemId,
    initialCount = 0,
    className = '',
    preloadedState,
    allowFetch = true,
    size = 'default'
}: LoveButtonProps) {
    const userId = useAnonymousId();
    const cached = preloadedState ? undefined : voteStorage.getItem(itemId);


    const [count, setCount] = useState(preloadedState?.count ?? cached?.count ?? initialCount);
    const [loved, setLoved] = useState(preloadedState?.loved ?? cached?.loved ?? false);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(!!preloadedState || !!cached);

    useEffect(() => {
        if (preloadedState) {
            setCount(preloadedState.count);
            setLoved(preloadedState.loved);
            setHasFetched(true);
        }
    }, [preloadedState]);

    useEffect(() => {
        if (!userId || preloadedState || !allowFetch) return;

        const fetchVoteStatus = async () => {
            if (features.newVoting) {
                try {
                    const { supabase } = await import('@/integrations/supabase/client');
                    const { fingerprint } = await getDeviceFingerprint();

                    const { count: totalCount, error: countError } = await supabase
                        .from('likes')
                        .select('id', { count: 'exact', head: true })
                        .eq('item_id', itemId);

                    if (countError) throw countError;

                    const { data: userVote, error: userVoteError } = await supabase
                        .from('likes')
                        .select('id')
                        .eq('item_id', itemId)
                        .eq('device_fingerprint', fingerprint)
                        .maybeSingle();

                    if (userVoteError) throw userVoteError;

                    setCount(totalCount || 0);
                    setLoved(!!userVote);
                    setHasFetched(true);

                    voteStorage.updateItem(itemId, { count: totalCount || 0, loved: !!userVote });
                } catch (err) {
                    console.error('Error fetching vote status from Supabase:', err);
                }
            } else {
                fetch(`/api/vote?itemId=${itemId}&userId=${userId}`)
                    .then(res => res.json())
                    .then(data => {
                        setCount(data.count);
                        setLoved(data.loved);
                        setHasFetched(true);
                        voteStorage.updateItem(itemId, { count: data.count, loved: data.loved });
                    })
                    .catch(console.error);
            }
        };

        fetchVoteStatus();
    }, [itemId, userId, preloadedState, allowFetch]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading) return;

        const newLovedState = !loved;
        setLoved(newLovedState);
        setCount(prev => newLovedState ? prev + 1 : prev - 1);
        voteStorage.updateItem(itemId, { count: count + (newLovedState ? 1 : -1), loved: newLovedState });
        setLoading(true);

        try {
            if (features.newVoting) {
                const { fingerprint, method } = await getDeviceFingerprint();
                const uaHash = await getUserAgentHash();
                const deviceInfo = collectDeviceInfo();
                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vote`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                        },
                        body: JSON.stringify({
                            itemId,
                            itemType: 'app',
                            fingerprint,
                            fingerprintMethod: method,
                            userAgentHash: uaHash,
                            deviceInfo
                        }),
                    }
                );
                if (!res.ok) throw new Error('Failed to vote');
                const data = await res.json();
                if (data.loved !== newLovedState) setLoved(data.loved);
            } else {
                if (!userId) return;
                const res = await fetch(`/api/vote?itemId=${itemId}&userId=${userId}`, { method: 'POST' });
                if (!res.ok) throw new Error('Failed to vote');
                const data = await res.json();
                if (data.loved !== newLovedState) setLoved(data.loved);
            }
        } catch (err) {
            setLoved(!newLovedState);
            setCount(prev => !newLovedState ? prev + 1 : prev - 1);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isLarge = size === 'lg';

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <button
                onClick={handleToggle}
                className={cn(
                    "group flex items-center gap-1.5 rounded-full transition-all",
                    isLarge ? "px-3 py-1.5" : "px-2 py-1",
                    loved
                        ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30'
                        : 'hover:bg-[var(--chip-bg)] text-[var(--text-secondary)] hover:text-rose-500'
                )}
                title={loved ? "Unlove this" : "Love this"}
                aria-pressed={loved}
            >
                <Heart
                    className={cn(
                        "transition-transform",
                        isLarge ? "w-5 h-5" : "w-4 h-4",
                        loved ? 'fill-current scale-110' : 'group-hover:scale-110',
                        loading ? 'opacity-70' : ''
                    )}
                />
                <span className={cn(
                    "font-['Inter',sans-serif] font-medium tabular-nums",
                    isLarge ? "text-sm" : "text-xs",
                    !hasFetched ? 'opacity-50' : ''
                )}>
                    {count}
                </span>
            </button>

            {/* <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help opacity-40 hover:opacity-100 transition-opacity">
                            <Info className="w-3 h-3 text-[var(--text-secondary)]" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs bg-[var(--popover)] text-[var(--text-primary)] border border-[var(--divider)]">
                        <p>
                            "Love" votes are anonymous. A unique key is stored in your browser to remember your choice.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider> */}
        </div>
    );
}