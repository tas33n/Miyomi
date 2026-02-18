import DOMPurify from 'dompurify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { marked } from 'marked';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote,
    Image as ImageIcon, Youtube as YoutubeIcon, Link as LinkIcon,
    Heading1, Heading2, Heading3,
    Undo, Redo, Code, Eye, Columns,
    Maximize2, Minimize2, FileCode, FileText, Minus
} from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/* ─── Types ─── */
interface AdminRichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    format?: 'html' | 'markdown';
    onFormatChange?: (format: 'html' | 'markdown') => void;
    className?: string;
    placeholder?: string;
}

type EditorMode = 'visual' | 'html' | 'markdown' | 'preview' | 'split';

/* ─── Marked config (GFM) ─── */
marked.setOptions({ breaks: true, gfm: true });

/* ─── Helpers ─── */
const detectAdvancedHtml = (v: string) =>
    !!v && ((v.includes('<div') && v.includes('style=')) || v.includes('grid-template') || v.includes('var(--'));

const SANITIZE_CFG = {
    ADD_TAGS: ['iframe', 'style', 'div', 'details', 'summary', 'video', 'source'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'class', 'target', 'open', 'controls', 'autoplay'],
};

/* ─── Component ─── */
export function AdminRichTextEditor({
    value, onChange, format = 'html', onFormatChange, className = '', placeholder,
}: AdminRichTextEditorProps) {

    const isAdvanced = useMemo(() => detectAdvancedHtml(value), []);
    const [mode, setMode] = useState<EditorMode>(() => {
        if (format === 'markdown') return 'markdown';
        if (isAdvanced) return 'split';
        return 'visual';
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Refs for stable TipTap callbacks
    const modeRef = useRef(mode);
    const onChangeRef = useRef(onChange);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    // ESC to exit fullscreen
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [isFullscreen]);

    /* ─── TipTap editor (only for visual mode) ─── */
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image.configure({ inline: true }),
            Youtube.configure({ controls: false }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
        ],
        content: (isAdvanced || format === 'markdown') ? '' : value,
        onUpdate: ({ editor }) => {
            if (modeRef.current === 'visual') onChangeRef.current(editor.getHTML());
        },
        editorProps: {
            attributes: { class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] p-5' },
        },
    });

    /* ─── Preview renderer ─── */
    const previewHtml = useMemo(() => {
        const src = value || '';
        if (format === 'markdown' || mode === 'markdown') {
            try { return DOMPurify.sanitize(marked.parse(src) as string, SANITIZE_CFG); }
            catch { return src; }
        }
        return DOMPurify.sanitize(src, SANITIZE_CFG);
    }, [value, format, mode]);

    /* ─── Markdown insertion helper ─── */
    const insertMd = useCallback((before: string, after = '', placeholder = '') => {
        const ta = textareaRef.current;
        if (!ta) return;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const sel = value.substring(s, e) || placeholder;
        onChange(value.substring(0, s) + before + sel + after + value.substring(e));
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(s + before.length, s + before.length + sel.length);
        });
    }, [value, onChange]);

    const insertLineMd = useCallback((prefix: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const s = ta.selectionStart;
        const lineStart = value.lastIndexOf('\n', s - 1) + 1;
        onChange(value.substring(0, lineStart) + prefix + value.substring(lineStart));
        requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, s + prefix.length); });
    }, [value, onChange]);

    /* ─── Keyboard shortcuts in textarea ─── */
    const handleTextareaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.currentTarget;
            const s = ta.selectionStart, end = ta.selectionEnd;
            onChange(value.substring(0, s) + '  ' + value.substring(end));
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
        }
        if ((e.ctrlKey || e.metaKey) && mode === 'markdown') {
            if (e.key === 'b') { e.preventDefault(); insertMd('**', '**', 'bold'); }
            if (e.key === 'i') { e.preventDefault(); insertMd('*', '*', 'italic'); }
            if (e.key === 'k') { e.preventDefault(); insertMd('[', '](url)', 'link text'); }
        }
    }, [value, onChange, mode, insertMd]);

    /* ─── Mode switching ─── */
    const handleModeChange = useCallback((newMode: EditorMode) => {
        if (newMode === 'visual') {
            if (detectAdvancedHtml(value) || format === 'markdown') {
                if (!window.confirm('⚠️ Visual mode simplifies content. Use Markdown/HTML/Split mode instead.\n\nSwitch anyway?')) return;
            }
            editor?.commands.setContent(value || '');
        }
        if (newMode === 'markdown' && format !== 'markdown') onFormatChange?.('markdown');
        if (newMode === 'html' && format !== 'html') onFormatChange?.('html');
        setMode(newMode);
    }, [value, format, editor, onFormatChange]);

    if (!editor) return null;

    /* ─── Shared sub-components ─── */
    const Btn = ({ onClick, active = false, icon: Icon, title, children }: any) => (
        <button
            onClick={onClick} type="button" title={title}
            className={`p-1.5 rounded-md transition-colors text-xs ${active
                ? 'bg-[var(--brand)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--text-primary)]'}`}
        >
            {Icon ? <Icon className="w-4 h-4" /> : children}
        </button>
    );

    const Sep = () => <div className="w-px self-stretch mx-1 opacity-20" style={{ background: 'var(--text-secondary)' }} />;

    const ModeTab = ({ mode: m, label, icon: Icon }: { mode: EditorMode; label: string; icon: any }) => (
        <button
            type="button" onClick={() => handleModeChange(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === m
                ? 'bg-[var(--brand)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--text-primary)]'
                }`}
        >
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );

    /* ─── Textarea (shared for MD + HTML modes) ─── */
    const EditorTextarea = ({ className: cls = '' }: { className?: string }) => (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            className={`w-full p-5 font-mono text-sm leading-relaxed focus:outline-none resize-none ${cls}`}
            style={{ background: 'transparent', color: 'var(--text-primary)', caretColor: 'var(--brand)' }}
            placeholder={mode === 'markdown' ? '# Start writing in Markdown...\n\nUse **bold**, *italic*, `code`, and more...' : 'Enter HTML here...'}
            spellCheck={mode === 'markdown'}
        />
    );

    /* ─── Preview Pane ─── */
    const PreviewPane = ({ className: cls = '' }: { className?: string }) => (
        <div
            className={`prose prose-invert max-w-none p-6 prose-headings:font-['Poppins',sans-serif] prose-p:font-['Inter',sans-serif] prose-a:text-[var(--brand)] prose-img:rounded-xl prose-img:shadow-lg prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-code:text-[var(--brand)] prose-code:bg-[var(--chip-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-pre:bg-[var(--bg-elev-1)] prose-pre:border prose-pre:border-[var(--divider)] prose-pre:rounded-xl prose-blockquote:border-l-[var(--brand)] prose-blockquote:bg-[var(--chip-bg)] prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-hr:border-[var(--divider)] ${cls}`}
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:var(--text-secondary);opacity:0.5">Preview will appear here...</p>' }}
        />
    );

    /* ─── Markdown toolbar ─── */
    const MarkdownToolbar = () => (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b" style={{ borderColor: 'var(--divider)' }}>
            <Btn onClick={() => insertLineMd('# ')} title="Heading 1" icon={Heading1} />
            <Btn onClick={() => insertLineMd('## ')} title="Heading 2" icon={Heading2} />
            <Btn onClick={() => insertLineMd('### ')} title="Heading 3" icon={Heading3} />
            <Sep />
            <Btn onClick={() => insertMd('**', '**', 'bold')} title="Bold (Ctrl+B)" icon={Bold} />
            <Btn onClick={() => insertMd('*', '*', 'italic')} title="Italic (Ctrl+I)" icon={Italic} />
            <Btn onClick={() => insertMd('~~', '~~', 'strikethrough')} title="Strikethrough" icon={Strikethrough} />
            <Btn onClick={() => insertMd('`', '`', 'code')} title="Inline Code" icon={Code} />
            <Sep />
            <Btn onClick={() => insertMd('[', '](url)', 'link text')} title="Link (Ctrl+K)" icon={LinkIcon} />
            <Btn onClick={() => insertMd('![', '](image-url)', 'alt text')} title="Image" icon={ImageIcon} />
            <Sep />
            <Btn onClick={() => insertLineMd('- ')} title="Bullet List" icon={List} />
            <Btn onClick={() => insertLineMd('1. ')} title="Numbered List" icon={ListOrdered} />
            <Btn onClick={() => insertLineMd('> ')} title="Quote" icon={Quote} />
            <Btn onClick={() => insertMd('\n---\n')} title="Horizontal Rule" icon={Minus} />
            <Sep />
            <Btn onClick={() => insertMd('\n```\n', '\n```\n', 'code block')} title="Code Block">
                <span className="text-xs font-mono">{'{}'}</span>
            </Btn>
            <Btn onClick={() => insertMd('\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n')} title="Table">
                <span className="text-xs font-mono">⊞</span>
            </Btn>
        </div>
    );

    /* ─── Visual mode toolbar ─── */
    const VisualToolbar = () => (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b" style={{ borderColor: 'var(--divider)' }}>
            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={Heading1} title="H1" />
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="H2" />
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="H3" />
            <Sep />
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet List" />
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Quote" />
            <Sep />
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Left" />
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center" />
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Right" />
            <Sep />
            <Btn onClick={() => { const url = window.prompt('Enter URL', editor.getAttributes('link').href); if (url === null) return; url === '' ? editor.chain().focus().extendMarkRange('link').unsetLink().run() : editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run(); }} active={editor.isActive('link')} icon={LinkIcon} title="Link" />
            <Btn onClick={() => { const url = window.prompt('Enter image URL'); if (url) editor.chain().focus().setImage({ src: url }).run(); }} icon={ImageIcon} title="Image" />
            <Btn onClick={() => { const url = window.prompt('Enter YouTube URL'); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); }} icon={YoutubeIcon} title="YouTube" />
            <div className="flex-1" />
            <Btn onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
            <Btn onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
        </div>
    );

    /* ─── Wrapper + render ─── */
    const editorHeight = isFullscreen ? 'h-full' : 'min-h-[600px]';

    return (
        <div
            className={`flex flex-col overflow-hidden ${isFullscreen
                ? 'fixed inset-0 z-[9999] bg-[var(--bg-page)]'
                : `border rounded-xl ${className}`
                }`}
            style={!isFullscreen ? { background: 'var(--bg-surface)', borderColor: 'var(--divider)' } : undefined}
        >
            {/* ─── Top bar: mode tabs + fullscreen ─── */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b flex-shrink-0" style={{ background: 'var(--bg-elev-1)', borderColor: 'var(--divider)' }}>
                {/* Mode tabs */}
                <div className="flex items-center gap-1.5">
                    <ModeTab mode="markdown" label="Markdown" icon={FileText} />
                    <ModeTab mode="html" label="HTML" icon={FileCode} />
                    <ModeTab mode="visual" label="Visual" icon={Bold} />
                    <Sep />
                    <ModeTab mode="preview" label="Preview" icon={Eye} />
                    <ModeTab mode="split" label="Split" icon={Columns} />
                </div>

                {/* Fullscreen + format indicator */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--chip-bg)', color: 'var(--text-secondary)' }}>
                        {format.toUpperCase()}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(f => !f)}
                        className="p-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-elev-2)] hover:text-[var(--text-primary)] transition-colors"
                        title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* ─── Context toolbar ─── */}
            {mode === 'markdown' && <MarkdownToolbar />}
            {mode === 'visual' && <VisualToolbar />}

            {/* ─── Editor body ─── */}
            <div className={`flex-1 overflow-hidden ${editorHeight}`}>
                {/* Visual */}
                {mode === 'visual' && (
                    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>
                        <EditorContent editor={editor} />
                    </div>
                )}

                {/* Markdown */}
                {mode === 'markdown' && (
                    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-elev-1)' }}>
                        <EditorTextarea className="h-full" />
                    </div>
                )}

                {/* HTML */}
                {mode === 'html' && (
                    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-elev-1)' }}>
                        <EditorTextarea className="h-full" />
                    </div>
                )}

                {/* Preview */}
                {mode === 'preview' && (
                    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>
                        <PreviewPane />
                    </div>
                )}

                {/* Split */}
                {mode === 'split' && (
                    <div className="grid grid-cols-2 h-full divide-x" style={{ borderColor: 'var(--divider)' }}>
                        <div className="overflow-y-auto" style={{ background: 'var(--bg-elev-1)' }}>
                            <EditorTextarea className="h-full" />
                        </div>
                        <div className="overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>
                            <PreviewPane />
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Status bar ─── */}
            <div className="flex items-center justify-between px-4 py-1.5 text-[10px] border-t flex-shrink-0" style={{ background: 'var(--bg-elev-1)', borderColor: 'var(--divider)', color: 'var(--text-secondary)' }}>
                <span>{value.length.toLocaleString()} chars</span>
                <div className="flex items-center gap-3">
                    {mode === 'markdown' && <span>Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link · Tab Indent</span>}
                    {isFullscreen && <span>Press Esc to exit</span>}
                </div>
            </div>
        </div>
    );
}
