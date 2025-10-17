import { useState } from 'react';

interface FilterProps {
  title: string,
  content: string[];
}


export function Filter({ title, content }: FilterProps) {

const [selected, setSelected] = useState<string>(content[0] || '');

  return (
  <div className="flex items-center gap-4">
    <label className="text-sm font-medium text-slate-300 min-w-[80px]">
      {title}:
    </label>
    <select 
      id={`${title.toLowerCase()}-filter`}
      value={selected} 
      onChange={(e) => setSelected(e.target.value)}
      className="px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" style={{
      backgroundColor: '#333333',
      borderColor: '#444444',
      color: 'white'
    }}>
      {content.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}

    </select>
  </div>);
}

