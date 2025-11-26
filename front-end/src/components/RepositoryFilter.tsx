import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import type { ProcessedActivityResponse, RepoActivitySummary } from '../pages/Utils';

interface RepositoryFilterProps {
  data?: ProcessedActivityResponse | null;
  onRepoChange?: (repoId: string | number) => void;
}

/**
 * RepositoryFilter Component
 *
 * Dropdown selector for filtering by repository.
 * Works with both activity data (numeric IDs) and repository names.
 *
 * @param data - Activity data containing repository list
 * @param onRepoChange - Callback when repository selection changes
 */
export default function RepositoryFilter({
  data,
  onRepoChange,
}: RepositoryFilterProps) {
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

  const handleRepoChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('repo', value);
    setSearchParams(next, { replace: true });
    
    // Notify parent component if callback provided
    if (onRepoChange) {
      onRepoChange(value === 'all' ? 'all' : Number.isNaN(Number(value)) ? value : Number(value));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">Repository</label>
      <select
        value={selectedRepoId}
        onChange={(e) => handleRepoChange(e.target.value)}
        className="px-3 py-2 border rounded text-white text-sm"
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
  );
}
