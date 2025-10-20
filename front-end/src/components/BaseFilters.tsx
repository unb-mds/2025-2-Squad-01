import { Filter } from './Filter';

interface BaseFiltersProps {
  members?: string[];
  onMemberChange?: (value: string) => void;
  selectedMember?: string;
  onTimeChange?: (value: string) => void;
  selectedTime?: string;
}

/**
 * BaseFilters Component
 *
 * Provides common filtering controls for timeline and team members.
 * Used across multiple pages to maintain consistent filter behavior.
 *
 * @param members - Array of team member names to filter by
 * @param onMemberChange - Callback when member filter changes
 * @param selectedMember - Currently selected member filter
 * @param onTimeChange - Callback when timeline filter changes
 * @param selectedTime - Currently selected timeline filter
 */
export default function BaseFilters({
  members,
  onMemberChange,
  onTimeChange,
  selectedMember,
  selectedTime,
}: BaseFiltersProps) {
  const handleMemberChange = (selected: string) => {
    if (onMemberChange) onMemberChange(selected);
  };

  const handleTimeChange = (selected: string) => {
    if (onTimeChange) onTimeChange(selected);
  };

  return (
    <div className="px-6 py-4" style={{ borderBottomColor: '#333333' }}>
      <h4 className="text-lg font-semibold text-white mb-3">Filters</h4>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        {/* Timeline Filter */}
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
          value={selectedTime}
          sendSelectedValue={handleTimeChange}
        />

        {/* Members Filter */}
        <Filter
          title="Members"
          content={members || []}
          value={selectedMember}
          sendSelectedValue={handleMemberChange}
        />
      </div>
    </div>
  );
}
