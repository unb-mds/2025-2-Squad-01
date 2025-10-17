import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import RepoToolbar from './RepositoryToolbar';
import type {
  ProcessedActivityResponse,
} from '../pages/Utils';

interface FilterProps {
    members?: string[];
  onNavigate?: (page: string) => void;
}

export default function DashboardLayout({ 
    members,
}: FilterProps) {
  return (
    <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h4 className="text-lg font-semibold text-white mb-4">Filters</h4>
            
            <div className="space-y-3">
              {/* Filtro Timeline */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-300 min-w-[80px]">
                  Timeline:
                </label>
                <select 
                  id="timeline-filter" 
                  name="timeline_filter" 
                  className="px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  style={{ backgroundColor: '#333333', borderColor: '#444444', color: 'white' }}
                >
                  <option value="">All periods</option>
                  <option value="week">Last week</option>
                  <option value="month">Last month</option>
                  <option value="quarter">Last quarter</option>
                  <option value="year">Last year</option>
                </select>
              </div>
              
              {/* Filtro Members */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-300 min-w-[80px]">
                  Members:
                </label>
                <select 
                  id="members-filter" 
                  name="members_filter" 
                  className="px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  style={{ backgroundColor: '#333333', borderColor: '#444444', color: 'white' }}
                >
                  <option value="">All contributors</option>
                  <option value="top5">Top 5 contributors</option>
                  <option value="active">Active contributors</option>
                  <option value="recent">Recent contributors</option>
                </select>
              </div>
            </div>
          </div>
  );
}
