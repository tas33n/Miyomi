import React, { useState } from 'react';
import { Eye, Edit2 } from 'lucide-react';
import { AdminTextarea } from './AdminFormElements';
import { MarkdownRenderer } from '../MarkdownRenderer';

interface AdminMarkdownEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    className?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    style?: React.CSSProperties;
}

export function AdminMarkdownEditor({ label, className = '', value, onChange, ...props }: AdminMarkdownEditorProps) {
    const [isPreview, setIsPreview] = useState(false);

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between">
                {label && (
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {label}
                    </label>
                )}
                <div className="flex bg-[var(--bg-elev-1)] rounded-lg p-1 border border-[var(--divider)]">
                    <button
                        type="button"
                        onClick={() => setIsPreview(false)}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${!isPreview
                            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Edit2 className="w-3 h-3" />
                        Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsPreview(true)}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${isPreview
                            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        <Eye className="w-3 h-3" />
                        Preview
                    </button>
                </div>
            </div>

            {isPreview ? (
                <div
                    className="w-full px-4 py-3 rounded-xl border min-h-[120px] max-h-[500px] overflow-y-auto"
                    style={{
                        background: 'var(--bg-elev-1)',
                        borderColor: 'var(--divider)',
                    }}
                >
                    {value ? (
                        <MarkdownRenderer content={value} />
                    ) : (
                        <p className="text-[var(--text-secondary)] text-sm italic">Nothing to preview</p>
                    )}
                </div>
            ) : (
                <AdminTextarea
                    value={value}
                    onChange={onChange}
                    className="font-mono text-sm"
                    {...props}
                />
            )}
        </div>
    );
}
