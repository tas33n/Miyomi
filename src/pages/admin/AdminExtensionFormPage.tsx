import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLogger } from '@/hooks/useAdminLogger';
import { AdminFormField, AdminInput, AdminTextarea, AdminSelect, AdminButton, Label } from '@/components/admin/AdminFormElements';
import { AdminSmartSelect } from '@/components/admin/AdminSmartSelect';
import { ArrowLeft, Save, Loader2, Palette, Github, Download, Copy, Check, Link2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { extractColorFromImage } from '@/utils/extractColorFromImage';

const emptyExt = {
    name: '', short_description: '', description: '', author: '', category: '', language: '',
    status: 'approved', platforms: [] as string[], tags: [] as string[],
    types: [] as string[],
    compatible_with: [] as string[], repo_url: '', source_url: '',
    icon_url: '', icon_color: '',
    auto_url: '', manual_url: '', discord_url: '',
    tutorials: [] as any[],
    download_count: 0, likes_count: 0
};

const PLATFORM_OPTIONS = ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Web'];
const TYPE_OPTIONS = ['Anime', 'Manga', 'Light Novel'];
const TAG_OPTIONS = ['NSFW', 'SFW', 'Official', 'Fan Source'];

function ManualUrlCopyButton({ url }: { url: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <AdminButton
            variant="secondary"
            onClick={() => {
                if (url) {
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    toast.success('Copied to clipboard!');
                    setTimeout(() => setCopied(false), 2000);
                }
            }}
            disabled={!url}
            className="px-3 shrink-0"
        >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </AdminButton>
    );
}

export function AdminExtensionFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logAction } = useAdminLogger();
    const [form, setForm] = useState(emptyExt);
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [fetchingGithub, setFetchingGithub] = useState(false);
    const [appOptions, setAppOptions] = useState<string[]>([]);
    const [appsData, setAppsData] = useState<any[]>([]); // Store full app data for relationships
    const [extractingColor, setExtractingColor] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Tutorial Selection State
    const [guideOptions, setGuideOptions] = useState<string[]>([]);
    const [guidesData, setGuidesData] = useState<any[]>([]);
    const [selectedGuideTitles, setSelectedGuideTitles] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            fetchExt(id);
        }
        fetchAppOptions();
        fetchGuides();
    }, [id]);

    async function fetchGuides() {
        const { data } = await supabase.from('guides').select('title, slug').order('title');
        if (data) {
            setGuidesData(data);
            setGuideOptions(data.map(g => g.title));
        }
    }

    async function handleGithubFetch() {
        if (!form.repo_url) {
            toast.error("Please enter a GitHub URL first");
            return;
        }

        const match = form.repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            toast.error("Invalid GitHub URL format");
            return;
        }

        const [_, owner, repo] = match;
        setFetchingGithub(true);

        try {
            // Fetch Repo Info
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (!res.ok) throw new Error("GitHub API error: " + res.statusText);
            const data = await res.json();

            setForm(prev => ({
                ...prev,
                name: prev.name || data.name,
                short_description: data.description || prev.short_description,
                source_url: data.homepage || prev.source_url,
                tags: [...new Set([...prev.tags, ...(data.topics || [])])],
                author: data.owner?.login || prev.author,
                icon_url: prev.icon_url || data.owner?.avatar_url || '',
            }));

            toast.success("Fetched metadata from GitHub");
        } catch (err: any) {
            toast.error("Failed to fetch from GitHub: " + err.message);
        } finally {
            setFetchingGithub(false);
        }
    }

    // Auto-extract color when icon_url changes
    useEffect(() => {
        if (form.icon_url && !form.icon_color) {
            handleColorExtraction(form.icon_url);
        }
    }, [form.icon_url]);

    async function handleColorExtraction(url: string) {
        setExtractingColor(true);
        const color = await extractColorFromImage(url);
        if (color) {
            setForm(f => ({ ...f, icon_color: color }));
        }
        setExtractingColor(false);
    }

    // Real-time Duplicate Checking
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (form.name.trim()) {
                const dup = await checkDuplicate('name', form.name);
                setErrors(prev => ({
                    ...prev,
                    name: dup ? `An extension with the name "${form.name}" already exists.` : ''
                }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [form.name]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (form.repo_url.trim()) {
                const dup = await checkDuplicate('repo_url', form.repo_url);
                setErrors(prev => ({
                    ...prev,
                    repo_url: dup ? `An extension with this Repository URL already exists (${dup.name}).` : ''
                }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [form.repo_url]);

    async function fetchAppOptions() {
        // Fetch name and fork_of to handle smart compatibility
        const { data } = await (supabase.from('apps') as any).select('name, fork_of').order('name');
        if (data) {
            setAppsData(data);
            setAppOptions(data.map((a: any) => a.name));
        }
    }

    // Smart Compatibility Logic
    function handleCompatibleChange(selectedApps: string[]) {
        // Find newly added apps
        const newApps = selectedApps.filter(a => !form.compatible_with.includes(a));

        let finalSelection = [...selectedApps];

        // For each newly selected app, find if it is a parent to others
        newApps.forEach(parentName => {
            // Find all apps that claimed this parent as 'fork_of'
            const children = appsData.filter(a => a.fork_of === parentName).map(a => a.name);

            if (children.length > 0) {
                // Add children if not already present
                children.forEach(child => {
                    if (!finalSelection.includes(child)) {
                        finalSelection.push(child);
                        toast.info(`Auto-selected ${child} (Fork of ${parentName})`);
                    }
                });
            }
        });

        setForm(f => ({ ...f, compatible_with: finalSelection }));
    }

    async function fetchExt(extId: string) {
        try {
            const { data, error } = await (supabase.from('extensions') as any).select('*').eq('id', extId).single();
            if (error) throw error;
            if (data) {
                const extData = data as any;
                const loadedTutorials = Array.isArray(extData.tutorials) ? extData.tutorials : [];
                setForm({
                    name: extData.name,
                    short_description: extData.short_description || '',
                    description: extData.description || '',
                    author: extData.author || '',
                    category: extData.category || '',
                    language: extData.language || '',
                    status: extData.status,
                    platforms: extData.platforms || [],
                    tags: extData.tags || [],
                    types: extData.types || [],
                    compatible_with: extData.compatible_with || [],
                    repo_url: extData.repo_url || '',
                    source_url: extData.source_url || '',
                    icon_url: extData.icon_url || '',
                    icon_color: extData.icon_color || '',
                    auto_url: extData.auto_url || '',
                    manual_url: extData.manual_url || '',
                    discord_url: extData.discord_url || '',
                    tutorials: loadedTutorials,
                    download_count: extData.download_count || 0,
                    likes_count: extData.likes_count || 0
                });
                setSelectedGuideTitles(loadedTutorials.map((t: any) => t.title).filter(Boolean));
            }
        } catch (err: any) {
            toast.error('Failed to load extension: ' + err.message);
            navigate('/admin/extensions');
        } finally {
            setLoading(false);
        }
    }

    async function checkDuplicate(field: 'name' | 'repo_url', value: string) {
        if (!value) return false;
        let query = (supabase.from('extensions') as any).select('id, name').eq(field, value);
        if (id) query = query.neq('id', id);
        const { data } = await query.maybeSingle();
        return data;
    }

    async function handleSave() {
        setSaving(true);
        // Errors are updated in real-time by useEffect
        if (Object.values(errors).some(v => !!v)) {
            toast.error("Please fix duplicate entries before saving.");
            setSaving(false);
            return;
        }

        try {
            // Final safety check
            const dupName = await checkDuplicate('name', form.name);
            if (dupName) {
                toast.error(`An extension with the name "${form.name}" already exists.`);
                setSaving(false);
                return;
            }

            // Reconstruct tutorials
            const finalTutorials = selectedGuideTitles.map(title => {
                const guide = guidesData.find(g => g.title === title);
                if (guide) {
                    return { title: guide.title, url: `/guides/${guide.slug}`, type: 'guide' };
                }
                return { title: title, url: '#', type: 'custom' };
            });

            const payload = {
                name: form.name,
                short_description: form.short_description || null,
                description: form.description || null,
                author: form.author || null,
                category: form.category || null,
                language: form.language || null,
                status: form.status,
                platforms: form.platforms.length ? form.platforms : null,
                tags: form.tags.length ? form.tags : null,
                // @ts-ignore
                types: form.types.length ? form.types : null,
                compatible_with: form.compatible_with.length ? form.compatible_with : null,
                repo_url: form.repo_url || null,
                source_url: form.source_url || null,
                icon_url: form.icon_url || null,
                icon_color: form.icon_color || null,
                auto_url: form.auto_url || null,
                manual_url: form.manual_url || null,
                discord_url: form.discord_url || null,
                tutorials: finalTutorials,
                download_count: form.download_count || 0,
                likes_count: form.likes_count || 0
            };


            if (id) {
                const { error } = await (supabase.from('extensions') as any).update(payload).eq('id', id);
                if (error) throw error;

                // Log update action
                await logAction('update', 'extension', id, form.name).catch(err => {
                    console.error('Failed to log update action:', err);
                });

                toast.success('Extension updated successfully');
            } else {
                const { data, error } = await (supabase.from('extensions') as any).insert(payload).select().single();
                if (error) throw error;

                // Log create action
                if (data) {
                    await logAction('create', 'extension', data.id, form.name).catch(err => {
                        console.error('Failed to log create action:', err);
                    });
                }

                toast.success('Extension created successfully');
            }
            navigate('/admin/extensions');
        } catch (err: any) {
            toast.error('Failed to save extension: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-96 text-[var(--text-secondary)]"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/extensions')} className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-elev-1)] text-[var(--text-secondary)] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold font-['Poppins',sans-serif] text-[var(--text-primary)]">
                        {id ? 'Edit Extension' : 'New Extension'}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <AdminButton variant="secondary" onClick={() => navigate('/admin/extensions')}>Cancel</AdminButton>
                    <AdminButton onClick={handleSave} disabled={!form.name || saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Extension
                    </AdminButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* GitHub Import */}
                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <Github className="w-5 h-5" /> GitHub Integration
                        </h3>
                        <div className="flex gap-3 items-end">
                            <AdminFormField label="Repository URL" className="flex-1">
                                {errors.repo_url && <div className="text-red-500 text-xs font-semibold mb-1 animate-pulse">⚠️ {errors.repo_url}</div>}
                                <AdminInput
                                    value={form.repo_url}
                                    onChange={e => {
                                        setForm(f => ({ ...f, repo_url: e.target.value }));
                                        if (errors.repo_url) setErrors(prev => ({ ...prev, repo_url: '' }));
                                    }}
                                    placeholder="https://github.com/owner/repo"
                                    className={errors.repo_url ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                                />
                            </AdminFormField>
                            <AdminButton onClick={handleGithubFetch} disabled={fetchingGithub || !form.repo_url} variant="secondary">
                                {fetchingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                <span className="ml-2 hidden sm:inline">Fetch Data</span>
                            </AdminButton>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Basic Information</h3>
                        <AdminFormField label="Name" required>
                            {errors.name && <div className="text-red-500 text-xs font-semibold mb-1 animate-pulse">⚠️ {errors.name}</div>}
                            <AdminInput
                                value={form.name}
                                onChange={e => {
                                    setForm(f => ({ ...f, name: e.target.value }));
                                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                                }}
                                placeholder="Extension Name"
                                className={errors.name ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]' : ''}
                            />
                        </AdminFormField>
                        <AdminFormField label="Short Description (Bio)">
                            <AdminTextarea className="h-20" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="Brief summary displayed in header..." />
                        </AdminFormField>
                        <AdminFormField label="Overview (Long Description)">
                            <AdminTextarea className="h-32" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description..." />
                        </AdminFormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Replaced Category with Content Types (Types) */}
                            <AdminSmartSelect
                                label="Content Types"
                                value={form.types}
                                onChange={(val) => setForm(f => ({ ...f, types: val }))}
                                options={TYPE_OPTIONS}
                                placeholder="Anime, Manga..."
                            />
                            <AdminFormField label="Language">
                                <AdminInput value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} placeholder="en, es, etc." />
                            </AdminFormField>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Compatibility & Source</h3>
                        <div className="space-y-1">
                            <Label className="mb-1">Compatible Apps</Label>
                            <div className="text-xs text-[var(--text-secondary)] mb-2">
                                Apps connected to this extension. Auto-selects forks if parent is chosen.
                            </div>
                            <AdminSmartSelect
                                value={form.compatible_with}
                                onChange={handleCompatibleChange} // Use custom handler
                                options={appOptions}
                                placeholder="Select apps..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <AdminFormField label="Source URL">
                                <AdminInput value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} placeholder="https://..." />
                            </AdminFormField>
                            <AdminFormField label="Discord URL">
                                <AdminInput value={form.discord_url} onChange={e => setForm(f => ({ ...f, discord_url: e.target.value }))} placeholder="https://discord.gg/..." />
                            </AdminFormField>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                            <Link2 className="w-5 h-5" /> Install URLs
                        </h3>
                        <AdminFormField label="Auto Install URL">
                            <AdminInput value={form.auto_url} onChange={e => setForm(f => ({ ...f, auto_url: e.target.value }))} placeholder="tachiyomi://add-repo?url=..." />
                            <p className="text-xs text-[var(--text-secondary)] mt-1">Deep link that triggers automatic extension source installation in compatible apps.</p>
                        </AdminFormField>
                        <AdminFormField label="Manual Install URL">
                            <div className="flex gap-2">
                                <AdminInput value={form.manual_url} onChange={e => setForm(f => ({ ...f, manual_url: e.target.value }))} placeholder="https://raw.githubusercontent.com/..." className="flex-1" />
                                <ManualUrlCopyButton url={form.manual_url} />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">URL users can copy to manually add the extension source in their app settings.</p>
                        </AdminFormField>
                    </div>

                    {/* Tutorials / Guides Section */}
                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Tutorials & Guides
                        </h3>
                        <div className="space-y-4">
                            <AdminSmartSelect
                                label="Linked Guides & Tutorials"
                                value={selectedGuideTitles}
                                onChange={setSelectedGuideTitles}
                                options={guideOptions}
                                placeholder="Search and select guides..."
                                creatable={true}
                            />
                            <div className="text-xs text-[var(--text-secondary)]">
                                Select existing guides from the database. Type to create a new custom entry title.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Appearance</h3>
                        <AdminFormField label="Icon URL">
                            <AdminInput value={form.icon_url} onChange={e => setForm(f => ({ ...f, icon_url: e.target.value }))} placeholder="https://..." />
                        </AdminFormField>
                        <div className="flex items-center gap-4">
                            {form.icon_url && <img src={form.icon_url} alt="Icon Preview" className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-gray-800" />}
                        </div>
                        <AdminFormField label="Icon Color">
                            <div className="flex gap-2 items-center">
                                <div className="relative w-12 h-10 rounded-lg border border-[var(--divider)] overflow-hidden cursor-pointer shadow-sm">
                                    <input
                                        type="color"
                                        value={form.icon_color || '#ffffff'}
                                        onChange={e => setForm(f => ({ ...f, icon_color: e.target.value }))}
                                        className="absolute -top-2 -left-2 w-20 h-20 p-0 border-0 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: form.icon_color || 'transparent' }}></div>
                                </div>
                                <AdminInput value={form.icon_color} onChange={e => setForm(f => ({ ...f, icon_color: e.target.value }))} placeholder="#3B82F6" className="font-mono flex-1" />
                                <span title="Auto-extract from Icon">
                                    <AdminButton type="button" variant="secondary" onClick={() => handleColorExtraction(form.icon_url)} disabled={!form.icon_url || extractingColor} className="px-3">
                                        {extractingColor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                                    </AdminButton>
                                </span>
                            </div>
                        </AdminFormField>
                    </div>

                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Status & Metadata</h3>
                        <AdminFormField label="Status">
                            <AdminSelect value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </AdminSelect>
                        </AdminFormField>
                        <AdminFormField label="Author">
                            <AdminInput value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author Name" />
                        </AdminFormField>
                        <div className="grid grid-cols-2 gap-4">
                            <AdminFormField label="Downloads">
                                <AdminInput type="number" value={form.download_count} onChange={e => setForm(f => ({ ...f, download_count: parseInt(e.target.value) || 0 }))} placeholder="0" />
                            </AdminFormField>
                            <AdminFormField label="Likes">
                                <AdminInput type="number" value={form.likes_count} onChange={e => setForm(f => ({ ...f, likes_count: parseInt(e.target.value) || 0 }))} placeholder="0" />
                            </AdminFormField>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Metadata</h3>
                        <AdminSmartSelect
                            label="Platforms"
                            value={form.platforms}
                            onChange={(val) => setForm(f => ({ ...f, platforms: val }))}
                            options={PLATFORM_OPTIONS}
                            placeholder="Select platforms..."
                        />
                        <div className="pt-2">
                            <AdminSmartSelect
                                label="Tags"
                                value={form.tags}
                                onChange={(val) => setForm(f => ({ ...f, tags: val }))}
                                options={TAG_OPTIONS}
                                placeholder="Add tags..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
