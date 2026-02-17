import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import type { FAQData } from '../types/data';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { FeedbackTrigger } from '../components/FeedbackTrigger';
import { useFeedbackState } from '../hooks/useFeedbackState';
import { AnimatePresence } from 'motion/react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { isFeedbackOpen, handleToggle, handleClose } = useFeedbackState();
  const [faqs, setFaqs] = useState<FAQData[]>([]);

  useEffect(() => {
    dataService.getFAQs().then(setFaqs).catch(console.error);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <h1
          className="text-[var(--text-primary)] font-['Poppins',sans-serif]"
          style={{ fontSize: 'clamp(32px, 5vw, 40px)', lineHeight: '1.2', fontWeight: 600 }}
        >
          Frequently Asked Questions
        </h1>
        <FeedbackTrigger isOpen={isFeedbackOpen} onToggle={handleToggle} title="FAQ" />
      </div>
      <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-8" style={{ fontSize: '16px' }}>
        Find answers to common questions about apps and extensions.
      </p>

      {/* Inline Feedback Panel */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="mb-8">
            <FeedbackPanel page="faq" onClose={handleClose} />
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl overflow-hidden transition-all"
            style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-[var(--bg-elev-1)] transition-colors"
            >
              <h3
                className="font-['Inter',sans-serif] text-[var(--text-primary)] pr-4"
                style={{ fontWeight: 600, fontSize: '16px' }}
              >
                {faq.question}
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-[var(--text-secondary)] transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                  }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-[var(--bg-surface)]">
                  <div className="text-[var(--text-secondary)] font-['Inter',sans-serif] text-sm leading-relaxed">
                    <MarkdownRenderer content={faq.answer} />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
