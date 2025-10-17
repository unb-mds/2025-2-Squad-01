import { useEffect, useState } from 'react';
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
  const [selectedMember, setSelectedMember] = useState<string>(members?.[0] ?? '');
  const [selectedTime, setSelectedTime] = useState<string>('Last 30 days');
  // Keep internal state in sync when parent provides a value
  useEffect(() => {
    if (selectedMemberProp !== undefined) {
      setSelectedMember(selectedMemberProp);
      setSelectedTime(selectedTimeProp);
    }
  }, [selectedMemberProp, selectedTimeProp]);

  const sendSelectedMember = (selected: string) => {
    // Guarda o valor selecionado na variável de estado local
    setSelectedMember(selected);
    // Propaga para o parent (Commits) se fornecido
    if (onMemberChange) onMemberChange(selected);
  };
  
  const sendSelectedTime = (selected: string) => {
    // Guarda o valor selecionado na variável de estado local
    setSelectedTime(selected);
    // Propaga para o parent (Commits) se fornecido
    if (onTimeChange) onTimeChange(selected);
  };
  return (
    <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h4 className="text-lg font-semibold text-white mb-4">Filters</h4>
            
            <div className="space-y-3">
              {/* Filtro Timeline */}
            <Filter title="Timeline" content={['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last 6 months', 'Last Year']} sendSelectedValue={sendSelectedTime} />
              
              {/* Filtro Members */}
            <Filter title="Members" content={members || []} sendSelectedValue={sendSelectedMember} />

          </div>
    </div>
    );
}


