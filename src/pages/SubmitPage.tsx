import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminFormField, AdminInput, AdminTextarea, AdminSelect, AdminButton, Label } from '@/components/admin/AdminFormElements';
import { AdminSmartSelect } from '@/components/admin/AdminSmartSelect';
import { extractColorFromImage } from '@/utils/extractColorFromImage';
import {
  CheckCircle2, AlertCircle, Loader2, Github, Smartphone, Puzzle,
  ArrowRight, ArrowLeft, UploadCloud, Palette, Globe, MessageSquare, Mail, ExternalLink,
  Copy, Check, Link2, StickyNote
} from 'lucide-react';
import { toast } from 'sonner';
import Turnstile from 'react-turnstile';
import { Navbar } from '@/components/Navbar';


const PLATFORM_OPTIONS = ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Web'];
const APP_CONTENT_TYPES = ['Anime', 'Manga', 'Light Novel', 'Webtoon', 'Comics'];
const EXT_CONTENT_TYPES = ['Anime', 'Manga', 'Light Novel'];
const APP_TAGS = ['Free', 'Paid', 'Open Source', 'Ad-free', 'NSFW', 'Reader', 'Tracker', 'Downloader'];
const EXT_TAGS = ['NSFW', 'SFW', 'Official', 'Fan Source'];

