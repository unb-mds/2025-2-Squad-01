import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ActivityHeatmap } from '../components/Graphs';
import { HeatmapDataPoint } from '../types';
import { useMemo } from 'react'; 
import { useSearchParams } from 'react-router-dom'; 
import { Utils } from './Utils'; 
import type { ProcessedActivityResponse, RepoActivitySummary } from './Utils'; 


type HeatmapPageData = {
  heatmap?: HeatmapDataPoint[];
};


export default function HeatmapPage() { 

  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ mainData, setMainData ] = useState<ProcessedActivityResponse | null>(null); 
  const [searchParams] = useSearchParams();
  const [showLegend, setShowLegend] = useState<boolean>(false);

  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Busca os dois arquivos em paralelo
        const [collabResponse, heatmapResponse, processedMainData] = await Promise.all([
          fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/collaboration_edges.json'),
          fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/activity_heatmap.json'), 
          Utils.fetchAndProcessActivityData('commit')
        ]);

        if (!collabResponse.ok) {
          throw new Error(`Falha ao buscar dados de colaboração (status: ${collabResponse.status})`);
        }
        if (!heatmapResponse.ok) {
          throw new Error(`Falha ao buscar dados do heatmap (status: ${heatmapResponse.status})`);
        }

  
        const heatmapData: HeatmapDataPoint[] = await heatmapResponse.json();

        setHeatmapData(heatmapData.filter(d => d && !d._metadata));
        setMainData(processedMainData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
        setHeatmapData(null);
        setMainData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Array vazio = rodar só na montagem

  const repositories = useMemo<RepoActivitySummary[]>(() => mainData?.repositories ?? [], [mainData]);

  const selectedRepo = useMemo<RepoActivitySummary | null>(() => {
    const selectedParam = searchParams.get('repo');
    const selectedRepoId: number | 'all' =
      !selectedParam || selectedParam === 'all'
        ? 'all'
        : Number.isNaN(Number(selectedParam))
          ? 'all'
          : Number(selectedParam);

    if (selectedRepoId === 'all') {
      return {
        id: -1,
        name: 'All repositories',
        activities: repositories.flatMap((repo) => repo.activities),
      } as RepoActivitySummary;
    }
    return repositories.find((repo) => repo.id === selectedRepoId) ?? null;
  }, [repositories, searchParams]);



  return (
    <DashboardLayout
      currentPage="overview"
      currentSubPage="heatmap"
      data={mainData}
      currentRepo={selectedRepo ? selectedRepo.name : 'No Repository Selected'}
    >
      {/* --- Loading and Error States --- */}
      {loading && (
        <div className="text-center text-white/70 mt-80" >Loading data...</div>
      )}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded relative text-center" role="alert">
          <strong className="font-bold">Error loading data: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* --- Estado de Sucesso (Dados Carregados) --- */}
      {heatmapData && mainData && selectedRepo && !loading && !error && (
        <div className="h-fit mt-30">
          <h1 className="text-3xl font-bold text-white mb-2">Organization Activity Heatmap Analysis</h1>
          <p className="text-slate-400 text-sm mb-4">General information and key collaboration metrics.</p>

          <div className="grid grid-cols-1 ">

            {/* Card: Activity Heatmap */}
            <div
              className="border rounded-lg flex flex-col min-h-[600px] overflow-hidden"
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b"
                style={{ borderBottomColor: '#333333' }} 
              >
                <h3 className="text-xl font-semibold text-white">Activity Heatmap</h3>
              </div> 

              {/* Content */}
              <div className="flex-grow p-6 flex items-center justify-center">
                {heatmapData && heatmapData.length > 0 ? (
                  <div className="transform scale-140 origin-center">
                    <ActivityHeatmap data={heatmapData} />
                  </div>
                ) : (
                  <p className="text-white/50 text-center py-10">Heatmap data not available or empty.</p>
                )}
              </div>

              {/* Legend Dropdown */}
              <div className="border-t border-t-gray-700">
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-semibold text-sm">
                    📖 How to interpret this graph
                  </span>
                  <span className="text-lg">{showLegend ? '▼' : '▶'}</span>
                </button>
                
                {showLegend && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* How it works */}
                    <div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-3">
                        The <strong>Activity Heatmap</strong> represents the intensity of activities throughout the year. Each cell represents a day, and the color indicates the number of commits made on that day.
                      </p>
                    </div>

                    {/* Color Legend */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Color Intensity:</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-sm border"
                            style={{ backgroundColor: '#f5f5f5', borderColor: '#333333' }}
                          ></div>
                          <span className="text-slate-300 text-xs"><strong>White:</strong> No activity (0)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-sm border"
                            style={{ backgroundColor: '#ffcccc', borderColor: '#333333' }}
                          ></div>
                          <span className="text-slate-300 text-xs"><strong>Light red:</strong> Low activity (1-3)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-sm border"
                            style={{ backgroundColor: '#ff9999', borderColor: '#333333' }}
                          ></div>
                          <span className="text-slate-300 text-xs"><strong>Medium red:</strong> Moderate activity (4-7)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-sm border"
                            style={{ backgroundColor: '#ff6666', borderColor: '#333333' }}
                          ></div>
                          <span className="text-slate-300 text-xs"><strong>Dark red:</strong> High activity (8-15)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-sm border"
                            style={{ backgroundColor: '#cc0000', borderColor: '#333333' }}
                          ></div>
                          <span className="text-slate-300 text-xs"><strong>Deep red:</strong> Very high activity (16+)</span>
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">💡 What to observe:</h4>
                      <ul className="text-slate-300 text-xs space-y-1 list-disc list-inside">
                        <li>Regular patterns indicate work routines</li>
                        <li>Light areas show weekends or periods with no activity</li>
                        <li>Darker areas reveal development sprints</li>
                        <li>Use repository filter to compare collaboration patterns</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div> 
      )}
    </DashboardLayout>
  ); 
}