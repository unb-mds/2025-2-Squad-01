import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import RepoToolbar from './RepositoryToolbar';
import type {
  ProcessedActivityResponse,
} from '../pages/Utils';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
  onRepo?: boolean;
  currentRepo?: string;
  data?: ProcessedActivityResponse | null;
  onNavigate?: (page: string) => void;
}

export default function DashboardLayout({ 
  children, 
  currentPage = 'commits', 
  onRepo = true,
  currentRepo = "No Repository Selected",
  data = null,
  onNavigate 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex flex-col flex-1">
        {onRepo && <RepoToolbar currentRepo={currentRepo} data={data} onNavigate={onNavigate} />}
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#181818' }}>
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