export function SubmitPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [type, setType] = useState<'app' | 'extension' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');


  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    author: '',
    version: '',
    language: '',
    website_url: '',
    repo_url: '',
    download_url: '',
    source_url: '',
    discord_url: '',
    auto_url: '',
    manual_url: '',
    icon_url: '',
    icon_color: '',
    platforms: [] as string[],
    tags: [] as string[],
    content_types: [] as string[],
    compatible_with: [] as string[],


    submitter_name: '',
    submitter_contact: '',
    submitter_notes: '',
  });

  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [extractingColor, setExtractingColor] = useState(false);
  const [copiedManual, setCopiedManual] = useState(false);
  const [appOptions, setAppOptions] = useState<string[]>([]);


  const [nameError, setNameError] = useState<{ message: string; url?: string } | null>(null);
  const [repoError, setRepoError] = useState<{ message: string; url?: string } | null>(null);



  useEffect(() => {
    const checkDuplicates = async () => {

      if (!form.name) setNameError(null);
      if (!form.repo_url) setRepoError(null);

      if (!form.name && !form.repo_url) return;

      const timeoutId = setTimeout(async () => {
        try {

          if (form.name) {
            const { data: appName } = await supabase
              .from('apps')
              .select('name')
              .ilike('name', form.name)
              .maybeSingle();

            if (appName) {
              setNameError({
                message: 'This app name already exists.',
                url: `/software/${appName.name.toLowerCase().replace(/\s+/g, '-')}`
              });
            } else {
              const { data: extName } = await supabase
                .from('extensions')
                .select('name')
                .ilike('name', form.name)
                .maybeSingle();

              if (extName) {
                setNameError({
                  message: 'This extension name already exists.',
                  url: `/extensions/${extName.name.toLowerCase().replace(/\s+/g, '-')}`
                });
              } else {
                setNameError(null);
              }
            }
          }


          if (form.repo_url) {
            const { data: appRepo } = await supabase
              .from('apps')
              .select('name, repo_url')
              .ilike('repo_url', form.repo_url)
              .maybeSingle();

            if (appRepo) {
              setRepoError({
                message: `Repository already linked to "${appRepo.name}".`,
                url: `/software/${appRepo.name.toLowerCase().replace(/\s+/g, '-')}`
              });
            } else {
              const { data: extRepo } = await supabase
                .from('extensions')
                .select('name, repo_url')
                .ilike('repo_url', form.repo_url)
                .maybeSingle();

              if (extRepo) {
                setRepoError({
                  message: `Repository already linked to "${extRepo.name}".`,
                  url: `/extensions/${extRepo.name.toLowerCase().replace(/\s+/g, '-')}`
                });
              } else {
                setRepoError(null);
              }
            }
          }

        } catch (err) {
          console.error("Duplicate check failed", err);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    };

    checkDuplicates();
  }, [form.name, form.repo_url]);

  // Fetch app options for extension compatible_with
  useEffect(() => {
    async function fetchApps() {
      const { data } = await supabase.from('apps').select('name').order('name');
      if (data) setAppOptions(data.map((a: any) => a.name));
    }
    fetchApps();
  }, []);


  useEffect(() => {
    if (form.icon_url && !form.icon_color) {
      handleColorExtraction(form.icon_url);
    }
  }, [form.icon_url]);

  async function handleColorExtraction(url: string) {
    setExtractingColor(true);
    const color = await extractColorFromImage(url);
    if (color) setForm(f => ({ ...f, icon_color: color }));
    setExtractingColor(false);
  }


  async function handleGithubFetch() {
    if (!form.repo_url) return toast.error("Please enter a GitHub URL first");


    const match = form.repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return toast.error("Invalid GitHub URL format");

    const [_, owner, repo] = match;
    setFetchingGithub(true);

    try {

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!res.ok) throw new Error("GitHub API error: " + res.statusText);
      const data = await res.json();


      let version = form.version;
      try {
        const relRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
        if (relRes.ok) {
          const relData = await relRes.json();
          if (relData.tag_name) version = relData.tag_name;
        }
      } catch (e) { console.warn("No release found", e); }

      setForm(prev => ({
        ...prev,
        name: prev.name || data.name,
        description: data.description || prev.description,
        website_url: data.homepage || prev.website_url,

        tags: [...new Set([...prev.tags, ...(data.topics || [])])],
        author: data.owner?.login || prev.author,
        icon_url: prev.icon_url || data.owner?.avatar_url || '',
        version: version
      }));
      toast.success("Fetched metadata from GitHub");
    } catch (err: any) {
      toast.error("Failed to fetch from GitHub: " + err.message);
    } finally {
      setFetchingGithub(false);
    }
  }


  async function handleSubmit() {
    if (!form.name || !form.description || !form.author) {
      return toast.error("Please fill in all required fields (Name, Description, Author)");
    }
    if (!turnstileToken) {
      return toast.error("Please complete the CAPTCHA");
    }

    if (nameError || repoError) {
      return toast.error("Please resolve duplicate warnings before submitting.");
    }

    setSubmitting(true);
    try {
      const submittedData = {
        name: form.name,
        short_description: form.short_description,
        description: form.description,
        author: form.author,
        icon_url: form.icon_url,
        icon_color: form.icon_color,
        repo_url: form.repo_url,
        website_url: form.website_url,
        discord_url: form.discord_url,
        platforms: form.platforms,
        tags: form.tags,
        ...(type === 'app' ? {
          version: form.version,
          download_url: form.download_url,
          content_types: form.content_types,
          fork_of: null,
        } : {
          types: form.content_types,
          compatible_with: form.compatible_with,
          source_url: form.source_url,
          language: form.language,
          auto_url: form.auto_url,
          manual_url: form.manual_url,
        })
      };

      const payload = {
        submissionType: type,
        submittedData,
        turnstileToken,
        submitterName: form.submitter_name,
        submitterContact: form.submitter_contact,
        submitterNotes: form.submitter_notes,
      };

      const { data, error } = await supabase.functions.invoke('submit-content', {
        body: payload
      });

      if (error) {
        const serverMsg = data?.error || error.message;
        throw new Error(serverMsg);
      }
      if (!data.success) {
        const detailMsg = data.details ? ` (${JSON.stringify(data.details)})` : '';
        throw new Error((data.error || "Submission failed") + detailMsg);
      }

      setStep(3);
      toast.success("Submission received!");
    } catch (err: any) {
      console.error(err);
      toast.error("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }




  const renderSelection = () => (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-4">
          What would you like to contribute?
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Help expand the library by submitting your favorite apps and extensions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* App Card */}
        <button
          onClick={() => { setType('app'); setStep(1); }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bg-elev-1)] to-[var(--bg-elev-2)] border border-[var(--divider)] p-8 text-left transition-all hover:border-[var(--brand)] hover:shadow-[0_0_40px_-10px_rgba(var(--brand-rgb),0.3)]"
        >
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">New Application</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Submit a standalone application (Android, Windows, iOS, etc.) for anime, manga, or novel tracking/reading.
            </p>
            <div className="flex items-center text-[var(--brand)] font-semibold group-hover:translate-x-1 transition-transform">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </button>

        {/* Extension Card */}
        <button
          onClick={() => { setType('extension'); setStep(1); }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bg-elev-1)] to-[var(--bg-elev-2)] border border-[var(--divider)] p-8 text-left transition-all hover:border-[var(--brand-secondary)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]"
        >
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 transition-transform duration-300">
              <Puzzle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">New Extension</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Any extension or plugin that enhances the app experience.
            </p>
            <div className="flex items-center text-purple-500 font-semibold group-hover:translate-x-1 transition-transform">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );


  const renderGuidelines = () => (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in slide-in-from-right-8 duration-300">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center">Submission Guidelines</h2>

      <div className="bg-[var(--bg-elev-1)] border border-[var(--divider)] rounded-2xl p-8 space-y-6 mb-8">
        <div className="flex gap-4">
          <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">Public Content Only</h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Ensure the content is safe for general audiences or properly tagged (e.g., NSFW).</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="mt-1"><AlertCircle className="w-5 h-5 text-yellow-500" /></div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">Open Source Preferred</h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">We prioritize open-source projects. Please provide a repository URL if available.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">Valid Resources</h4>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Double-check all URLs (Download, Website, Discord) before submitting.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <AdminButton variant="secondary" onClick={() => setStep(0)}>Back</AdminButton>
        <AdminButton onClick={() => setStep(2)}>I Understand, Proceed</AdminButton>
      </div>
    </div>
  );


  const renderForm = () => (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setStep(0)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Submit {type === 'app' ? 'App' : 'Extension'}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* GitHub Fetcher */}
          <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
              <Github className="w-5 h-5" /> Import from GitHub
            </h3>
            <div className="flex gap-3 items-end">
              <AdminFormField label="Repository URL" className="flex-1">
                <AdminInput
                  placeholder="https://github.com/owner/repo"
                  value={form.repo_url}
                  onChange={e => setForm(f => ({ ...f, repo_url: e.target.value }))}
                  className={repoError ? "!border-red-500" : ""}
                />
                {repoError && (
                  <div className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{repoError.message}</span>
                    {repoError.url && (
                      <a href={repoError.url} target="_blank" rel="noreferrer" className="underline font-medium hover:text-red-400">
                        View
                      </a>
                    )}
                  </div>
                )}
              </AdminFormField>
              <AdminButton onClick={handleGithubFetch} disabled={fetchingGithub || !form.repo_url} variant="secondary">
                {fetchingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Fetch Data</span>
              </AdminButton>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Auto-fills Name, Description, Author, Tags, and Icon.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Core Details</h3>
            <AdminFormField label="Name" required>
              <AdminInput
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={type === 'app' ? "Mihon" : "Mangadex Extension"}
                className={nameError ? "!border-red-500" : ""}
              />
              {nameError && (
                <div className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>{nameError.message}</span>
                  {nameError.url && (
                    <a href={nameError.url} target="_blank" rel="noreferrer" className="underline font-medium hover:text-red-400">
                      View
                    </a>
                  )}
                </div>
              )}
            </AdminFormField>

            <div className="grid sm:grid-cols-2 gap-4">
              <AdminFormField label="Author" required>
                <AdminInput
                  value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  placeholder="Developer Name"
                />
              </AdminFormField>
              {type === 'app' ? (
                <AdminFormField label="Version">
                  <AdminInput
                    value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    placeholder="v1.0.0"
                  />
                </AdminFormField>
              ) : (
                <AdminFormField label="Language">
                  <AdminInput
                    value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    placeholder="en, es, multi"
                  />
                </AdminFormField>
              )}
            </div>

            <AdminFormField label="Short Description (Bio)">
              <AdminTextarea
                value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                className="h-20"
                placeholder="Brief one-line summary..."
              />
            </AdminFormField>

            <AdminFormField label={type === 'extension' ? "Overview (Long Description)" : "Long Description"}>
              <AdminTextarea
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="h-32"
                placeholder="Detailed description of features, sources, and what makes it special... (optional)"
              />
            </AdminFormField>

            <AdminSmartSelect
              label={type === 'app' ? "Content Types" : "Extension Types"}
              value={form.content_types}
              onChange={val => setForm(f => ({ ...f, content_types: val }))}
              options={type === 'app' ? APP_CONTENT_TYPES : EXT_CONTENT_TYPES}
              placeholder="Select types..."
            />
          </div>

          <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Links & Resources</h3>
            <AdminFormField label="Website URL">
              <AdminInput
                value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                placeholder="https://..."
              />
            </AdminFormField>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminFormField label={type === 'app' ? "Download URL" : "Source URL"}>
                <AdminInput
                  value={type === 'app' ? form.download_url : form.source_url}
                  onChange={e => setForm(f => type === 'app' ? ({ ...f, download_url: e.target.value }) : ({ ...f, source_url: e.target.value }))}
                  placeholder="https://..."
                />
              </AdminFormField>
              <AdminFormField label="Discord URL">
                <AdminInput
                  value={form.discord_url} onChange={e => setForm(f => ({ ...f, discord_url: e.target.value }))}
                  placeholder="https://discord.gg/..."
                />
              </AdminFormField>
            </div>
          </div>

          {type === 'extension' && (
            <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5" /> Install URLs
              </h3>
              <AdminFormField label="Auto Install URL">
                <AdminInput
                  value={form.auto_url} onChange={e => setForm(f => ({ ...f, auto_url: e.target.value }))}
                  placeholder="tachiyomi://add-repo?url=..."
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">Deep link that triggers automatic extension source installation.</p>
              </AdminFormField>
              <AdminFormField label="Manual Install URL">
                <div className="flex gap-2">
                  <AdminInput
                    value={form.manual_url} onChange={e => setForm(f => ({ ...f, manual_url: e.target.value }))}
                    placeholder="https://raw.githubusercontent.com/..."
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (form.manual_url) {
                        navigator.clipboard.writeText(form.manual_url);
                        setCopiedManual(true);
                        toast.success('Copied!');
                        setTimeout(() => setCopiedManual(false), 2000);
                      }
                    }}
                    disabled={!form.manual_url}
                    className="px-3 rounded-lg border border-[var(--divider)] hover:bg-[var(--bg-elev-1)] disabled:opacity-50 transition-colors"
                  >
                    {copiedManual ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">URL users can copy to manually add the extension source.</p>
              </AdminFormField>

              <AdminSmartSelect
                label="Compatible Apps"
                value={form.compatible_with}
                onChange={val => setForm(f => ({ ...f, compatible_with: val }))}
                options={appOptions}
                placeholder="Select compatible apps..."
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Icon & Appearance */}
          <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Appearance
            </h3>
            <AdminFormField label="Icon URL">
              <AdminInput
                value={form.icon_url} onChange={e => setForm(f => ({ ...f, icon_url: e.target.value }))}
                placeholder="https://example.com/icon.png"
              />
            </AdminFormField>

            {/* Preview */}
            <div className="flex gap-4 items-center">
              <div
                className="w-16 h-16 rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: form.icon_color || undefined }}
              >
                {form.icon_url ? (
                  <img src={form.icon_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-[var(--text-secondary)]">Preview</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Label>Brand Color</Label>
                <div className="flex gap-2">
                  <AdminInput
                    value={form.icon_color}
                    onChange={e => setForm(f => ({ ...f, icon_color: e.target.value }))}
                    placeholder="#HEX"
                    className="font-mono text-xs py-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleColorExtraction(form.icon_url)}
                    disabled={extractingColor || !form.icon_url}
                    className="px-3 rounded-lg border border-[var(--divider)] hover:bg-[var(--bg-elev-1)] disabled:opacity-50"
                  >
                    {extractingColor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Metadata</h3>
            <AdminSmartSelect
              label="Platforms"
              value={form.platforms}
              onChange={val => setForm(f => ({ ...f, platforms: val }))}
              options={PLATFORM_OPTIONS}
              placeholder="Platforms..."
            />
            <div className="pt-2">
              <AdminSmartSelect
                label="Tags"
                value={form.tags}
                onChange={val => setForm(f => ({ ...f, tags: val }))}
                options={type === 'app' ? APP_TAGS : EXT_TAGS}
                placeholder="Tags (Free, Paid, NSFW...)"
              />
            </div>
          </div>

          {/* Submitter Info */}
          <div className="p-6 rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Your Details
            </h3>
            <p className="text-xs text-[var(--text-secondary)] -mt-2 mb-2">Used for clarification only. Not published.</p>
            <AdminFormField label="Your Name (Optional)">
              <AdminInput
                value={form.submitter_name} onChange={e => setForm(f => ({ ...f, submitter_name: e.target.value }))}
                placeholder="Nickname"
              />
            </AdminFormField>
            <AdminFormField label="Contact (Telegram/Email)">
              <AdminInput
                value={form.submitter_contact} onChange={e => setForm(f => ({ ...f, submitter_contact: e.target.value }))}
                placeholder="@username or email"
              />
            </AdminFormField>
            <AdminFormField label="Notes for Admin">
              <AdminTextarea
                value={form.submitter_notes} onChange={e => setForm(f => ({ ...f, submitter_notes: e.target.value }))}
                className="h-24"
                placeholder="Any additional notes, context, or special requests for the admin team..."
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                <StickyNote className="w-3 h-3" /> Visible only to admins during review.
              </p>
            </AdminFormField>
          </div>

          {/* Submit Action */}
          <div className="space-y-4 pt-4">
            {/* Turnstile */}
            <div className="flex justify-center">
              <Turnstile
                sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onVerify={(token) => setTurnstileToken(token)}
                theme="auto"
              />
            </div>

            <AdminButton
              onClick={handleSubmit}
              disabled={submitting || !turnstileToken}
              className="w-full py-4 text-base shadow-lg shadow-brand/20"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
              Submit for Review
            </AdminButton>
          </div>

        </div>
      </div>
    </div>
  );


  const renderSuccess = () => (
    <div className="max-w-xl mx-auto py-20 px-4 text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Submission Received!</h2>
      <p className="text-[var(--text-secondary)] text-lg mb-8">
        Thank you for contributing to the library. Your submission has been queued for review by our moderators.
      </p>
      <div className="flex justify-center gap-4">
        <AdminButton variant="secondary" onClick={() => { setStep(0); setType(null); setForm(prev => ({ ...prev, name: '' })); }}>
          Submit Another
        </AdminButton>
        <AdminButton onClick={() => navigate('/')}>
          Return Home
        </AdminButton>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-root)]">
      <div className="pt-24 pb-12">
        {step === 0 && renderSelection()}
        {step === 1 && renderGuidelines()}
        {step === 2 && renderForm()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
}
