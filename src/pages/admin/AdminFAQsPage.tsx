import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLogger } from '@/hooks/useAdminLogger';
import { useAdminCache } from '@/hooks/useAdminCache';
import type { Tables } from '@/integrations/supabase/types';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminModal } from '@/components/admin/AdminModal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { AdminFormField, AdminInput, AdminTextarea, AdminButton, EmptyState } from '@/components/admin/AdminFormElements';
import { AdminMarkdownEditor } from '@/components/admin/AdminMarkdownEditor';

const emptyFaq = { question: '', answer: '', category: '', order_index: 0 };

export function AdminFAQsPage() {
  const { logAction } = useAdminLogger();
  const { data: faqs, loading, invalidateCache } = useAdminCache<Tables<'faqs'>>({ table: 'faqs', orderBy: 'order_index' });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFaq);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);



  const filtered = useMemo(() =>
    faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase())),
    [faqs, search]
  );

  function openCreate() { setForm({ ...emptyFaq, order_index: faqs.length }); setEditingId(null); setModalOpen(true); }

  function openEdit(faq: Tables<'faqs'>) {
    setForm({ question: faq.question, answer: faq.answer, category: faq.category || '', order_index: faq.order_index });
    setEditingId(faq.id);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { question: form.question, answer: form.answer, category: form.category || null, order_index: form.order_index };

    if (editingId) {
      await supabase.from('faqs').update(payload).eq('id', editingId);

      // Log update action
      await logAction('update', 'faq', editingId, form.question).catch(err => {
        console.error('Failed to log update action:', err);
      });
    } else {
      const { data } = await supabase.from('faqs').insert(payload).select().single();

      // Log create action
      if (data) {
        await logAction('create', 'faq', data.id, form.question).catch(err => {
          console.error('Failed to log create action:', err);
        });
      }
    }
    setSaving(false); setModalOpen(false); invalidateCache();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await supabase.from('faqs').delete().eq('id', deleteTarget.id);

    // Log delete action
    await logAction('delete', 'faq', deleteTarget.id, deleteTarget.name).catch(err => {
      console.error('Failed to log delete action:', err);
    });

    setDeleteTarget(null); invalidateCache();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-['Poppins',sans-serif]" style={{ color: 'var(--text-primary)' }}>FAQs</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Search FAQs…" />
          <AdminButton onClick={openCreate}><Plus className="w-4 h-4" /> Add</AdminButton>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs found" description={search ? 'Try a different search term' : 'Add your first FAQ'} />
      ) : (
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div key={faq.id} className="rounded-xl border p-4 flex items-start gap-4 transition-colors"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: 'var(--chip-bg)', color: 'var(--brand)' }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{faq.question}</h3>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(faq)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget({ id: faq.id, name: faq.question })} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit FAQ' : 'Add FAQ'}>
        <div className="space-y-4">
          <AdminFormField label="Question" required>
            <AdminInput value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="What is…?" />
          </AdminFormField>
          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Answer (Markdown)
            </label>
            <AdminMarkdownEditor
              value={form.answer}
              onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
              placeholder="The answer…"
              style={{ minHeight: '200px' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="Category">
              <AdminInput value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="General" />
            </AdminFormField>
            <AdminFormField label="Order">
              <AdminInput type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))} />
            </AdminFormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton onClick={handleSave} disabled={!form.question || !form.answer || saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Create'}</AdminButton>
          </div>
        </div>
      </AdminModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete FAQ" message={`Are you sure you want to delete this FAQ?`} />
    </div>
  );
}
