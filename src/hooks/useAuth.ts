import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionTracker } from './useSessionTracker';
import type { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { trackSession } = useSessionTracker();
  // Use a ref so the effect doesn't depend on trackSession
  const trackSessionRef = useRef(trackSession);
  trackSessionRef.current = trackSession;
  // Track if this is the initial session restore (not a fresh login)
  const isInitialLoad = useRef(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Track login ONLY if it's a fresh login (email or oauth)
      // We use a localStorage flag 'auth_start' to know if we just started a login flow
      if (event === 'SIGNED_IN' && session) {
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        }

        const isAuthStart = localStorage.getItem('auth_start');
        if (isAuthStart) {
          localStorage.removeItem('auth_start');
          trackSessionRef.current('login').catch(err => {
            console.error('Failed to track login session:', err);
          });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []); // No dependencies - subscription is set up once and never re-created

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Track explicit email login
    await trackSessionRef.current('login').catch(console.error);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Set flag to track login after redirect
    localStorage.setItem('auth_start', 'true');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/dashboard`,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error);
      localStorage.removeItem('auth_start'); // Clean up on error
    }
  }, []);

  const signOut = useCallback(async () => {
    // Track logout before signing out
    await trackSessionRef.current('logout').catch(err => {
      console.error('Failed to track logout session:', err);
    });

    await supabase.auth.signOut();
  }, []); // No dependency on trackSession - uses ref

  return { session, user, loading, signInWithEmail, signInWithGoogle, signOut };
}
