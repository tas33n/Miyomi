import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, X, Send } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminButton, AdminFormField, AdminInput } from './AdminFormElements';

export function TelegramSettingsForm() {
    const { isSuperAdmin } = useAdmin();
    const [botToken, setBotToken] = useState('');
    const [chatIds, setChatIds] = useState<string[]>([]);
    const [newChatId, setNewChatId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            loadSettings();
        }
    }, [isSuperAdmin]);

    async function loadSettings() {
        setLoading(true);
        try {
            // Fetch bot token
            const { data: tokenData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'telegram_bot_token')
                .single();

            if (tokenData?.value) {
                setBotToken(tokenData.value as string);
            }

            // Fetch chat IDs
            const { data: chatIdsData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'telegram_chat_ids')
                .single();

            if (chatIdsData?.value && Array.isArray(chatIdsData.value)) {
                setChatIds(chatIdsData.value as string[]);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load Telegram settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!isSuperAdmin) return;

        setSaving(true);
        try {
            // Update bot token
            await supabase
                .from('settings')
                .update({ value: botToken })
                .eq('key', 'telegram_bot_token');

            // Update chat IDs
            await supabase
                .from('settings')
                .update({ value: chatIds })
                .eq('key', 'telegram_chat_ids');

            toast.success('Telegram settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save Telegram settings');
        } finally {
            setSaving(false);
        }
    }

    async function handleTest() {
        if (chatIds.length === 0) {
            toast.error('Please add at least one chat ID');
            return;
        }

        setTesting(true);
        try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(`${supabaseUrl}/functions/v1/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                },
                body: JSON.stringify({
                    type: 'other',
                    message: 'This is a test message from Miyomi Admin Settings.',
                    page: 'Admin Settings',
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                toast.success('Test message sent successfully!');
            } else {
                toast.error('Failed to send test message');
            }
        } catch (error) {
            console.error('Error sending test message:', error);
            toast.error('Failed to send test message');
        } finally {
            setTesting(false);
        }
    }

    function handleAddChatId() {
        if (!newChatId.trim()) {
            toast.error('Please enter a chat ID');
            return;
        }

        if (chatIds.includes(newChatId.trim())) {
            toast.error('This chat ID is already added');
            return;
        }

        setChatIds([...chatIds, newChatId.trim()]);
        setNewChatId('');
    }

    function handleRemoveChatId(chatId: string) {
        setChatIds(chatIds.filter((id) => id !== chatId));
    }

    if (!isSuperAdmin) {
        return (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                Only superadmins can manage Telegram settings.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                Loading...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold font-['Poppins',sans-serif]" style={{ color: 'var(--text-primary)' }}>
                Telegram Integration
            </h2>

            <AdminFormField label="Bot Token">
                <AdminInput
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Enter Telegram bot token"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Get your bot token from @BotFather on Telegram
                </p>
            </AdminFormField>

            <AdminFormField label="Chat IDs">
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <AdminInput
                            type="text"
                            value={newChatId}
                            onChange={(e) => setNewChatId(e.target.value)}
                            placeholder="Enter chat ID"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddChatId();
                                }
                            }}
                        />
                        <AdminButton onClick={handleAddChatId} variant="secondary">
                            <Plus className="w-4 h-4" />
                        </AdminButton>
                    </div>

                    {chatIds.length > 0 && (
                        <div className="space-y-2">
                            {chatIds.map((chatId) => (
                                <div
                                    key={chatId}
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                    style={{ background: 'var(--bg-elev-1)', borderColor: 'var(--divider)' }}
                                >
                                    <span className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {chatId}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveChatId(chatId)}
                                        className="p-1 rounded hover:bg-[var(--chip-bg)] transition-colors"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Feedback messages will be sent to all configured chat IDs
                    </p>
                </div>
            </AdminFormField>

            <div className="flex gap-3">
                <AdminButton onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </AdminButton>
                <AdminButton onClick={handleTest} disabled={testing || chatIds.length === 0} variant="secondary">
                    <Send className="w-4 h-4 mr-2" />
                    {testing ? 'Sending...' : 'Send Test Message'}
                </AdminButton>
            </div>
        </div>
    );
}
