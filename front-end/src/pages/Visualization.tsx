import { useState } from 'react';
import { useRepositories } from '../hooks/useRepositories';
import { useRepoData } from '../hooks/useRepoData';
import { RepoFingerprint } from '../components/RepoFingerprint';
import { RepoTreemap } from '../components/RepoTreemap';
import { VisualizationTabs } from '../components/VisualizationTabs';
import { LanguageLegend } from '../components/LanguageLegend';
import DashboardLayout from '../components/DashboardLayout';

export default function VisualizationPage() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'treemap' | 'circlepack'>('treemap');
  
  const { repositories, loading: reposLoading, error: reposError } = useRepositories();
  const { languageData, loading: dataLoading, error: dataError } = useRepoData(selectedRepo);

  const colorMap = {
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'SCSS': '#c6538c',
    'Shell': '#89e051',
    'Markdown': '#083fa1',
    'JSON': '#292929',
    'YAML': '#cb171e',
    'Unknown': '#cccccc',
    'No Extension': '#999999'
  };

  return (
    <DashboardLayout
      currentSubPage="visualization"
      currentPage="repos"
      data={null}
      currentRepo={selectedRepo || 'No repository selected'}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Repository Visualization</h2>
            {selectedRepo && languageData && (
              <p className="text-slate-400 text-sm mt-2">
                {languageData.repository} • {languageData.total_files} files • {languageData.languages.length} languages
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seletor de repositório */}
      <div className="mb-6">
        <label htmlFor="repo-selector" className="block text-sm font-medium text-slate-300 mb-2">
          Select Repository
        </label>
        <select
          id="repo-selector"
          value={selectedRepo || ''}
          onChange={(e) => setSelectedRepo(e.target.value || null)}
          className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
          disabled={reposLoading}
          aria-label="Select a repository to visualize"
          aria-describedby={reposError ? "repo-error" : undefined}
        >
          <option value="">-- Select a repository --</option>
          {repositories.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>
        
        {reposLoading && <p className="text-slate-400 mt-2 text-sm">Loading repositories...</p>}
        {reposError && <p id="repo-error" className="text-red-400 mt-2 text-sm" role="alert">Error: {reposError}</p>}
      </div>

      {/* Alternância de modo */}
      {selectedRepo && !dataLoading && !dataError && languageData && (
        <div className="mb-6">
          <VisualizationTabs
            activeMode={visualizationMode}
            onModeChange={setVisualizationMode}
          />
        </div>
      )}

      {/* Área de visualização */}
      {selectedRepo && (
        <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">
              {visualizationMode === 'treemap' ? '📊 Treemap View' : '⭕ Circle Pack View'}
            </h3>
          </div>
          
          <div className="p-6">
            {dataLoading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-slate-400">Loading data for {selectedRepo}...</div>
              </div>
            )}
            
            {dataError && (
              <div className="flex items-center justify-center h-96">
                <div className="text-red-400">Error: {dataError}</div>
              </div>
            )}
            
            {!dataLoading && !dataError && languageData && (
              <div className="flex justify-center w-full">
                {visualizationMode === 'treemap' ? (
                  <div className="w-full max-w-full">
                    <RepoTreemap 
                      data={languageData} 
                      width={typeof window !== 'undefined' ? Math.min(900, window.innerWidth - 100) : 900}
                      height={600} 
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-full">
                    <RepoFingerprint 
                      data={languageData} 
                      width={typeof window !== 'undefined' ? Math.min(900, window.innerWidth - 100) : 900}
                      height={600} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legenda */}
      {selectedRepo && !dataLoading && !dataError && languageData && (
        <LanguageLegend 
          languages={languageData.languages}
          colorMap={colorMap}
        />
      )}
    </DashboardLayout>
  );
}