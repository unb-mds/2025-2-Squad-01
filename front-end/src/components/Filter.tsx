import { useState } from 'react';

interface FilterProps {
  title: string;
  content: string[];
  sendSelectedValue?: (value: string) => void;

}


export function Filter({ title, content, sendSelectedValue}: FilterProps) {

  const [internal, setInternal] = useState<string>(content[0] || '');
  const selected = internal;
  const sendSelected = (value: string) => {
    if (sendSelectedValue) sendSelectedValue(value);
  };

  return (
  <div className="flex items-center gap-4">
    <label className="text-sm font-medium text-slate-300 min-w-[80px]">
      {title}:
    </label>
    <select 
      id={`${title.toLowerCase()}-filter`}
      value={selected} 
      onChange={(e) => {
        const v = e.target.value;
        setInternal(v);
        sendSelected(v);
      }}

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

