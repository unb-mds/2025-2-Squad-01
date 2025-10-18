interface FilterProps {
  title: string;
  content: string[];
  sendSelectedValue?: (value: string) => void;
  value?: string;
}

/**
 * Filter Component
 *
 * Generic dropdown filter component for selecting from a list of options.
 *
 * @param title - Label for the filter
 * @param content - Array of option strings
 * @param sendSelectedValue - Callback when selection changes
 * @param value - Currently selected value
 */
export function Filter({ title, content, sendSelectedValue, value }: FilterProps) {
  const selected = value ?? content[0] ?? '';

  const handleChange = (selectedValue: string) => {
    if (sendSelectedValue) sendSelectedValue(selectedValue);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-slate-300 min-w-[80px]">{title}:</label>
      <select
        id={`${title.toLowerCase()}-filter`}
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        style={{
          backgroundColor: '#333333',
          borderColor: '#444444',
          color: 'white',
        }}
      >
        {content.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
