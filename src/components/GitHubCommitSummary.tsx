import React from 'react';
import { Calendar, Github } from 'lucide-react';
import type { CommitData } from '../hooks/useGitHubLastCommit';

interface GitHubCommitSummaryProps {
  commit: CommitData | null;
  commits?: CommitData[];
  loading?: boolean;
  formatDate?: (date?: string) => string;
  className?: string;
}

const defaultFormatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function GitHubCommitSummary({
  commit,
  commits = [],
  loading = false,
  formatDate = defaultFormatDate,
  className = 'mb-6 sm:mb-8',
}: GitHubCommitSummaryProps) {
  const commitsToShow =
    commits.length > 0
      ? commits.slice(0, 5)
      : commit
      ? [commit]
      : [];

  if (!loading && commitsToShow.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl p-6 ${className}`}
      style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-['Inter',sans-serif]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--chip-bg)] text-[var(--brand)]">
            <Github className="w-4 h-4" />
          </span>
          <span style={{ fontWeight: 600 }}>Latest GitHub Commit</span>
        </div>
        {commit?.url && (
          <a
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors font-['Inter',sans-serif]"
            style={{ fontWeight: 500 }}
          >
            View all commit →
          </a>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-2/3 rounded bg-[var(--chip-bg)] animate-pulse"></div>
              <div className="h-3 w-1/2 rounded bg-[var(--chip-bg)] animate-pulse"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && commitsToShow.length > 0 && (
        <div className="space-y-3">
          {commitsToShow.map((item, index) => (
            <div
              key={`${item.sha}-${index}`}
              className="rounded-xl border border-[var(--divider)] bg-[var(--bg-elev-1)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-[var(--text-primary)] font-['Inter',sans-serif]"
                  style={{ fontWeight: 600, fontSize: '15px' }}
                >
                  {item.message}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--brand)] hover:text-[var(--brand-strong)] transition-colors"
                  >
                    View →
                  </a>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] font-['Inter',sans-serif]">
                <span>
                  <span className="opacity-70">Author:</span> {item.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand)]" />
                  {formatDate(item.date)}
                </span>
                {item.sha && (
                  <span className="rounded-full bg-[var(--chip-bg)] px-2 py-0.5 font-mono text-[var(--text-secondary)] text-[11px]">
                    {item.sha}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
