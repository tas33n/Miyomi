import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGlobalSearch, SearchResultType } from '../hooks/useGlobalSearch';
import { AppListCard } from '../components/AppListCard';
import { ExtensionListCard } from '../components/ExtensionListCard';
import { Search, Filter } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/FilterChip';
import { motion } from 'motion/react';

interface SearchPageProps {
  onNavigate: (path: string) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const results = useGlobalSearch(query);

  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all');

  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return results;
    return results.filter(result => result.type === activeFilter);
  }, [results, activeFilter]);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleResultClick = (result: any) => {
    switch (result.type) {
      case 'app':
        onNavigate(`/software/${result.slug || result.id}`);
        break;
      case 'extension':
        onNavigate(`/extensions/${result.slug || result.id}`);
        break;
      case 'guide':
        onNavigate(`/guides/${result.slug}`);
        break;
    }
  };

  const resultCounts = useMemo(() => {
    return {
      all: results.length,
      app: results.filter(r => r.type === 'app').length,
      extension: results.filter(r => r.type === 'extension').length,
      guide: results.filter(r => r.type === 'guide').length,
    };
  }, [results]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-8 h-8 text-[var(--brand)]" />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Search Results
          </h1>
        </div>

        <div className="mb-6">
          <SearchBar
            placeholder="Search apps, extensions, or guides..."
            onSearch={handleSearch}
          />
        </div>

        {query && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm text-[var(--text-secondary)]">Filter by:</span>
            <FilterChip
              label={`All (${resultCounts.all})`}
              selected={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
            <FilterChip
              label={`Apps (${resultCounts.app})`}
              selected={activeFilter === 'app'}
              onClick={() => setActiveFilter('app')}
            />
            <FilterChip
              label={`Extensions (${resultCounts.extension})`}
              selected={activeFilter === 'extension'}
              onClick={() => setActiveFilter('extension')}
            />
            <FilterChip
              label={`Guides (${resultCounts.guide})`}
              selected={activeFilter === 'guide'}
              onClick={() => setActiveFilter('guide')}
            />
          </div>
        )}
      </div>

      {!query ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Start your search
          </h2>
          <p className="text-[var(--text-secondary)]">
            Search for apps, extensions, or guides
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No results found
          </h2>
          <p className="text-[var(--text-secondary)]">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result, index) => (
            <motion.div
              key={`${result.type}-${result.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {result.type === 'app' && (
                <AppListCard
                  appId={result.id}
                  name={result.name}
                  description={result.description}
                  tags={result.contentTypes || []}
                  platforms={result.platforms || []}
                  iconColor={result.accentColor || result.iconColor}
                  logoUrl={result.logoUrl}
                  rating={result.rating}
                  downloads={result.downloadCount}
                  forkOf={result.forkOf}
                  upstreamUrl={result.upstreamUrl}
                  onClick={() => handleResultClick(result)}
                />
              )}
              {result.type === 'extension' && (
                <ExtensionListCard
                  extension={result as any}
                  onSelect={() => handleResultClick(result)}
                />
              )}
              {result.type === 'guide' && (
                <button
                  onClick={() => handleResultClick(result)}
                  className="flex items-start gap-4 p-4 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-xl hover:shadow-lg hover:border-[var(--brand)] transition-all w-full text-left group"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: result.categoryColor || 'var(--brand)' }}
                  >
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--text-secondary)] mb-1">
                      {result.categoryTitle}
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {result.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
