import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminRichTextEditor } from '@/components/admin/AdminRichTextEditor';
import { AdminInput, AdminButton, AdminSelect, AdminTextarea, AdminFormField } from '@/components/admin/AdminFormElements';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const emptyGuide = {
    title: '', description: '', content: '', author: '', category: '',
    slug: '', status: 'draft', tags: [] as string[],
    content_format: 'markdown' as 'html' | 'markdown',
};

export function AdminGuideEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState(emptyGuide);
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchGuide() {
            try {
                const { data, error } = await supabase.from('guides').select('*').eq('id', id).single();
                if (error) {
                    toast.error('Failed to load guide');
                    navigate('/admin/guides');
                    return;
                }
                setForm({
                    title: data.title,
                    description: data.description || '',
                    content: data.content || '',
                    author: data.author || '',
                    category: data.category || '',
                    slug: data.slug || '',
                    status: data.status,
                    tags: data.tags || [],
                    content_format: (data as any).content_format || 'html',
                });
            } catch (error) {
                console.error(error);
                toast.error('Failed to load guide');
            } finally {
                setLoading(false);
            }
        }

        fetchGuide();
    }, [id, navigate]);

    async function handleSave() {
        if (!form.title) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        const payload = {
            title: form.title,
            description: form.description || null,
            content: form.content || null,
            author: form.author || null,
            category: form.category || null,
            slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            status: form.status,
            tags: form.tags.length ? form.tags : null,
            content_format: form.content_format,
            updated_at: new Date().toISOString(),
        };

        try {
            if (id) {
                const { data, error } = await supabase.from('guides').update(payload).eq('id', id).select();
                if (error) throw error;
                if (!data || data.length === 0) throw new Error('Update failed — check RLS policies.');
                toast.success('Guide saved!');
            } else {
                const { data, error } = await supabase.from('guides').insert(payload).select();
                if (error) throw error;
                toast.success('Guide created!');
                navigate('/admin/guides');
            }
        } catch (error: any) {
            console.error('Save Error:', error);
            toast.error(error.message || 'Failed to save guide');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>;

    return (
        <div className="max-w-[1400px] mx-auto pb-20">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/guides')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[var(--text-secondary)]">ID: {id || 'NEW'}</span>
                    <AdminButton onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Guide'}
                    </AdminButton>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                {/* Main editor column */}
                <div className="space-y-4 min-w-0">
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Guide Title"
                        className="w-full bg-transparent text-3xl font-bold border-none focus:outline-none focus:ring-0 px-0 placeholder-[var(--text-secondary)]"
                        style={{ color: 'var(--text-primary)' }}
                    />

                    <AdminRichTextEditor
                        value={form.content}
                        onChange={content => setForm(f => ({ ...f, content }))}
                        format={form.content_format}
                        onFormatChange={content_format => setForm(f => ({ ...f, content_format }))}
                        placeholder="Start writing your guide..."
                    />
                </div>

                {/* Sidebar settings */}
                <div className="space-y-6">
                    <div className="p-4 rounded-xl border space-y-4 sticky top-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}>
                        <h3 className="font-semibold text-[var(--text-primary)]">Settings</h3>

                        <AdminFormField label="Status">
                            <AdminSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </AdminSelect>
                        </AdminFormField>

                        <AdminFormField label="Slug">
                            <AdminInput value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-slug" />
                        </AdminFormField>

                        <AdminFormField label="Category">
                            <AdminInput value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                        </AdminFormField>

                        <AdminFormField label="Author">
                            <AdminInput value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                        </AdminFormField>

                        <AdminFormField label="Description">
                            <AdminTextarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                rows={3}
                            />
                        </AdminFormField>

                        <AdminFormField label="Tags">
                            <AdminInput
                                value={form.tags.join(', ')}
                                onChange={e => setForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                                placeholder="tag1, tag2"
                            />
                        </AdminFormField>
                    </div>
                </div>
            </div>
        </div>
    );
}
