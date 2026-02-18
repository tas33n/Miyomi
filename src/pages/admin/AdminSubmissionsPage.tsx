import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLogger } from '@/hooks/useAdminLogger';
import type { Tables } from '@/integrations/supabase/types';
import { Inbox, User, Check, X as XIcon, Eye, Trash2, AlertTriangle, Save } from 'lucide-react';
import { AdminButton, StatusBadge, EmptyState } from '@/components/admin/AdminFormElements';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { SubmissionEditForm } from '@/components/admin/SubmissionEditForm';
import { toast } from 'sonner';

export function AdminSubmissionsPage() {
  const { logAction } = useAdminLogger();
  const [submissions, setSubmissions] = useState<Tables<'submissions'>[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'approve' | 'reject'; submission?: Tables<'submissions'>; data?: any } | null>(null);

  const [selectedSubmission, setSelectedSubmission] = useState<Tables<'submissions'> | null>(null);
  const [editedData, setEditedData] = useState<any>(null); // State for the editable form

  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<'approved' | 'rejected' | 'pending' | 'all' | null>(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedSubmission) {
      setEditedData(selectedSubmission.submitted_data);
    } else {
      setEditedData(null);
    }
  }, [selectedSubmission]);

  async function fetchData() {
    const { data } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  }

  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleBulkDelete() {
    if (!bulkDeleteTarget) return;

    try {
      let query = supabase.from('submissions').delete();

      if (bulkDeleteTarget === 'all') {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      } else {
        query = query.eq('status', bulkDeleteTarget);
      }

      const { error, count } = await query;
      if (error) throw error;

      await logAction('delete', 'submission', 'bulk', `Bulk delete ${bulkDeleteTarget}`, {
        count,
        target: bulkDeleteTarget
      });

      toast.success(`Cleared ${bulkDeleteTarget} submissions (${count} removed)`);
      setBulkDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error('Bulk delete failed: ' + err.message);
    }
  }

  async function handleAction() {
    if (!actionTarget) return;

    try {
      if (actionTarget.action === 'approve' && actionTarget.submission) {
        const sub = actionTarget.submission;
        const data = actionTarget.data || sub.submitted_data as any;
        const targetTable = sub.submission_type === 'app' ? 'apps' : 'extensions';

        const payload: any = {
          name: data.name,
          description: data.description,
          short_description: data.short_description || null,
          slug: generateSlug(data.name),
          repo_url: data.repo_url || data.url,
          author: sub.author || data.author,
          submitter_name: sub.submitter_name,
          submitter_contact: sub.submitter_contact,
          submitter_email: sub.submitter_email,
          status: 'approved',
          tags: data.tags || [],
          icon_url: data.icon_url,
          icon_color: data.icon_color,
          website_url: data.website_url,
          discord_url: data.discord_url || null,
        };

        if (sub.submission_type === 'app') {
          payload.platforms = data.platforms || [];
          payload.download_url = data.download_url;
          payload.version = data.version;
          payload.content_types = data.content_types || [];
          payload.tutorials = data.tutorials || [];
          payload.fork_of = data.fork_of;
          payload.upstream_url = data.upstream_url;
        } else {
          payload.compatible_with = data.compatible_with || [];
          payload.types = data.types || data.content_types || [];
          payload.source_url = data.source_url;
          payload.language = data.language;
          payload.auto_url = data.auto_url || null;
          payload.manual_url = data.manual_url || null;
          payload.tutorials = data.tutorials || [];
        }

        const { data: insertedData, error: insertError } = await supabase.from(targetTable).insert(payload).select().single();
        if (insertError) {
          if (insertError.code === '23505') {
            toast.error(`Slug conflict: '${payload.slug}' already exists.`);
            return;
          }
          throw insertError;
        }

        await supabase.from('submissions').update({
          status: 'approved',
          submitted_data: data
        }).eq('id', sub.id);

        if (insertedData) {
          await logAction('approve', 'submission', sub.id, `${sub.submission_type} submission`, {
            approved_as: targetTable,
            resource_id: insertedData.id,
            resource_name: data.name
          }).catch(err => console.error(err));
        }

        toast.success(`Published ${data.name} to ${targetTable}!`);
      } else {
        const sub = actionTarget.submission;
        const data = sub ? (sub.submitted_data as any) : {};

        await supabase.from('submissions').update({ status: 'rejected' }).eq('id', actionTarget.id);

        await logAction('reject', 'submission', actionTarget.id, sub ? `${sub.submission_type} submission` : 'submission', {
          reason: 'Rejected by admin',
          submission_name: data?.name
        }).catch(err => console.error(err));

        toast.success('Submission rejected.');
      }

      setActionTarget(null);
      setSelectedSubmission(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error('Action failed: ' + err.message);
    }
  }

  const counts = {
    active: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    all: submissions.length
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <h1 className="text-2xl font-bold font-['Poppins',sans-serif]" style={{ color: 'var(--text-primary)' }}>Submissions</h1>

        {/* Bulk Actions Buttons */}
        <div className="flex flex-wrap gap-3">
          {counts.pending > 0 && (
            <AdminButton
              variant="secondary"
              onClick={() => setBulkDeleteTarget('pending')}
              className="hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-600 transition-all font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Pending ({counts.pending})
            </AdminButton>
          )}
          {counts.rejected > 0 && (
            <AdminButton
              variant="secondary"
              onClick={() => setBulkDeleteTarget('rejected')}
              className="hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Rejected ({counts.rejected})
            </AdminButton>
          )}
          {counts.active > 0 && (
            <AdminButton
              variant="secondary"
              onClick={() => setBulkDeleteTarget('approved')}
              className="hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-500 transition-all font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Approved ({counts.active})
            </AdminButton>
          )}
          {counts.all > 0 && (
            <AdminButton
              variant="destructive"
              onClick={() => setBulkDeleteTarget('all')}
              className="shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:scale-105"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </AdminButton>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
      ) : submissions.length === 0 ? (
        <EmptyState icon={Inbox} title="No submissions" description="User submissions will appear here" />
      ) : (
        <div className="grid gap-4">
          {submissions.map(sub => {
            const data = sub.submitted_data as any;
            return (
              <div key={sub.id} className="rounded-xl border p-5 transition-all hover:border-[var(--brand)] hover:shadow-lg hover:shadow-[var(--brand)]/5 group bg-[var(--bg-surface)] border-[var(--divider)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg group-hover:text-[var(--brand)] transition-colors" style={{ color: 'var(--text-primary)' }}>{data.name || 'Untitled'}</h3>
                      <StatusBadge status={sub.status} />
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elev-1)] border border-[var(--divider)] uppercase font-semibold tracking-wider text-[var(--text-secondary)]">
                        {sub.submission_type}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2 max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{data.description}</p>
                  </div>
                  <div className="text-right text-xs font-medium opacity-60" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-5 p-3 rounded-lg flex flex-wrap gap-4 text-sm bg-[var(--bg-elev-1)] border border-[var(--divider)]/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--text-secondary)] opacity-70" />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{sub.submitter_name || 'Anonymous'}</span>
                  </div>
                  {sub.author && (
                    <div className="flex items-center gap-2 px-3 border-l border-[var(--divider)]" style={{ color: 'var(--text-secondary)' }}>
                      <span className="opacity-70">Author:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{sub.author}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--divider)]">
                  <AdminButton variant="secondary" onClick={() => setSelectedSubmission(sub)} className="mr-auto hover:bg-[var(--bg-elev-2)]">
                    <Eye className="w-4 h-4 mr-2" /> View & Edit
                  </AdminButton>

                  {sub.status === 'pending' && (
                    <>
                      <AdminButton
                        onClick={() => setActionTarget({ id: sub.id, action: 'approve', submission: sub })}
                        className="bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-500/20"
                      >
                        <Check className="w-4 h-4 mr-2" /> Publish
                      </AdminButton>
                      <AdminButton
                        variant="destructive"
                        onClick={() => setActionTarget({ id: sub.id, action: 'reject' })}
                        className="hover:scale-105 transition-transform"
                      >
                        <XIcon className="w-4 h-4 mr-2" /> Reject
                      </AdminButton>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleAction}
        title={actionTarget?.action === 'approve' ? 'Publish Submission' : 'Reject Submission'}
        message={actionTarget?.action === 'approve'
          ? 'This will create a new entry in the live database. Are you sure?'
          : 'Are you sure you want to reject this submission?'}
        confirmLabel={actionTarget?.action === 'approve' ? 'Publish' : 'Reject'}
        destructive={actionTarget?.action === 'reject'}
      />

      <ConfirmDialog
        open={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={handleBulkDelete}
        title={`Clear ${bulkDeleteTarget === 'all' ? 'All' : bulkDeleteTarget} Submissions`}
        message={`Are you sure you want to delete all ${bulkDeleteTarget} submissions? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-4xl bg-[var(--bg-surface)] rounded-2xl border border-[var(--divider)] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[var(--divider)] flex items-center justify-between bg-[var(--bg-surface)] z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                  {selectedSubmission.submission_type === 'app' ? <Inbox className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Review Submission</h2>
                  <p className="text-xs font-mono opacity-50" style={{ color: 'var(--text-secondary)' }}>ID: {selectedSubmission.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-[var(--bg-elev-1)] rounded-lg text-[var(--text-secondary)] transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-8 p-4 rounded-xl bg-[var(--bg-elev-1)] border border-[var(--divider)] grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold block mb-1">Submitter</span>
                  <div className="font-medium flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <User className="w-3.5 h-3.5 opacity-70" /> {selectedSubmission.submitter_name || 'Anonymous'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold block mb-1">Contact</span>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {selectedSubmission.submitter_contact || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold block mb-1">Email</span>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {selectedSubmission.submitter_email || 'N/A'}
                  </div>
                </div>
              </div>

              {selectedSubmission.duplicate_check_results && (
                <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                  <h4 className="flex items-center gap-2 font-bold mb-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> Potential Duplicates Detected
                  </h4>
                  <pre className="text-[11px] whitespace-pre-wrap font-mono bg-black/5 dark:bg-black/20 p-2 rounded-lg">
                    {JSON.stringify(selectedSubmission.duplicate_check_results, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6 pb-2 border-b border-[var(--divider)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Editable Data</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] font-medium">
                  Live Edit Mode
                </span>
              </div>

              <SubmissionEditForm
                type={selectedSubmission.submission_type as any}
                data={editedData || selectedSubmission.submitted_data}
                onChange={setEditedData}
              />
            </div>

            <div className="p-5 border-t border-[var(--divider)] bg-[var(--bg-elev-1)] flex justify-end gap-3 shrink-0">
              <AdminButton variant="secondary" onClick={() => setSelectedSubmission(null)} className="mr-auto">
                Cancel
              </AdminButton>

              {selectedSubmission.status === 'pending' && (
                <>
                  <AdminButton variant="destructive" onClick={() => {
                    setSelectedSubmission(null);
                    setActionTarget({ id: selectedSubmission.id, action: 'reject' });
                  }}>
                    <XIcon className="w-4 h-4 mr-2" /> Reject
                  </AdminButton>
                  <AdminButton onClick={() => {
                    setSelectedSubmission(null);
                    setActionTarget({
                      id: selectedSubmission.id,
                      action: 'approve',
                      submission: selectedSubmission,
                      data: editedData // CRITICAL: Propagate edited data
                    });
                  }} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
                    <Check className="w-4 h-4 mr-2" /> Publish Changes
                  </AdminButton>
                </>
              )}

              {selectedSubmission.status === 'approved' && (
                <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 font-medium flex items-center gap-2 border border-green-500/20">
                  <Check className="w-4 h-4" /> Already Published
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
