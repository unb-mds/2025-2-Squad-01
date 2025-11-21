interface VisualizationTabsProps {
  activeMode: 'treemap' | 'circlepack';
  onModeChange: (mode: 'treemap' | 'circlepack') => void;
}

export const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  activeMode,
  onModeChange
}) => {
  return (
    <div className="flex gap-2 bg-slate-800 p-1 rounded-lg w-fit">
      <button
        onClick={() => onModeChange('treemap')}
        className={`
          px-6 py-2 rounded-md font-medium transition-all duration-200
          ${activeMode === 'treemap'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }
        `}
      >
        📊 Treemap
      </button>
      <button
        onClick={() => onModeChange('circlepack')}
        className={`
          px-6 py-2 rounded-md font-medium transition-all duration-200
          ${activeMode === 'circlepack'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }
        `}
      >
        ⭕ Circle Pack
      </button>
    </div>
  );
};