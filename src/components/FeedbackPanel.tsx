import { useState } from 'react';
import {
  X,
  Plus,
  AlertCircle,
  XOctagon,
  Lightbulb,
  Heart,
  MessageSquare,
  ChevronLeft,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

type FeedbackOption = {
  id: string;
  label: string;
  icon: typeof Plus;
  accent: string;
  helper?: string;
};

const feedbackOptions: FeedbackOption[] = [
  { id: 'submit', label: 'Submit link', icon: Plus, accent: '#a855f7', helper: 'Share a new source with everyone.' },
  { id: 'update', label: 'Update link', icon: AlertCircle, accent: '#fb7185', helper: 'Let us know if something changed.' },
  { id: 'report', label: 'Report bad / dead link', icon: XOctagon, accent: '#f97316', helper: 'Flag a broken or unsafe link.' },
  { id: 'suggest', label: 'Suggest edit', icon: Lightbulb, accent: '#facc15', helper: 'Recommend improvements or tweaks.' },
  { id: 'love', label: 'Love the wiki', icon: Heart, accent: '#ec4899', helper: 'Tell us what is working well.' },
  { id: 'other', label: 'Something else', icon: MessageSquare, accent: '#60a5fa', helper: 'Anything that does not fit above.' },
];

interface FeedbackPanelProps {
  page: string;
  onClose: () => void;
}

export function FeedbackPanel({ page, onClose }: FeedbackPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);

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
          type: selectedOption,
          message: message.trim(),
          page,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        onClose();
        handleReset();
      } else {
        toast.error('Failed to send feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOptionData = feedbackOptions.find((option) => option.id === selectedOption);
  const accentColor = selectedOptionData?.accent ?? 'var(--brand)';

  const getPlaceholder = (optionId: string) => {
    switch (optionId) {
      case 'submit':
        return 'Tip: Did you know that starring our GitHub repo doubles the chances that your feedback will be read?';
      case 'update':
        return 'Tip: Please include the old and new information if possible.';
      case 'report':
        return 'Tip: Please specify the exact link and what is wrong with it.';
      case 'suggest':
        return 'Tip: Describe your suggestion clearly and why it would be helpful.';
      case 'love':
        return 'Tip: We love hearing positive feedback! Tell us what you enjoy most.';
      case 'other':
        return 'Tip: Describe your inquiry or issue in detail.';
      default:
        return 'Enter your message here...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.12)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-['Inter',sans-serif] text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
              Feedback
            </p>
            <h3
              className="mt-2 font-['Poppins',sans-serif] text-[var(--text-primary)]"
              style={{
                fontSize: selectedOption ? '24px' : '20px',
                fontWeight: 600,
                letterSpacing: '-0.015em',
              }}
            >
              {selectedOption ? 'Your Feedback' : 'What do you think about this section?'}
            </h3>
            <p className="mt-2 font-['Inter',sans-serif] text-sm text-[var(--text-secondary)]">
              {selectedOption
                ? ''
                : ''}
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              handleReset();
            }}
            className="rounded-xl p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--chip-bg)] hover:text-[var(--text-primary)]"
            aria-label="Close feedback panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!selectedOption && (
          <div className="flex flex-wrap gap-2">
            {feedbackOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-full border border-[var(--divider)] bg-[var(--bg-elev-1)] px-3 py-1.5 font-['Inter',sans-serif] text-xs text-[var(--text-primary)] shadow-sm transition-colors hover:border-[var(--brand)] hover:text-[var(--text-primary-strong)] sm:text-sm"
                  style={{
                    letterSpacing: '0.01em',
                    width: 'max-content',
                  }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: `${option.accent}20` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: option.accent }} />
                  </span>
                  <span className="whitespace-nowrap">{option.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {selectedOption && selectedOptionData && (
          <div className="space-y-4">
            {/* Selected Option Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${accentColor}18` }}
                >
                  {(() => {
                    const Icon = selectedOptionData.icon;
                    return <Icon className="h-5 w-5" style={{ color: accentColor }} />;
                  })()}
                </span>
                <h4
                  className="font-['Poppins',sans-serif] text-[var(--text-primary)]"
                  style={{ fontSize: '24px', fontWeight: 600, color: accentColor }}
                >
                  {selectedOptionData.label}
                </h4>
              </div>
              <button
                onClick={handleReset}
                className="rounded-full border border-[var(--divider)] px-3 py-1.5 font-['Inter',sans-serif] text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--chip-bg)] hover:text-[var(--text-primary)]"
              >
                Change
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={getPlaceholder(selectedOption)}
              className="w-full rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] p-4 font-['Inter',sans-serif] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--brand)] focus:outline-none"
              style={{ minHeight: '130px', resize: 'vertical' }}
            />

            {/* Footer Text */}
            <p className="font-['Inter',sans-serif] text-sm text-[var(--text-secondary)]">
              If you want a reply to your feedback, feel free to mention a contact in the message.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex items-center justify-center rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] px-4 py-2 font-['Inter',sans-serif] text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--chip-bg)]"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !message.trim()}
                className="flex flex-1 items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-2 font-['Inter',sans-serif] text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                <Send className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}