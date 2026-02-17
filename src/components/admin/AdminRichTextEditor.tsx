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
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Quote,
    Image as ImageIcon, Youtube as YoutubeIcon, Link as LinkIcon,
    Heading1, Heading2, Heading3,
    Undo, Redo, Code, Eye, Columns
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';

interface AdminRichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    className?: string;
    placeholder?: string;
}

/**
 * Detects if HTML content contains advanced structures that TipTap would strip.
 * TipTap does not understand custom divs with inline styles, grid layouts, etc.
 */
function detectAdvancedHtml(html: string): boolean {
    if (!html) return false;
    return (
        (html.includes('<div') && html.includes('style=')) ||
        html.includes('grid-template') ||
        html.includes('var(--')
    );
}

export function AdminRichTextEditor({ value, onChange, className = '', placeholder }: AdminRichTextEditorProps) {
    // Detect advanced HTML on initial mount to choose the right default mode
    const isAdvanced = useMemo(() => detectAdvancedHtml(value), []);
    const [mode, setMode] = useState<'visual' | 'html' | 'preview' | 'split'>(() =>
        isAdvanced ? 'split' : 'visual'
    );

    // Refs to prevent stale closures inside TipTap's onUpdate callback
    const modeRef = useRef(mode);
    const onChangeRef = useRef(onChange);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

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
        // CRITICAL: Don't load advanced HTML into TipTap — it will strip custom styles.
        // Only load simple content. Advanced content is edited via HTML/Split mode.
        content: isAdvanced ? '' : value,
        onUpdate: ({ editor }) => {
            // Only propagate TipTap's output when user is actively in Visual mode.
            // This prevents TipTap from corrupting advanced HTML in other modes.
            if (modeRef.current === 'visual') {
                onChangeRef.current(editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutube = () => {
        const url = window.prompt('Enter YouTube URL');
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const ToolbarButton = ({ onClick, isActive = false, icon: Icon, title }: any) => (
        <button
            onClick={onClick}
            className={`p-2 rounded hover:bg-[var(--bg-elev-2)] transition-colors ${isActive ? 'bg-[var(--bg-elev-2)] text-[var(--brand)]' : 'text-[var(--text-secondary)]'}`}
            title={title}
            type="button"
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    const handleModeChange = (newMode: 'visual' | 'html' | 'preview' | 'split') => {
        if (newMode === 'visual') {
            // Warn if content has advanced HTML that TipTap will destroy
            const currentlyAdvanced = detectAdvancedHtml(value);
            if (currentlyAdvanced) {
                const confirmed = window.confirm(
                    '⚠️ Visual mode will simplify your HTML and remove custom styling (divs, inline styles, grid layouts, CSS variables).\n\nUse HTML or Split mode for advanced content.\n\nSwitch anyway?'
                );
                if (!confirmed) return;
            }
            // Sync the current value into TipTap (without triggering onUpdate propagation for non-visual)
            editor?.commands.setContent(value || '');
        }
        setMode(newMode);
    };

    // DOMPurify config matching GuideDetailPage
    const sanitizeConfig = {
        ADD_TAGS: ['iframe', 'style', 'div'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'class', 'target'],
    };

    return (
        <div className={`border rounded-xl overflow-hidden ${className}`} style={{ background: 'var(--bg-surface)', borderColor: 'var(--divider)' }}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b bg-[var(--bg-elev-1)]" style={{ borderColor: 'var(--divider)' }}>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />

                <div className="w-px bg-[var(--divider)] mx-1 self-stretch" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={Heading1} title="H1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Heading2} title="H2" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} icon={Heading3} title="H3" />

                <div className="w-px bg-[var(--divider)] mx-1 self-stretch" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Quote" />

                <div className="w-px bg-[var(--divider)] mx-1 self-stretch" />

                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Align Left" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Align Center" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Align Right" />

                <div className="w-px bg-[var(--divider)] mx-1 self-stretch" />

                <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Link" />
                <ToolbarButton onClick={addImage} icon={ImageIcon} title="Image" />
                <ToolbarButton onClick={addYoutube} icon={YoutubeIcon} title="YouTube" />

                <div className="flex-1" />

                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />

                <div className="w-px bg-[var(--divider)] mx-1 self-stretch" />

                <ToolbarButton
                    onClick={() => handleModeChange(mode === 'preview' ? 'visual' : 'preview')}
                    isActive={mode === 'preview'}
                    icon={Eye}
                    title="Preview"
                />

                <ToolbarButton
                    onClick={() => handleModeChange(mode === 'split' ? 'visual' : 'split')}
                    isActive={mode === 'split'}
                    icon={Columns}
                    title="Split View (Live Edit)"
                />

                <ToolbarButton
                    onClick={() => handleModeChange(mode === 'html' ? 'visual' : 'html')}
                    isActive={mode === 'html'}
                    icon={Code}
                    title="HTML Source"
                />
            </div>

            {/* Mode indicator for advanced content */}
            {isAdvanced && mode === 'visual' && (
                <div className="px-4 py-2 text-xs border-b flex items-center gap-2" style={{ background: 'var(--chip-bg)', borderColor: 'var(--divider)', color: 'var(--text-secondary)' }}>
                    ⚠️ Visual mode simplifies advanced HTML. Use <button onClick={() => handleModeChange('split')} className="underline font-semibold" style={{ color: 'var(--brand)' }}>Split View</button> for full-fidelity editing.
                </div>
            )}

            {/* Visual Editor */}
            {mode === 'visual' && <EditorContent editor={editor} />}

            {/* HTML Source Editor */}
            {mode === 'html' && (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-4 font-mono text-sm focus:outline-none min-h-[500px] resize-y"
                    style={{
                        background: 'var(--bg-elev-1)',
                        color: 'var(--text-primary)',
                    }}
                    placeholder="Enter raw HTML here..."
                />
            )}

            {/* Read-only Preview */}
            {mode === 'preview' && (
                <div
                    className="w-full p-6 min-h-[500px] prose prose-invert max-w-none prose-headings:font-['Poppins',sans-serif] prose-p:font-['Inter',sans-serif] prose-a:text-[var(--brand)] prose-img:rounded-xl prose-img:shadow-lg prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)]"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value, sanitizeConfig) }}
                />
            )}

            {/* Split View: HTML Editor + Live Preview */}
            {mode === 'split' && (
                <div className="grid grid-cols-2 h-[600px] divide-x" style={{ borderColor: 'var(--divider)' }}>
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-4 font-mono text-xs focus:outline-none resize-none h-full"
                        style={{
                            background: 'var(--bg-elev-1)',
                            color: 'var(--text-primary)',
                        }}
                        placeholder="Enter raw HTML here..."
                    />
                    <div
                        className="w-full p-6 h-full overflow-y-auto prose prose-invert max-w-none prose-headings:font-['Poppins',sans-serif] prose-p:font-['Inter',sans-serif] prose-a:text-[var(--brand)] prose-img:rounded-xl prose-img:shadow-lg prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)]"
                        style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value, sanitizeConfig) }}
                    />
                </div>
            )}
        </div>
    );
}
