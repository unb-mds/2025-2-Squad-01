import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ProcessedActivityResponse,
  RepoActivitySummary,
} from '../pages/Utils';

interface SidebarProps {
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
  { id: 'issues', label: 'Issues', icon: '📊' },
  { id: 'commits', label: 'Commits', icon: '💻' },
  { id: 'pullrequests', label: 'Pull Requests', icon: '🔀' },
  { id: 'collaboration', label: 'Collaboration', icon: '🤝' },
  { id: 'structure', label: 'Structure', icon: '🏗️' },
];

export default function RepoToolbar({ currentRepo, currentPage, data, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleItemClick = (itemId: string) => {
    navigate(`/repos/${itemId}`);
    console.log(`Navegando para: ${itemId}`);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repositories = useMemo<RepoActivitySummary[]>(() => data?.repositories ?? [], [data]);

  // selected repo id comes from URL (?repo=all|<id>)
  const selectedParam = searchParams.get('repo');
  const selectedRepoId: number | 'all' = !selectedParam || selectedParam === 'all'
    ? 'all'
    : Number.isNaN(Number(selectedParam))
      ? 'all'
      : Number(selectedParam);
  
   
  

  return (
    <aside
      className="h-34.5 w-full flex-shrink-0 transition-all duration-300 ease-in-out"
      style={{ backgroundColor: '#222222', borderRightColor: '#333333' }}
    >
      <div className="h-32 flex flex-col">
        {/* Brand */}
        <div className="pt-4 pl-5 pb-1  border-b-1 flex items-center gap-3" style={{ borderBottomColor: '#333333' }}>
          <span className="text-xl">📊</span>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">Repository Related Metrics</h1>
            <p className="mt-0.5 text-[15px] pt-0.5 text-slate-400">Current repository: {currentRepo}</p>
            
          </div>
          {/* Repo Selector */}
          <select
            value={selectedRepoId}
            onChange={(e) => {
              const value = e.target.value;
              const next = new URLSearchParams(searchParams);
              next.set('repo', value);
              setSearchParams(next, { replace: true });
            }}
            className="ml-auto mr-3 mb-2 px-4 py-2 border rounded text-white"
            style={{ backgroundColor: '#333333', borderColor: '#444444' }}
            disabled={loading}
          >
            <option value="all">
              All repositories ({repositories.flatMap((r) => r.activities).length})
            </option>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.name} ({repo.activities.length})
              </option>
            ))}
          </select>
        </div>

        



        {/* Nav */}
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
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#333333';
                  } else {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
                  }
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
