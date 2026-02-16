import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLogger } from '@/hooks/useAdminLogger';
import { useAdminCache } from '@/hooks/useAdminCache';
import type { Tables } from '@/integrations/supabase/types';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { AdminFormField, AdminInput, AdminTextarea, AdminSelect, AdminButton, StatusBadge, EmptyState } from '@/components/admin/AdminFormElements';

const emptyGuide = { title: '', description: '', content: '', author: '', category: '', slug: '', status: 'approved', tags: [] as string[] };

export function AdminGuidesPage() {
  const { logAction } = useAdminLogger();
  const { data: guides, loading, invalidateCache } = useAdminCache<Tables<'guides'>>({ table: 'guides', orderBy: 'title' });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyGuide);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);



  const filtered = useMemo(() =>
    guides.filter(g => g.title.toLowerCase().includes(search.toLowerCase())),
    [guides, search]
  );

  function openCreate() { setForm(emptyGuide); setEditingId(null); setModalOpen(true); }

  function openEdit(g: Tables<'guides'>) {
    setForm({
      title: g.title, description: g.description || '', content: g.content || '',
      author: g.author || '', category: g.category || '', slug: g.slug || '',
      status: g.status, tags: g.tags || [],
    });
    setEditingId(g.id);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      title: form.title, description: form.description || null, content: form.content || null,
      author: form.author || null, category: form.category || null,
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      status: form.status, tags: form.tags.length ? form.tags : null,
    };

    if (editingId) {
      await supabase.from('guides').update(payload).eq('id', editingId);

      // Log update action
      await logAction('update', 'guide', editingId, form.title).catch(err => {
        console.error('Failed to log update action:', err);
      });
    } else {
      const { data } = await supabase.from('guides').insert(payload).select().single();

      // Log create action
      if (data) {
        await logAction('create', 'guide', data.id, form.title).catch(err => {
          console.error('Failed to log create action:', err);
        });
      }
    }
    setSaving(false); setModalOpen(false); invalidateCache();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await supabase.from('guides').delete().eq('id', deleteTarget.id);

    // Log delete action
    await logAction('delete', 'guide', deleteTarget.id, deleteTarget.name).catch(err => {
      console.error('Failed to log delete action:', err);
    });

    setDeleteTarget(null); invalidateCache();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-['Poppins',sans-serif]" style={{ color: 'var(--text-primary)' }}>Guides</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Search guides…" />
          <AdminButton onClick={openCreate}><Plus className="w-4 h-4" /> Add</AdminButton>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No guides found" description={search ? 'Try a different search term' : 'Create your first guide'} />
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elev-1)' }}>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider w-12" style={{ color: 'var(--text-secondary)' }}>#</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => (
                  <tr key={g.id} className="border-t transition-colors" style={{ borderColor: 'var(--divider)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elev-1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-secondary)] text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{g.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{g.category || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={g.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(g)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget({ id: g.id, name: g.title })} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Guide' : 'Add Guide'} maxWidth="600px">
        <div className="space-y-4">
          <AdminFormField label="Title" required>
            <AdminInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Guide title" />
          </AdminFormField>
          <AdminFormField label="Slug">
            <AdminInput value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated from title" />
          </AdminFormField>
          <AdminFormField label="Description">
            <AdminTextarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief summary" />
          </AdminFormField>
          <AdminFormField label="Content (Markdown)">
            <AdminTextarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="# Guide content in markdown…" style={{ minHeight: '200px' }} />
          </AdminFormField>
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="Author">
              <AdminInput value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
            </AdminFormField>
            <AdminFormField label="Category">
              <AdminInput value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </AdminFormField>
          </div>
          <AdminFormField label="Status">
            <AdminSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </AdminSelect>
          </AdminFormField>
          <AdminFormField label="Tags (comma-separated)">
            <AdminInput value={form.tags.join(', ')} onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
          </AdminFormField>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={!form.title || saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Guide" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
