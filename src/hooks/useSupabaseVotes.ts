import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint, getUserAgentHash } from '@/utils/deviceFingerprint';
import { voteStorage, VoteRegistry } from '@/utils/voteStorage';
import { collectDeviceInfo } from '@/utils/deviceInfo';

export interface VoteData {
  count: number;
  loved: boolean;
}

export function useSupabaseVotes() {
  const [votes, setVotes] = useState<VoteRegistry>(() => voteStorage.get());
  const [loading, setLoading] = useState(true);
  const fingerprintRef = useRef<string | null>(null);
  const methodRef = useRef<string>('canvas+hardware');

  useEffect(() => {
    const init = async () => {
      const { fingerprint, method } = await getDeviceFingerprint();
      fingerprintRef.current = fingerprint;
      methodRef.current = method;

      try {
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
        console.error('Failed to fetch Supabase votes:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleVote = useCallback(async (itemId: string, itemType = 'app') => {
    if (!fingerprintRef.current) return;

    const current = votes[itemId];
    const newLoved = !(current?.loved);
    const newCount = (current?.count || 0) + (newLoved ? 1 : -1);

    const updated = { ...votes, [itemId]: { count: newCount, loved: newLoved } };
    setVotes(updated);
    voteStorage.set(updated);

    try {
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
            itemType,
            fingerprint: fingerprintRef.current,
            fingerprintMethod: methodRef.current,
            userAgentHash: uaHash,
            deviceInfo,
          }),
        }
      );

      if (!res.ok) {
        setVotes(votes);
        voteStorage.set(votes);
      }
    } catch {
      setVotes(votes);
      voteStorage.set(votes);
    }
  }, [votes]);

  return { votes, loading, toggleVote };
}
