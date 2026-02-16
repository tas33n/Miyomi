import { supabase } from '@/integrations/supabase/client';

export function useAdminLogger() {
    const logAction = async (
        action: 'create' | 'update' | 'delete' | 'approve' | 'reject',
        resourceType: 'app' | 'extension' | 'guide' | 'faq' | 'submission',
        resourceId: string | null,
        resourceName: string,
        details?: Record<string, any>
    ) => {
        try {
            // Get current admin ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: admin } = await supabase
                .from('admins')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!admin) return;

            // Insert log record
            await supabase.from('admin_logs').insert({
                admin_id: admin.id,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                resource_name: resourceName,
                details: details || null,
            });
        } catch (error) {
            console.error('Admin logging error:', error);
            // Don't throw - logging should not interrupt user actions
        }
    };

    return { logAction };
}
