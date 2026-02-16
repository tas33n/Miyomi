import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Plus, Trash2, Users, UserPlus, Loader2 } from 'lucide-react';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { AdminFormField, AdminInput, AdminSelect, AdminButton, StatusBadge, EmptyState } from '@/components/admin/AdminFormElements';

export function AdminUsersPage() {
  const [admins, setAdmins] = useState<Tables<'admins'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', display_name: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data } = await supabase.from('admins').select('*').order('email');
    setAdmins(data || []);
    setLoading(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from('admins').update({ is_active: !active }).eq('id', id);
    fetchData();
  }

  async function handleCreate() {
    setSaving(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('manage-admin', {
        body: { action: 'create', email: form.email, password: form.password, display_name: form.display_name || null, role: form.role },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setModalOpen(false);
      setForm({ email: '', password: '', display_name: '', role: 'admin' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await supabase.functions.invoke('manage-admin', {
        body: { action: 'delete', email: deleteTarget.email },
      });
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleteTarget(null);
    fetchData();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-['Poppins',sans-serif]" style={{ color: 'var(--text-primary)' }}>Admin Users</h1>
        <AdminButton onClick={() => { setError(''); setModalOpen(true); }}>
          <UserPlus className="w-4 h-4" /> Add Admin
        </AdminButton>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
      ) : admins.length === 0 ? (
        <EmptyState icon={Users} title="No admins" description="Add your first admin user" />
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elev-1)' }}>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="border-t transition-colors" style={{ borderColor: 'var(--divider)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elev-1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{admin.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{admin.display_name || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge active={admin.is_active} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActive(admin.id, admin.is_active)}
                          className="px-2.5 py-1.5 text-xs rounded-lg border font-medium transition-colors"
                          style={{ borderColor: 'var(--divider)', color: 'var(--text-secondary)' }}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => setDeleteTarget({ id: admin.id, email: admin.email })}
                          className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Admin User">
        <div className="space-y-4">
          <AdminFormField label="Email" required>
            <AdminInput type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" />
          </AdminFormField>
          <AdminFormField label="Password" required>
            <AdminInput type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 characters" />
          </AdminFormField>
          <AdminFormField label="Display Name">
            <AdminInput value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="John Doe" />
          </AdminFormField>
          <AdminFormField label="Role">
            <AdminSelect value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </AdminSelect>
          </AdminFormField>
          {error && (
            <div className="px-3 py-2.5 rounded-lg text-sm" style={{
              background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
              color: 'var(--destructive)',
            }}>{error}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleCreate} disabled={!form.email || !form.password || saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : 'Create Admin'}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Admin" message={`Remove ${deleteTarget?.email} from admin access? Their auth account will remain but they'll lose admin privileges.`}
        confirmLabel="Remove" />
    </div>
  );
}
