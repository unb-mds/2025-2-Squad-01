import React from 'react';
import { Filter } from './Filter';


interface FilterProps {
  members?: string[];
  onMemberChange?: (value: string) => void;
  selectedMember?: string;
  onTimeChange?: (value: string) => void;
  selectedTime?: string;
}

export default function BaseFilters({ 
  members,
  onMemberChange,
  onTimeChange,
  selectedMember: selectedMemberProp,
  selectedTime: selectedTimeProp,
}: FilterProps) {
  const sendSelectedMember = (selected: string) => {
    if (onMemberChange) onMemberChange(selected);
  };
  
  const sendSelectedTime = (selected: string) => {
    if (onTimeChange) onTimeChange(selected);
  };
  return (
    <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h4 className="text-lg font-semibold text-white mb-4">Filters</h4>
            
            <div className="space-y-3">
              {/* Filtro Timeline */}
            <Filter
              title="Timeline"
              content={[
                'Last 24 hours',
                'Last 7 days',
                'Last 30 days',
                'Last 6 months',
                'Last Year',
                'All Time',
              ]}
              value={selectedTimeProp}
              sendSelectedValue={sendSelectedTime}
            />
              
              {/* Filtro Members */}
            <Filter
              title="Members"
              content={members || []}
              value={selectedMemberProp}
              sendSelectedValue={sendSelectedMember}
            />

          </div>
    </div>
    );
}


