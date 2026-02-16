import { TelegramSettingsForm } from '@/components/admin/TelegramSettingsForm';
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm';
import { useAdmin } from '@/hooks/useAdmin';

export function AdminSettingsPage() {
  const { isSuperAdmin } = useAdmin();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold font-['Poppins',sans-serif]" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      {/* Password Change - All admins */}
      <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}>
        <ChangePasswordForm />
      </div>

      {/* Telegram Settings - Superadmin only */}
      {isSuperAdmin && (
        <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}>
          <TelegramSettingsForm />
        </div>
      )}
    </div>
  );
}
