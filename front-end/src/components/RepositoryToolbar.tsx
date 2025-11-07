import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import type { ProcessedActivityResponse, RepoActivitySummary } from '../pages/Utils';

interface RepositoryToolbarProps {
  currentRepo?: string;
  currentPage?: string;
  data?: ProcessedActivityResponse | null;
  onNavigate?: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { id: 'commits', label: 'Commits', icon: '💻' },
  { id: 'issues', label: 'Issues', icon: '📊' },
  { id: 'pullrequests', label: 'Pull Requests', icon: '🔀' },
  { id: 'commit-analysis', label: 'Commit Analysis', icon: '📈' },
  { id: 'collaboration', label: 'Collaboration', icon: '🤝' },
  { id: 'structure', label: 'Structure', icon: '🏗️' },
];

/**
 * RepositoryToolbar Component
 *
 * Secondary navigation bar for repository-specific pages.
 * Provides repository selection dropdown and metric-type navigation.
 *
 * @param currentRepo - Name of the currently selected repository
 * @param currentPage - Current metric page for highlighting
 * @param data - Activity data for repository list
 * @param onNavigate - Navigation handler callback
 */
export default function RepositoryToolbar({
  currentRepo,
  currentPage,
  data,
}: RepositoryToolbarProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading] = useState(false);
  const [availableRepoNames, setAvailableRepoNames] = useState<string[]>([]);

  // Fetch available repository names if data is not provided
  useEffect(() => {
    if (!data) {
      async function fetchRepoNames() {
        try {
          const response = await fetch('/2025-2-Squad-01/available_repos.json');
          if (response.ok) {
            const repos = await response.json();
            setAvailableRepoNames(repos);
          }
        } catch (err) {
          console.warn('Could not fetch repo names:', err);
        }
      }
      fetchRepoNames();
    }
  }, [data]);

  const repositories = useMemo<RepoActivitySummary[]>(() => data?.repositories ?? [], [data]);

  const selectedParam = searchParams.get('repo');
  
  // If we have activity data, use numeric IDs; otherwise use repo names
  const selectedRepoId: number | string | 'all' =
    !selectedParam || selectedParam === 'all'
      ? 'all'
      : data && !Number.isNaN(Number(selectedParam))
        ? Number(selectedParam)
        : selectedParam;

  const handleItemClick = (itemId: string) => {
    navigate(`/repos/${itemId}`);
  };

  const handleRepoChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('repo', value);
    setSearchParams(next, { replace: true });
  };

  return (
    <aside
      className="h-34.5 w-full flex-shrink-0 transition-all duration-300 ease-in-out"
      style={{ backgroundColor: '#222222', borderRightColor: '#333333' }}
    >
      <div className="h-32 flex flex-col">
        {/* Header with Repository Info */}
        <div
          className="pt-4 pl-5 pb-1 border-b-1 flex items-center gap-3"
          style={{ borderBottomColor: '#333333' }}
        >
          <span className="text-xl">📊</span>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">
              Repository Related Metrics
            </h1>
            <p className="mt-0.5 text-[15px] pt-0.5 text-slate-400">
              Currently Viewing: {currentRepo}
            </p>
          </div>

          {/* Repository Selector */}
          <select
            value={selectedRepoId}
            onChange={(e) => handleRepoChange(e.target.value)}
            className="ml-auto mr-3 mb-2 px-4 py-2 border rounded text-white"
            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
            disabled={loading}
          >
            {data ? (
              // Activity data available - use repository objects
              <>
                <option value="all">
                  All repositories ({repositories.flatMap((r) => r.activities).length})
                </option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name} ({repo.activities.length})
                  </option>
                ))}
              </>
            ) : (
              // No activity data - use repository names
              <>
                <option value="all">All repositories ({availableRepoNames.length})</option>
                {availableRepoNames.map((repoName) => (
                  <option key={repoName} value={repoName}>
                    {repoName}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-2 py-3 border-b-2" style={{ borderBottomColor: '#333333' }}>
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-auto flex-1 items-center justify-start gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'text-blue-300 border-l-2 border-blue-500'
                    : 'text-slate-300 hover:text-white'
                }`}
                style={{
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? 'rgba(59, 130, 246, 0.25)'
                    : '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'transparent';
                }}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
