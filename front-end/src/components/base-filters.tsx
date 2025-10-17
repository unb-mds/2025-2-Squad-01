import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import RepoToolbar from './RepositoryToolbar';
import type {
  ProcessedActivityResponse,
} from '../pages/Utils';
import { Filter } from './Filter';


interface FilterProps {
    members?: string[];
  onNavigate?: (page: string) => void;
}

export default function BaseFilters({ 
    members,
}: FilterProps) {
  return (
    <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h4 className="text-lg font-semibold text-white mb-4">Filters</h4>
            
            <div className="space-y-3">
              {/* Filtro Timeline */}
            <Filter title="Timeline" content={['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last 6 months', 'Last Year']} />
              
              {/* Filtro Members */}
            <Filter title="Members" content={members || []} />
                  
          </div>
    </div>
    );
}


