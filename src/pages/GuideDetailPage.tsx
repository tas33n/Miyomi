import { ArrowLeft, BookOpen, Clock, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface GuideDetailPageProps {
  slug: string;
  onNavigate?: (path: string) => void;
}

// Sample guide content data
const guideContent: Record<string, {
  title: string;
  category: string;
  categoryColor: string;
  readTime: string;
  tags: string[];
  content: { type: 'heading' | 'paragraph' | 'list' | 'code' | 'note'; content: string | string[] }[];
}> = {
  'installing-mihon-android': {
    title: 'Installing Mihon on Android',
    category: 'Installation',
    categoryColor: '#FF6B9D',
    readTime: '5 min read',
    tags: ['Android', 'Mihon', 'Beginner'],
    content: [
      { type: 'paragraph', content: 'Mihon is a free and open-source manga reader for Android, forked from Tachiyomi. This guide will walk you through the installation process step by step.' },
      { type: 'heading', content: 'Prerequisites' },
      { type: 'list', content: [
        'An Android device running Android 6.0 or higher',
        'Sufficient storage space (at least 50MB free)',
        'Permission to install apps from unknown sources (we\'ll set this up)',
      ]},
      { type: 'heading', content: 'Step 1: Enable Unknown Sources' },
      { type: 'paragraph', content: 'Before installing Mihon, you need to allow installation from unknown sources:' },
      { type: 'list', content: [
        'Go to Settings > Security (or Privacy)',
        'Find "Install unknown apps" or "Unknown sources"',
        'Select your browser (Chrome, Firefox, etc.)',
        'Toggle "Allow from this source"',
      ]},
      { type: 'note', content: 'Note: The exact steps may vary depending on your Android version and device manufacturer.' },
      { type: 'heading', content: 'Step 2: Download Mihon' },
      { type: 'list', content: [
        'Visit the official Mihon GitHub releases page',
        'Download the latest .apk file (usually named mihon-vX.X.X.apk)',
        'Wait for the download to complete',
      ]},
      { type: 'heading', content: 'Step 3: Install the App' },
      { type: 'list', content: [
        'Open your downloads folder or notification',
        'Tap on the Mihon .apk file',
        'Tap "Install" when prompted',
        'Wait for installation to complete',
        'Tap "Open" to launch Mihon',
      ]},
      { type: 'heading', content: 'Step 4: Initial Setup' },
      { type: 'paragraph', content: 'After launching Mihon for the first time:' },
      { type: 'list', content: [
        'Grant storage permissions when prompted',
        'Choose your preferred theme (Light/Dark)',
        'Browse the built-in extension repos',
        'You\'re ready to start reading!',
      ]},
      { type: 'heading', content: 'Next Steps' },
      { type: 'paragraph', content: 'Now that Mihon is installed, you can:' },
      { type: 'list', content: [
        'Add extension sources for manga content',
        'Configure tracking with MAL or AniList',
        'Set up automatic backups',
        'Customize reader settings',
      ]},
    ],
  },
  'installing-aniyomi-android': {
    title: 'Installing Aniyomi on Android',
    category: 'Installation',
    categoryColor: '#FF6B9D',
    readTime: '5 min read',
    tags: ['Android', 'Aniyomi', 'Anime', 'Manga'],
    content: [
      { type: 'paragraph', content: 'Aniyomi is a powerful app for both manga reading and anime streaming on Android. Follow this guide to get started.' },
      { type: 'heading', content: 'Download & Install' },
      { type: 'list', content: [
        'Visit the Aniyomi GitHub releases page',
        'Download the latest .apk file',
        'Enable "Unknown sources" in Android settings',
        'Install the downloaded APK',
        'Launch and grant necessary permissions',
      ]},
      { type: 'heading', content: 'Adding Extensions' },
      { type: 'paragraph', content: 'Aniyomi requires extensions for content:' },
      { type: 'list', content: [
        'Go to Browse → Extension repos',
        'Add extension repositories (check our Extensions page)',
        'Install extensions for your preferred sources',
        'Browse and enjoy content',
      ]},
      { type: 'note', content: 'Aniyomi supports both anime and manga extensions from the same app!' },
    ],
  },
  'adding-extension-sources': {
    title: 'Adding Extension Sources',
    category: 'Configuration',
    categoryColor: '#4A90E2',
    readTime: '4 min read',
    tags: ['Extensions', 'Configuration'],
    content: [
      { type: 'paragraph', content: 'Extension sources provide content for your manga/anime apps. This guide covers how to add them.' },
      { type: 'heading', content: 'Method 1: Automatic (Recommended)' },
      { type: 'list', content: [
        'Find an extension source on Miyomi\'s Extensions page',
        'Tap the "Install (Auto)" button',
        'Your app will open and add the source automatically',
        'Confirm when prompted',
      ]},
      { type: 'heading', content: 'Method 2: Manual' },
      { type: 'list', content: [
        'Copy the manual URL from the extension page',
        'Open your app (Mihon, Aniyomi, etc.)',
        'Go to Browse → Extension repos',
        'Tap "+" to add a new repo',
        'Paste the URL and save',
      ]},
      { type: 'note', content: 'Some apps may take a moment to load extensions after adding a new source.' },
    ],
  },
  'advanced-search-filtering': {
    title: 'Advanced Search & Filtering',
    category: 'Usage',
    categoryColor: '#7C4DFF',
    readTime: '6 min read',
    tags: ['Search', 'Filters', 'Advanced'],
    content: [
      { type: 'paragraph', content: 'Master the search and filtering features to find exactly what you\'re looking for.' },
      { type: 'heading', content: 'Basic Search' },
      { type: 'list', content: [
        'Tap the search icon in your library',
        'Enter manga/anime title or keywords',
        'View results from all your sources',
      ]},
      { type: 'heading', content: 'Advanced Filters' },
      { type: 'paragraph', content: 'Most apps support advanced filtering:' },
      { type: 'list', content: [
        'Filter by genre, status, or rating',
        'Sort by popularity, latest updates, or alphabetically',
        'Exclude certain genres or tags',
        'Search within specific sources only',
      ]},
      { type: 'heading', content: 'Library Filters' },
      { type: 'list', content: [
        'Organize by reading status (Reading, Completed, etc.)',
        'Filter by download status',
        'Sort by last read, alphabetically, or date added',
      ]},
    ],
  },
};

export function GuideDetailPage({ slug, onNavigate }: GuideDetailPageProps) {
  const guide = guideContent[slug];

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16 sm:py-24">
          <div className="text-6xl sm:text-8xl mb-6 opacity-50">📖</div>
          <h3 className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-2" style={{ fontSize: '20px', fontWeight: 600 }}>
            Guide not found
          </h3>
          <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-6">
            This guide is coming soon or doesn't exist yet.
          </p>
          <button
            onClick={() => onNavigate?.('/guides')}
            className="px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand-strong)] text-white rounded-xl transition-all font-['Inter',sans-serif]"
            style={{ fontWeight: 600 }}
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => onNavigate?.('/guides')}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors mb-6 font-['Inter',sans-serif]"
        style={{ fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Guides
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-['Inter',sans-serif] text-white"
            style={{ backgroundColor: guide.categoryColor, fontSize: '13px', fontWeight: 600 }}
          >
            <BookOpen className="h-4 w-4" />
            {guide.category}
          </span>
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)] font-['Inter',sans-serif]" style={{ fontSize: '14px' }}>
            <Clock className="h-4 w-4" />
            {guide.readTime}
          </span>
        </div>

        <h1
          className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: '1.2', fontWeight: 700 }}
        >
          {guide.title}
        </h1>

        <div className="flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--chip-bg)] px-2.5 py-1 font-['Inter',sans-serif] text-[var(--text-secondary)] px-2"
              style={{ fontSize: '12px' }}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div
        className="rounded-2xl border border-[var(--divider)] bg-[var(--bg-surface)] p-6 sm:p-8"
        style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
      >
        <div className="prose prose-invert max-w-none">
          {guide.content.map((section, index) => {
            if (section.type === 'heading') {
              return (
                <h2
                  key={index}
                  className="text-[var(--text-primary)] font-['Poppins',sans-serif] mt-8 first:mt-0 mb-3"
                  style={{ fontSize: '22px', fontWeight: 600 }}
                >
                  {section.content as string}
                </h2>
              );
            }

            if (section.type === 'paragraph') {
              return (
                <p
                  key={index}
                  className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-4"
                  style={{ fontSize: '15px', lineHeight: '1.7' }}
                >
                  {section.content as string}
                </p>
              );
            }

            if (section.type === 'list') {
              return (
                <ul key={index} className="mb-4 space-y-2">
                  {(section.content as string[]).map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[var(--text-secondary)] font-['Inter',sans-serif]"
                      style={{ fontSize: '15px', lineHeight: '1.7' }}
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--brand)]"></span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            if (section.type === 'note') {
              return (
                <div
                  key={index}
                  className="my-6 rounded-xl border-l-4 bg-[var(--chip-bg)] p-4"
                  style={{ borderColor: 'var(--brand)' }}
                >
                  <p
                    className="text-[var(--text-primary)] font-['Inter',sans-serif]"
                    style={{ fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic' }}
                  >
                    {section.content as string}
                  </p>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Related Guides */}
      <div className="mt-8 rounded-2xl bg-[var(--bg-elev-1)] p-6 text-center">
        <h3
          className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-2"
          style={{ fontSize: '18px', fontWeight: 600 }}
        >
          Need more help?
        </h3>
        <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] mb-4" style={{ fontSize: '14px' }}>
          Check out our FAQ or join the community for support.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate?.('/faq')}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--divider)] hover:border-[var(--brand)] text-[var(--text-primary)] rounded-xl transition-all font-['Inter',sans-serif]"
            style={{ fontWeight: 500, fontSize: '14px' }}
          >
            View FAQ
          </button>
        </div>
      </div>
    </div>
  );
}
