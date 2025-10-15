import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function DashboardLayout({ 
  children, 
  currentPage = 'commits', 
  onNavigate 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#181818' }}>
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
