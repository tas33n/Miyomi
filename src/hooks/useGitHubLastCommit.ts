import { useState, useEffect } from 'react';

export interface CommitData {
  date: string;
  author: string;
  message: string;
  url: string;
  sha: string;
}

interface UseGitHubLastCommitReturn {
  commit: CommitData | null;
  commits: CommitData[];
  loading: boolean;
  error: string | null;
}

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const commitCache: Map<string, { data: CommitData[]; timestamp: number }> = new Map();

/**
 * Extracts owner/repo from a GitHub URL
 * @param url - GitHub URL (e.g., "https://github.com/owner/repo")
 * @returns "owner/repo" string or null if invalid
 */
function extractRepoFromUrl(url: string): string | null {
  try {
    if (!url.startsWith('http')) {
      const parts = url.split('/');
      if (parts.length === 2 && parts[0] && parts[1]) {
        return url;
      }
      return null;
    }

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse GitHub URL:', error);
    return null;
  }
}

export function useGitHubLastCommit(githubUrl?: string, fallbackDate?: string): UseGitHubLastCommitReturn {
  const [commit, setCommit] = useState<CommitData | null>(null);
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const githubRepo = githubUrl ? extractRepoFromUrl(githubUrl) : null;

    if (!githubRepo) {
      if (fallbackDate) {
        const fallbackCommit: CommitData = {
          date: fallbackDate,
          author: 'Unknown',
          message: 'Last updated',
          url: '',
          sha: '',
        };
        setCommit(fallbackCommit);
        setCommits([fallbackCommit]);
      }
      setLoading(false);
      return;
    }

    const fetchLastCommit = async () => {
      try {
        const cached = commitCache.get(githubRepo);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setCommits(cached.data);
          setCommit(cached.data[0] ?? null);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.github.com/repos/${githubRepo}/commits?per_page=5`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Repository not found');
          }
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No commits found');
        }

        const commitList: CommitData[] = data.slice(0, 5).map((item: any) => ({
          date: item.commit.author.date,
          author: item.commit.author.name,
          message: item.commit.message.split('\n')[0],
          url: item.html_url,
          sha: item.sha.substring(0, 7),
        }));

        commitCache.set(githubRepo, {
          data: commitList,
          timestamp: Date.now(),
        });

        setCommits(commitList);
        setCommit(commitList[0] ?? null);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch commit data';
        setError(errorMessage);
        console.error('GitHub commit fetch error:', err);

        if (fallbackDate) {
          const fallbackCommit: CommitData = {
            date: fallbackDate,
            author: 'Unknown',
            message: 'Last updated',
            url: '',
            sha: '',
          };
          setCommit(fallbackCommit);
          setCommits([fallbackCommit]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLastCommit();
  }, [githubUrl, fallbackDate]);

  return { commit, commits, loading, error };
}
