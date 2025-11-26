import { Filter } from './Filter';
import { MemberFilter } from './MemberFilter';

interface BaseFiltersProps {
  members?: string[];
  onMemberChange?: (value: string[]) => void;
  selectedMembers?: string[];
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
 * @param onMemberChange - Callback when member filter changes (receives array of selected members)
 * @param selectedMembers - Currently selected members filter
 * @param onTimeChange - Callback when timeline filter changes
 * @param selectedTime - Currently selected timeline filter
 */
export default function BaseFilters({
  members,
  onMemberChange,
  onTimeChange,
  selectedMembers,
  selectedTime,
}: BaseFiltersProps) {
  const handleMemberChange = (selected: string[]) => {
    if (onMemberChange) onMemberChange(selected);
  };

  const handleTimeChange = (selected: string) => {
    if (onTimeChange) onTimeChange(selected);
  };

  return (
    <div className="px-6 py-4" style={{ borderBottomColor: '#333333' }}>
      <h4 className="text-lg font-semibold text-white mb-3">Filters</h4>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
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
        {members && members.length > 0 && (
          <MemberFilter
            members={members}
            selectedMembers={selectedMembers || []}
            onMemberChange={handleMemberChange}
          />
        )}
      </div>
    </div>
  );
}
