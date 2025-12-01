import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import type { ProcessedActivityResponse, RepoActivitySummary } from '../pages/Utils';

interface OverviewToolbarProps {
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
  { id: 'timeline', label: 'Timeline', icon: '💻 ' },
  { id: 'collaboration', label: 'Collaboration', icon: '💻 ' },
  { id: 'heatmap', label: 'Heatmap', icon: '🌡️' },
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
export default function OverviewToolbar({
  currentPage,
  data,
}: OverviewToolbarProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading] = useState(false);
  const { sidebarWidth } = useSidebar();

  // Fetch available repository names if data is not provided





  const handleItemClick = (itemId: string) => {
    navigate(`/overview/${itemId}`);
  };

  return (
    <aside
      className="h-34.5 right-0 flex-shrink-0 transition-all duration-300 ease-in-out fixed top-0 hidden md:block z-10"
      style={{ 
        backgroundColor: '#222222', 
        borderRightColor: '#333333', 
        left: sidebarWidth,
        width: `calc(100vw - ${sidebarWidth})`
      }}
    >
      <div className="h-32 flex flex-col">
        {/* Header with Repository Info */}
        <div
          className="pt-4 pl-5 pb-1 border-b-1 flex items-center justify-between gap-3"
          style={{ borderBottomColor: '#333333' }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-xl">📊</span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white leading-tight truncate">
                Overview Metrics
              </h1>
              <p className="mt-0.5 text-[15px] pt-0.5 text-slate-400 truncate">
                Overview of organization-wide metrics
              </p>
            </div>
          </div>


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
