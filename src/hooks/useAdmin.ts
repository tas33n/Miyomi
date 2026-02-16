import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AdminRole = 'super_admin' | 'admin' | null;

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    // Track if component is still mounted to prevent state updates after unmount
    let isMounted = true;

    // Only run check when user ID changes, not when user object reference changes
    async function checkRole() {
      if (!isMounted) return;
      setLoading(true);

      try {
        // Check user_roles table via RPC
        const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'super_admin',
        });

        // Ignore aborted requests
        if (superAdminError?.message?.includes('aborted')) return;

        if (!isMounted) return; // Check again after async operation

        if (isSuperAdmin) {
          setRole('super_admin');
          setLoading(false);
          return;
        }

        const { data: isAdmin, error: adminError } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        // Ignore aborted requests
        if (adminError?.message?.includes('aborted')) return;

        if (!isMounted) return; // Check again after async operation

        setRole(isAdmin ? 'admin' : null);
      } catch (error: any) {
        // Silently ignore abort errors to prevent console spam
        if (error?.message?.includes('aborted') || error?.name === 'AbortError') {
          return;
        }
        console.error('Error checking admin role:', error);
        if (isMounted) {
          setRole(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkRole();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [user?.id, authLoading]); // CRITICAL FIX: Only depend on user.id, not entire user object

  return {
    role,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
    loading: authLoading || loading,
  };
}
