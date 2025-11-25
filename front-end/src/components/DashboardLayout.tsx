import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import RepositoryToolbar from './RepositoryToolbar';
import OverviewToolbar from './OverviewToolbar';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import type { ProcessedActivityResponse } from '../pages/Utils';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
  currentSubPage?: string;
  onRepo?: boolean;
  onOverview?: boolean;
  currentRepo?: string;
  data?: ProcessedActivityResponse | null;
  onNavigate?: (page: string) => void;
}

/**
 * DashboardLayout Component
 *
 * Main layout wrapper for dashboard pages.
 * Provides consistent structure with sidebar navigation and optional repository toolbar.
 *
 * @param children - Content to render in the main area
 * @param currentPage - Current main page for navigation highlighting
 * @param currentSubPage - Current sub-page for toolbar highlighting
 * @param onRepo - Whether to show the repository toolbar
 * @param currentRepo - Name of currently selected repository
 * @param data - Activity data for repository selection
 * @param onNavigate - Navigation handler callback
 */
function DashboardLayoutInner({
  children,
  currentPage,
  currentSubPage,
  onRepo,
  onOverview,
  currentRepo = 'No Repository Selected',
  data = null,
  onNavigate,
}: DashboardLayoutProps) {
  const { sidebarWidth } = useSidebar();
  if (currentPage == 'repos') {
    onRepo = true;
    onOverview = false;
  }
  else if (currentPage == 'overview') {
    onOverview = true;
    onRepo = false;
  }
  else
  {
    onRepo = false;
    onOverview = false;
  }

  return (
    <div className="min-h-screen flex" style={{ marginLeft: sidebarWidth }}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1">
        {onRepo && (
          <RepositoryToolbar
            currentRepo={currentRepo}
            currentPage={currentSubPage}
            data={data}
            onNavigate={onNavigate}
          />
        )}
        {onOverview && (
          <OverviewToolbar
            currentPage={currentSubPage}
            data={data}
            onNavigate={onNavigate}
          />
        )}
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#181818' }}>
          <div className="max-w-7xl mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner {...props} />''
    </SidebarProvider>
  );
}
