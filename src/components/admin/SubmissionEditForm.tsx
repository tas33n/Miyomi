import { useEffect, useState } from 'react';
import { Loader2, Palette, Github, Download } from 'lucide-react';
import { AdminFormField, AdminInput, AdminTextarea, AdminSelect, AdminButton } from '@/components/admin/AdminFormElements';
import { AdminSmartSelect } from '@/components/admin/AdminSmartSelect';
import { extractColorFromImage } from '@/utils/extractColorFromImage';
import { toast } from 'sonner';

const PLATFORM_OPTIONS = ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Web'];
const CONTENT_TYPE_OPTIONS = ['Anime', 'Manga', 'Light Novel', 'Webtoon', 'Comics'];
const EXT_TYPE_OPTIONS = ['Anime', 'Manga', 'Light Novel'];
const TAG_OPTIONS = ['Free', 'Paid', 'Open Source', 'Ad-free', 'NSFW', 'Reader', 'Tracker', 'Downloader'];

interface SubmissionEditFormProps {
    type: 'app' | 'extension';
    data: any;
    onChange: (newData: any) => void;
}

export function SubmissionEditForm({ type, data, onChange }: SubmissionEditFormProps) {
    const [form, setForm] = useState(data);
    const [fetchingGithub, setFetchingGithub] = useState(false);
    const [extractingColor, setExtractingColor] = useState(false);

    useEffect(() => {
        setForm(data);
    }, [data.id]);

    function updateField(field: string, value: any) {
        const newData = { ...form, [field]: value };
        setForm(newData);
        onChange(newData);
    }

    async function handleColorExtraction(url: string) {
        setExtractingColor(true);
        try {
            const color = await extractColorFromImage(url);
            if (color) updateField('icon_color', color);
        } catch (e) {
            console.error(e);
        } finally {
            setExtractingColor(false);
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
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (!res.ok) throw new Error("GitHub API error: " + res.statusText);
            const ghData = await res.json();

            let version = form.version;
            if (type === 'app') {
                try {
                    const relRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
                    if (relRes.ok) {
                        const relData = await relRes.json();
                        if (relData.tag_name) version = relData.tag_name;
                    }
                } catch (e) { console.warn(e); }
            }

            const merged = {
                ...form,
                name: form.name || ghData.name,
                description: type === 'app' ? (ghData.description || form.description) : form.description,
                short_description: type === 'extension' ? (ghData.description || form.short_description) : form.short_description,
                website_url: ghData.homepage || form.website_url,
                source_url: type === 'extension' ? (ghData.homepage || form.source_url) : undefined,
                tags: [...new Set([...(form.tags || []), ...(ghData.topics || [])])],
                author: ghData.owner?.login || form.author,
                icon_url: form.icon_url || ghData.owner?.avatar_url || '',
                version: version
            };

            setForm(merged);
            onChange(merged);
            toast.success("Fetched metadata from GitHub");
        } catch (err: any) {
            toast.error("Failed to fetch from GitHub: " + err.message);
        } finally {
            setFetchingGithub(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Github className="w-4 h-4" /> Import from GitHub
                        </h3>
                        <div className="flex gap-2">
                            <AdminInput
                                value={form.repo_url || ''}
                                onChange={e => updateField('repo_url', e.target.value)}
                                placeholder="https://github.com/owner/repo"
                                className="text-xs"
                            />
                            <AdminButton onClick={handleGithubFetch} disabled={fetchingGithub || !form.repo_url} variant="secondary" size="sm">
                                {fetchingGithub ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            </AdminButton>
                        </div>
                    </div>

                    <AdminFormField label="Name" required>
                        <AdminInput value={form.name || ''} onChange={e => updateField('name', e.target.value)} />
                    </AdminFormField>

                    <AdminFormField label="Description">
                        <AdminTextarea
                            className="h-24"
                            value={form.description || ''}
                            onChange={e => updateField('description', e.target.value)}
                        />
                    </AdminFormField>

                    <div className="grid grid-cols-2 gap-4">
                        <AdminFormField label="Author">
                            <AdminInput value={form.author || ''} onChange={e => updateField('author', e.target.value)} />
                        </AdminFormField>
                        {type === 'app' && (
                            <AdminFormField label="Version">
                                <AdminInput value={form.version || ''} onChange={e => updateField('version', e.target.value)} />
                            </AdminFormField>
                        )}
                        {type === 'extension' && (
                            <AdminFormField label="Language">
                                <AdminInput value={form.language || ''} onChange={e => updateField('language', e.target.value)} />
                            </AdminFormField>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Appearance
                        </h3>
                        <div className="flex items-center gap-3">
                            {form.icon_url && <img src={form.icon_url} className="w-10 h-10 rounded-lg bg-black/20" />}
                            <div className="flex-1 space-y-2">
                                <AdminInput value={form.icon_url || ''} onChange={e => updateField('icon_url', e.target.value)} placeholder="Icon URL" className="text-xs" />
                                <div className="flex gap-2">
                                    <div className="relative w-8 h-8 rounded border overflow-hidden">
                                        <input type="color" value={form.icon_color || '#ffffff'} onChange={e => updateField('icon_color', e.target.value)} className="absolute -top-1 -left-1 w-12 h-12 p-0 border-0" />
                                    </div>
                                    <AdminButton variant="secondary" size="sm" onClick={() => handleColorExtraction(form.icon_url)} disabled={extractingColor || !form.icon_url}>
                                        Auto-Extract
                                    </AdminButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AdminSmartSelect
                        label={type === 'app' ? "Content Types" : "Types"}
                        value={type === 'app' ? (form.content_types || []) : (form.types || [])}
                        onChange={val => updateField(type === 'app' ? 'content_types' : 'types', val)}
                        options={type === 'app' ? CONTENT_TYPE_OPTIONS : EXT_TYPE_OPTIONS}
                        placeholder="Select types..."
                    />

                    <AdminSmartSelect
                        label="Platforms"
                        value={form.platforms || []}
                        onChange={val => updateField('platforms', val)}
                        options={PLATFORM_OPTIONS}
                        placeholder="Select platforms..."
                    />

                    <AdminSmartSelect
                        label="Tags"
                        value={form.tags || []}
                        onChange={val => updateField('tags', val)}
                        options={TAG_OPTIONS}
                        placeholder="Add tags..."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--divider)]">
                <AdminFormField label="Website / Source URL">
                    <AdminInput
                        value={type === 'app' ? (form.website_url || '') : (form.source_url || '')}
                        onChange={e => updateField(type === 'app' ? 'website_url' : 'source_url', e.target.value)}
                        placeholder="https://..."
                    />
                </AdminFormField>
                <AdminFormField label="Discord URL">
                    <AdminInput value={form.discord_url || ''} onChange={e => updateField('discord_url', e.target.value)} placeholder="https://discord.gg/..." />
                </AdminFormField>
                {type === 'app' && (
                    <AdminFormField label="Download URL">
                        <AdminInput value={form.download_url || ''} onChange={e => updateField('download_url', e.target.value)} placeholder="https://..." />
                    </AdminFormField>
                )}
                {type === 'extension' && (
                    <AdminFormField label="Compatible With (Parent Apps)">
                        <AdminSmartSelect
                            value={form.compatible_with || []}
                            onChange={val => updateField('compatible_with', val)}
                            options={[]}
                            placeholder="Type app names..."
                            creatable={true}
                        />
                    </AdminFormField>
                )}
            </div>
        </div>
    );
}
