import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { id: 'organization', label: 'Overview', icon: '📊' },
  { id: 'repos', label: 'Activities', icon: '💻' },
];

/**
 * Sidebar Component
 *
 * Main navigation sidebar for the application.
 * Provides navigation between organization and repository views.
 * Can be collapsed to save screen space.
 */
export default function Sidebar({ currentPage }: SidebarProps) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleItemClick = (itemId: string) => {
    if (itemId === 'organization') {
      navigate('/overview/timeline');
    } else {
      navigate(`/${itemId}`);
    }
  };

  return (
    <aside
      className={`h-screen border-r-4 flex-shrink-0 transition-all duration-300 ease-in-out fixed left-0 top-0 ${
        isSidebarOpen ? 'w-46' : 'w-16'
      }`}
      style={{ backgroundColor: '#222222', borderRightColor: '#333333' }}
    >
      <div className="h-full flex flex-col">
        {/* Brand Header */}
        <div className="h-18 flex items-center gap-3 px-4">
          <span className="text-xl">📊</span>
          {isSidebarOpen && (
            <div>
              <h1 className="text-lg font-semibold text-white leading-tight">CoOps</h1>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center ${
                  isSidebarOpen ? 'justify-start gap-3' : 'justify-center'
                } px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? `text-blue-300 border-l-2 border-blue-500 ${isSidebarOpen ? '' : 'border-l-0'}`
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
                {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer with Home Button and Toggle */}
        <div className="p-3 border-t-2 space-y-2" style={{ borderTopColor: '#333333' }}>
          <button
            onClick={() => handleItemClick('home')}
            className={`w-full flex items-center ${
              isSidebarOpen ? 'justify-start gap-3' : 'justify-center'
            } px-3 py-2 rounded-md text-slate-400 hover:text-white transition-colors`}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span>🏠</span>
            {isSidebarOpen && <span className="text-sm">Home</span>}
          </button>

          <div className="flex justify-center">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center rounded-md transition-colors"
              style={{ backgroundColor: '#333333' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#444444')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              title={isSidebarOpen ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-4 h-4 text-slate-300 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
