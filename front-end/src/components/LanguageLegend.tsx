interface LanguageLegendProps {
  languages: Array<{
    language: string;
    percentage: number;
    total_bytes: number;
  }>;
  colorMap: Record<string, string>;
}

export const LanguageLegend: React.FC<LanguageLegendProps> = ({ languages, colorMap }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-white mb-4">Languages Distribution</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {languages.map((lang) => (
          <div
            key={lang.language}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(51, 51, 51, 0.3)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: colorMap[lang.language] || colorMap['Unknown'] }}
              />
              <div>
                <span className="text-sm font-medium text-slate-200">{lang.language}</span>
                <p className="text-xs text-slate-400">{formatBytes(lang.total_bytes)}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-300">{lang.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};