import { useState, useMemo, useEffect, useRef } from 'react';

interface MemberFilterProps {
  members: string[];
  selectedMembers: string[];
  onMemberChange: (selectedMembers: string[]) => void;
}

/**
 * MemberFilter Component
 *
 * Provides a searchable list of members with checkboxes.
 * Users can search and select multiple members for filtering.
 *
 * @param members - Array of all available member names
 * @param selectedMembers - Array of currently selected member names
 * @param onMemberChange - Callback when member selection changes
 */
export function MemberFilter({
  members,
  selectedMembers,
  onMemberChange,
}: MemberFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const lowerSearch = searchTerm.toLowerCase();
    return members.filter((member) =>
      member.toLowerCase().includes(lowerSearch)
    );
  }, [members, searchTerm]);

  const handleToggleMember = (member: string) => {
    if (selectedMembers.includes(member)) {
      onMemberChange(selectedMembers.filter((m) => m !== member));
    } else {
      onMemberChange([...selectedMembers, member]);
    }
  };

  const allFilteredSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((member) => selectedMembers.includes(member));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // If all filtered members are selected, deselect all filtered members
      const remainingSelected = selectedMembers.filter(
        (m) => !filteredMembers.includes(m)
      );
      onMemberChange(remainingSelected);
    } else {
      // Select all filtered members
      const newSelected = [
        ...selectedMembers.filter((m) => !filteredMembers.includes(m)),
        ...filteredMembers,
      ];
      onMemberChange(newSelected);
    }
  };

  return (
    <div className="flex items-start gap-3 sm:gap-4" ref={containerRef}>
      <label className="text-sm font-medium text-slate-300 min-w-[80px] text-right pt-2">Members:</label>
      
      <div className="flex flex-col gap-2 flex-1 relative">
        {/* Search Bar */}
        <input
        type="text"
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        style={{
          backgroundColor: '#333333',
          borderColor: '#444444',
          color: 'white',
        }}
      />

      {/* Results Container - Positioned absolutely */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-md border overflow-y-auto z-50"
          style={{
            backgroundColor: '#333333',
            borderColor: '#444444',
            maxHeight: '250px',
          }}
        >
        {/* Select All Option */}
        {filteredMembers.length > 0 && (
          <div
            className="px-3 py-2 border-b transition-colors"
            style={{ borderColor: '#444444' }}
          >
            <label 
              className="flex items-center gap-2 cursor-pointer select-none hover:text-blue-400"
              onClick={() => handleSelectAll()}
            >
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={() => handleSelectAll()}
                className="w-4 h-4 cursor-pointer"
                style={{
                  accentColor: '#3b82f6',
                }}
              />
              <span className="text-sm text-slate-300 font-medium">
                Select All
              </span>
            </label>
          </div>
        )}

        {/* Member List */}
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member}
              className="px-3 py-2 hover:bg-gray-700 transition-colors"
            >
              <label 
                className="flex items-center gap-2 cursor-pointer select-none hover:text-blue-400"
                onClick={() => handleToggleMember(member)}
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member)}
                  onChange={() => handleToggleMember(member)}
                  className="w-4 h-4 cursor-pointer"
                  style={{
                    accentColor: '#3b82f6',
                  }}
                />
                <span className="text-sm text-white">{member}</span>
              </label>
            </div>
          ))
        ) : (
          <div className="px-3 py-4 text-center text-sm text-slate-400">
            {members.length === 0
              ? 'No members available'
              : 'No members found'}
          </div>
        )}
        </div>
      )}

         </div>
            {/* Selected Count */}
      {selectedMembers.length > 0 && (
        <div className="text-xs text-slate-400 mt-3">
          {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''} Selected
        </div>
      )}
    </div>
  );
}
