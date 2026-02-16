import { useState, useEffect } from 'react';

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
    download_count: number;
  }>;
}

export interface ReleaseData {
  version: string;
  date: string;
  name: string;
  url: string;
  notes: string;
  downloads: number;
  assets: GitHubRelease['assets'];
  isPrerelease: boolean;
}

interface UseGitHubReleaseReturn {
  release: ReleaseData | null;
  loading: boolean;
  error: string | null;
}

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const releaseCache: Map<string, { data: ReleaseData; timestamp: number }> = new Map();

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


const normalizeInitialData = (data: Partial<ReleaseData>, fallbackDate?: string): ReleaseData => ({
  version: data.version || 'N/A',
  date: data.date || fallbackDate || '',
  name: data.name || 'Latest Version',
  url: data.url || '',
  notes: data.notes || '',
  downloads: data.downloads || 0,
  assets: data.assets || [],
  isPrerelease: data.isPrerelease || false,
});

export function useGitHubRelease(
  githubUrl?: string,
  fallbackDate?: string,
  initialData?: Partial<ReleaseData>
): UseGitHubReleaseReturn {
  const [release, setRelease] = useState<ReleaseData | null>(() => {
    if (initialData) {
      return normalizeInitialData(initialData, fallbackDate);
    }
    return null;
  });

  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && !release) {
      setRelease(normalizeInitialData(initialData, fallbackDate));
      setLoading(false);
    }
  }, [initialData, fallbackDate, release]);

  useEffect(() => {
    const githubRepo = githubUrl ? extractRepoFromUrl(githubUrl) : null;

    if (!githubRepo) {
      if (initialData) {
        setRelease(normalizeInitialData(initialData, fallbackDate));
      } else if (fallbackDate && !release) {
        setRelease({
          version: 'N/A',
          date: fallbackDate,
          name: 'Latest Version',
          url: '',
          notes: '',
          downloads: 0,
          assets: [],
          isPrerelease: false,
        });
      }
      setLoading(false);
      return;
    }

    const fetchRelease = async () => {
      if (!release) {
        setLoading(true);
      }

      try {
        const headers = {
          Accept: 'application/vnd.github.v3+json',
        };

        const sumDownloads = (releases: GitHubRelease[]) =>
          releases
            .filter(release => !release.draft)
            .reduce(
              (total, release) =>
                total +
                release.assets.reduce(
                  (assetSum, asset) => assetSum + asset.download_count,
                  0
                ),
              0
            );

        const fetchLifetimeDownloads = async (
          initialReleases?: GitHubRelease[]
        ): Promise<number> => {
          let total = 0;
          let nextPage = 1;

          if (initialReleases) {
            total += sumDownloads(initialReleases);
            if (initialReleases.length < 100) {
              return total;
            }
            nextPage = 2;
          }

          while (true) {
            const response = await fetch(
              `https://api.github.com/repos/${githubRepo}/releases?per_page=100&page=${nextPage}`,
              { headers }
            );

            if (!response.ok) {
              throw new Error(`GitHub API error: ${response.status}`);
            }

            const releases: GitHubRelease[] = await response.json();

            if (releases.length === 0) {
              break;
            }

            total += sumDownloads(releases);

            if (releases.length < 100) {
              break;
            }

            nextPage += 1;
          }

          return total;
        };

        const cached = releaseCache.get(githubRepo);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setRelease(cached.data);
          setLoading(false);
          return;
        }

        const processReleaseData = (data: GitHubRelease): ReleaseData => {
          const totalDownloads = data.assets.reduce(
            (sum, asset) => sum + asset.download_count,
            0
          );

          return {
            version: data.tag_name,
            date: data.published_at,
            name: data.name || data.tag_name,
            url: data.html_url,
            notes: data.body || '',
            downloads: totalDownloads,
            assets: data.assets,
            isPrerelease: data.prerelease,
          };
        };

        let response = await fetch(
          `https://api.github.com/repos/${githubRepo}/releases/latest`,
          { headers }
        );

        let releaseData: ReleaseData;
        let initialReleasePage: GitHubRelease[] | undefined;

        if (response.ok) {
          const data: GitHubRelease = await response.json();
          releaseData = processReleaseData(data);
        } else if (response.status === 404) {
          // No latest release found (only pre-releases), fetch all releases instead
          response = await fetch(
            `https://api.github.com/repos/${githubRepo}/releases?per_page=100`,
            { headers }
          );

          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
          }

          const releases: GitHubRelease[] = await response.json();
          initialReleasePage = releases;

          if (releases.length === 0) {
            throw new Error('No releases found');
          }

          const nonDraftReleases = releases.filter(release => !release.draft);

          if (nonDraftReleases.length === 0) {
            throw new Error('No published releases found');
          }

          releaseData = processReleaseData(nonDraftReleases[0]);
        } else {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        try {
          const lifetimeDownloads = await fetchLifetimeDownloads(initialReleasePage);
          releaseData = {
            ...releaseData,
            downloads: lifetimeDownloads || releaseData.downloads,
          };
        } catch (downloadError) {
          console.warn('Failed to fetch lifetime downloads:', downloadError);
        }

        releaseCache.set(githubRepo, {
          data: releaseData,
          timestamp: Date.now(),
        });

        setRelease(releaseData);
        setError(null);
      } catch (err) {
        console.error('Error fetching GitHub release:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch release data');

        if (initialData) {
          setRelease(prev => prev || normalizeInitialData(initialData, fallbackDate));
        } else if (fallbackDate && !release) {
          setRelease({
            version: 'N/A',
            date: fallbackDate,
            name: 'Latest Version',
            url: '',
            notes: '',
            downloads: 0,
            assets: [],
            isPrerelease: false,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, [githubUrl, fallbackDate, initialData]);

  return { release, loading, error };
}
