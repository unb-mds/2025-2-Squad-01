import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CollaborationNetworkGraph, ActivityHeatmap } from '../components/Graphs';
import { CollaborationEdge, HeatmapDataPoint } from '../types';
import { useMemo } from 'react'; 
import { useSearchParams } from 'react-router-dom'; 
import { Utils } from './Utils'; 
import type { ProcessedActivityResponse, RepoActivitySummary } from './Utils';
import { ExportPDFModal } from '../components/ExportPDFModal';
import { useRepositoryPDFExport } from '../hooks/useRepositoryPDFExport'; 


type CollaborationPageData = {
  collaboration?: CollaborationEdge[];
  heatmap?: HeatmapDataPoint[];
};


export default function CollaborationPage() { 

  const [pageData, setPageData] = useState<CollaborationPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ mainData, setMainData ] = useState<ProcessedActivityResponse | null>(null); 
  const [searchParams] = useSearchParams();
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState(false);

  
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

        const collaborationData: CollaborationEdge[] = await collabResponse.json();
        const heatmapData: HeatmapDataPoint[] = await heatmapResponse.json();

        setPageData({
          collaboration: collaborationData.filter(d => d && !d._metadata),
          heatmap: heatmapData.filter(d => d && !d._metadata),
        });
        setMainData(processedMainData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
        setPageData(null);
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

  const { exportToPDF } = useRepositoryPDFExport(selectedRepo?.name || 'unknown');

  const filteredCollaborationData = useMemo(() => {
    if (!pageData?.collaboration || !selectedRepo) return [];
    if (selectedRepo.name === 'All repositories') {
      return pageData.collaboration;
    }
    return pageData.collaboration.filter(edge => edge.repo === selectedRepo.name);
    }, [pageData?.collaboration, selectedRepo]);



if (pageData && !loading && !error) { // Adiciona verificações de loading/error
    console.log("Dados disponíveis para renderizar Heatmap:", pageData.heatmap);
  }

  return (
    <DashboardLayout
      currentPage="overview"
      currentSubPage="collaboration"
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

      {/* --- Success State (Data Loaded) --- */}
      {pageData && mainData && selectedRepo && !loading && !error && (
        <div className="h-fit mt-30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Collaboration Map</h1>
              <p className="text-slate-400 text-sm">Represents the collaboration connections between users based on their contributions to shared repositories.</p>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1">

            {/* Card: Collaboration-Network */}
            <div
              className="border rounded-lg flex flex-col h-full"
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 border-b" 
                style={{ borderBottomColor: '#333333' }} 
              >
                <h3 className="text-xl font-semibold text-white">Collaboration Network</h3>
              </div> 
              {/* Content */}
              <div className="flex-grow p-2 overflow-hidden h-full">
                {filteredCollaborationData.length > 0 ? (
                  <CollaborationNetworkGraph data={filteredCollaborationData} />
                ) : (
                  <p className="text-white/50 text-center py-10">Collaboration data not available.</p>
                )}
              </div>
              {/* Explanation with Dropdown */}
              <div className="border-t border-t-gray-700">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-semibold text-sm">
                    📖 How to interpret this graph
                  </span>
                  <span className="text-lg">{showExplanation ? '▼' : '▶'}</span>
                </button>
                
                {showExplanation && (
                  <div className="px-4 pb-4">
                    <p className="text-white/70 py-2 text-sm">
                      This graph illustrates collaboration connections between users based on their contributions to shared repositories.
                      Each node represents a user, and the lines indicate collaborations in shared repositories.
                    </p>
                    <p className="text-white/70 py-2 font-bold text-sm">
                      What does collaboration mean in this context? 
                    </p>
                    <p className="text-white/70 pb-1 text-sm">
                      Two developers are considered collaborators when:
                    </p>
                    <ul className="text-white/70 text-xs space-y-1 ml-4 list-disc">
                      <li>Made commits to the same repository</li>
                      <li>Created or commented on issues in the same project</li>
                      <li>Participated in pull requests (creation, review, comments) in the same repository</li>
                      <li>Participated in events related to the same project</li>
                    </ul>
                  </div>
                )}
              </div>
            </div> 

            

          </div> 
        </div>
      )}

      {/* Export PDF Modal */}
      <ExportPDFModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportToPDF}
        repoName={selectedRepo?.name || 'Repository'}
      />
    </DashboardLayout>
  ); 
}