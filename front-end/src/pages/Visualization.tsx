import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RepoFingerprint } from '../components/RepoFingerprint';
import { RepoTreemap } from '../components/RepoTreemap';
import { VisualizationTabs } from '../components/VisualizationTabs';
import { LanguageLegend } from '../components/LanguageLegend';
import { RepoStructureAnalysis } from '../components/RepoStructureAnalysis';
import DashboardLayout from '../components/DashboardLayout';
import { VisualizationUtils, type LanguageAnalysis } from './VisualizationUtils';

export default function VisualizationPage() {
  const [visualizationMode, setVisualizationMode] = useState<'treemap' | 'circlepack'>('treemap');
  const [searchParams] = useSearchParams();
  const [languageData, setLanguageData] = useState<LanguageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pega o repositório selecionado da URL (vem da toolbar)
  const repoParam = searchParams.get('repo');

  // Carrega dados quando o repositório muda
  useEffect(() => {
    if (!repoParam || repoParam === 'all') {
      setLanguageData(null);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await VisualizationUtils.fetchLanguageData(repoParam);
        
        if (!cancelled) {
          if (data) {
            setLanguageData(data);
          } else {
            setError('No data available for this repository');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [repoParam]);

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
      currentRepo={repoParam || 'No repository selected'}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Repository Visualization</h2>
            {repoParam && languageData && (
              <p className="text-slate-400 text-sm mt-2">
                {languageData.repository} • {languageData.total_files} files • {languageData.languages.length} languages
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alternância de modo */}
      {repoParam && !loading && !error && languageData && (
        <div className="mb-6">
          <VisualizationTabs
            activeMode={visualizationMode}
            onModeChange={setVisualizationMode}
          />
        </div>
      )}

      {/* Área de visualização */}
      {repoParam && repoParam !== 'all' ? (
        <div className="border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          <div className="px-6 py-4 border-b" style={{ borderBottomColor: '#333333' }}>
            <h3 className="text-xl font-bold text-white">
              {visualizationMode === 'treemap' ? '📊 Treemap View' : '⭕ Circle Pack View'}
            </h3>
          </div>
          
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-slate-400">Loading data for {repoParam}...</div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center h-96">
                <div className="text-red-400">Error: {error}</div>
              </div>
            )}
            
            {!loading && !error && languageData && (
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
      ) : (
        <div className="flex items-center justify-center h-96 border rounded-lg" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
          <p className="text-slate-400">Please select a repository from the toolbar above</p>
        </div>
      )}

      {/* Análise de IA */}
      {repoParam && !loading && !error && languageData && (
        <RepoStructureAnalysis data={languageData} />
      )}

      {/* Legenda */}
      {repoParam && !loading && !error && languageData && (
        <LanguageLegend 
          languages={languageData.languages}
          colorMap={colorMap}
        />
      )}
    </DashboardLayout>
  );
}