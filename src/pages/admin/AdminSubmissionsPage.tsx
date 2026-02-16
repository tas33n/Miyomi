import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLogger } from '@/hooks/useAdminLogger';
import type { Tables } from '@/integrations/supabase/types';
import { Inbox, User, MessageSquare, Check, X as XIcon, ExternalLink } from 'lucide-react';
import { AdminButton, StatusBadge, EmptyState } from '@/components/admin/AdminFormElements';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { toast } from 'sonner';

export function AdminSubmissionsPage() {
  const { logAction } = useAdminLogger();
  const [submissions, setSubmissions] = useState<Tables<'submissions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'approve' | 'reject'; submission?: Tables<'submissions'> } | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  }

  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleAction() {
    if (!actionTarget) return;

    try {
      if (actionTarget.action === 'approve' && actionTarget.submission) {
        const sub = actionTarget.submission;
        const data = sub.submitted_data as any;
        const targetTable = sub.submission_type === 'app' ? 'apps' : 'extensions';

        const payload: any = {
          name: data.name,
          description: data.description,
          slug: generateSlug(data.name),
          repository_url: data.url,
          author: sub.author || data.author,
          submitter_name: sub.submitter_name,
          submitter_contact: sub.submitter_contact,
          submitter_email: sub.submitter_email,
          is_official: false,
          is_approved: true,
        };

        if (sub.submission_type === 'app') {
          payload.platforms = data.platforms || [];
        } else {
        }

        const { data: insertedData, error: insertError } = await supabase.from(targetTable).insert(payload).select().single();
        if (insertError) {
          if (insertError.code === '23505') {
            toast.error(`Slug conflict: '${payload.slug}' already exists.`);
            return;
          }
          throw insertError;
        }

        await supabase.from('submissions').update({ status: 'approved' }).eq('id', sub.id);

        if (insertedData) {
          await logAction('approve', 'submission', sub.id, `${sub.submission_type} submission`, {
            approved_as: targetTable,
            resource_id: insertedData.id,
            resource_name: data.name
          }).catch(err => {
            console.error('Failed to log approve action:', err);
          });
        }

        toast.success(`Published ${data.name} to ${targetTable}!`);
      } else {
        const sub = actionTarget.submission;
        const data = sub ? (sub.submitted_data as any) : {};

        await supabase.from('submissions').update({ status: 'rejected' }).eq('id', actionTarget.id);

        await logAction('reject', 'submission', actionTarget.id, sub ? `${sub.submission_type} submission` : 'submission', {
          reason: 'Rejected by admin',
          submission_name: data?.name
        }).catch(err => {
          console.error('Failed to log reject action:', err);
        });

        toast.success('Submission rejected.');
      }

      setActionTarget(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error('Action failed: ' + err.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-['Poppins',sans-serif] mb-6" style={{ color: 'var(--text-primary)' }}>Submissions</h1>

      {loading ? (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
      ) : submissions.length === 0 ? (
        <EmptyState icon={Inbox} title="No submissions" description="User submissions will appear here" />
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => {
            const data = sub.submitted_data as any;
            return (
              <div key={sub.id} className="rounded-xl border p-5 transition-colors hover:border-[var(--brand)]"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{data.name || 'Untitled'}</h3>
                      <StatusBadge status={sub.status} />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--chip-bg)] border border-[var(--divider)] uppercase font-medium">
                        {sub.submission_type}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{data.description}</p>
                    {data.url && (
                      <a href={data.url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 mt-1 hover:underline" style={{ color: 'var(--brand)' }}>
                        <ExternalLink className="w-3 h-3" /> {data.url}
                      </a>
                    )}
                  </div>
                  <div className="text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </div>


                <div className="mb-4 p-3 rounded-lg flex flex-wrap gap-4 text-sm bg-[var(--bg-elev-1)] border border-[var(--divider)]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{sub.submitter_name || 'Anonymous'}</span>
                  </div>
                  {sub.submitter_email && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span>{sub.submitter_email}</span>
                    </div>
                  )}
                  {sub.submitter_contact && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <MessageSquare className="w-4 h-4" />
                      <span>{sub.submitter_contact}</span>
                    </div>
                  )}
                  {sub.author && (
                    <div className="flex items-center gap-2 ml-auto" style={{ color: 'var(--text-secondary)' }}>
                      <span className="opacity-70">Author:</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{sub.author}</span>
                    </div>
                  )}
                </div>


                {sub.status === 'pending' && (
                  <div className="flex gap-3 pt-2 border-t border-[var(--divider)]">
                    <AdminButton onClick={() => setActionTarget({ id: sub.id, action: 'approve', submission: sub })}>
                      <Check className="w-4 h-4 mr-1" /> Publish
                    </AdminButton>
                    <AdminButton variant="destructive" onClick={() => setActionTarget({ id: sub.id, action: 'reject' })}>
                      <XIcon className="w-4 h-4 mr-1" /> Reject
                    </AdminButton>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
    </div>
  );
}
