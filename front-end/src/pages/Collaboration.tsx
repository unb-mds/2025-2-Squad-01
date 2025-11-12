import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CollaborationNetworkGraph, ActivityHeatmap } from '../components/Graphs';
import { CollaborationEdge, HeatmapDataPoint } from '../types';
import { useMemo } from 'react'; 
import { useSearchParams } from 'react-router-dom'; 
import { Utils } from './Utils'; 
import type { ProcessedActivityResponse, RepoActivitySummary } from './Utils'; 


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

  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Busca os dois arquivos em paralelo
        const [collabResponse, heatmapResponse, processedMainData] = await Promise.all([
          fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/commits_graphql/data/silver/collaboration_edges.json'),
          fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/commits_graphql/data/silver/activity_heatmap.json'), 
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
      currentPage="repos"
      currentSubPage="collaboration"
      data={mainData}
      currentRepo={selectedRepo ? selectedRepo.name : 'No Repository Selected'}
    >
      {/* --- Estados de Carregamento e Erro --- */}
      {loading && (
        <div className="text-center text-white/70 py-10">Carregando dados...</div>
      )}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded relative text-center" role="alert">
          <strong className="font-bold">Erro ao carregar dados: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* --- Estado de Sucesso (Dados Carregados) --- */}
      {pageData && mainData && selectedRepo && !loading && !error && (
        <div className="h-full">
          <h1 className="text-3xl font-bold text-white mb-4">Visão Geral do Repositório</h1>
          <p className="text-slate-400 text-sm mb-8">Informações gerais e métricas chave de colaboração.</p>

          {/* Grid para os Cards dos Gráficos */}
          <div className="grid grid-cols-1 gap-6">

            {/* Card: Rede de Colaboração */}
            <div
              className="border rounded-lg flex flex-col h-full"
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              {/* Header do Card*/}
              <div
                className="px-6 py-4 border-b" 
                style={{ borderBottomColor: '#333333' }} 
              >
                <h3 className="text-xl font-semibold text-white">Rede de Colaboração</h3>
              </div> 
              {/* Conteúdo do Card */}
              <div className="flex-grow p-2 overflow-hidden h-full">
                {filteredCollaborationData.length > 0 ? (
                  <CollaborationNetworkGraph data={filteredCollaborationData} />
                ) : (
                  <p className="text-white/50 text-center py-10">Dados de colaboração não disponíveis.</p>
                )}
              </div>
              {/* Explicação com Dropdown */}
              <div className="border-t border-t-gray-700">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-semibold text-sm">
                    Como interpretar este gráfico
                  </span>
                  <span className="text-lg">{showExplanation ? '▼' : '▶'}</span>
                </button>
                
                {showExplanation && (
                  <div className="px-4 pb-4">
                    <p className="text-white/70 py-2 text-sm">
                      Este gráfico ilustra as conexões de colaboração entre usuários com base em suas contribuições para repositórios comuns.
                      Cada nó representa um usuário, e as linhas indicam colaborações em repositórios compartilhados.
                    </p>
                    <p className="text-white/70 py-2 font-bold text-sm">
                      O que significa colaboração neste contexto? 
                    </p>
                    <p className="text-white/70 pb-1 text-sm">
                      Dois desenvolvedores são considerados colaboradores quando:
                    </p>
                    <ul className="text-white/70 text-xs space-y-1 ml-4 list-disc">
                      <li>Fizeram commits no mesmo repositório</li>
                      <li>Criaram ou comentaram em issues do mesmo projeto</li>
                      <li>Participaram de pull requests (criação, review, comentários) no mesmo repositório</li>
                      <li>Participaram de eventos relacionados ao mesmo projeto</li>
                    </ul>
                  </div>
                )}
              </div>
            </div> 

            {/* Card: Heatmap de Atividade */}
            <div
              className="border rounded-lg flex flex-col min-h-[500px] overflow-hidden"
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              {/* Header do Card*/}
              <div
                className="px-6 py-4 border-b"
                style={{ borderBottomColor: '#333333' }} 
              >
                <h3 className="text-xl font-semibold text-white">Heatmap de Atividade</h3>
              </div> 

              {/* Conteúdo do Card */}
              <div className="flex-grow p-6 flex items-center justify-center overflow-hidden">
                {pageData?.heatmap && pageData.heatmap.length > 0 ? (
                  <div className="flex items-center justify-center w-full">
                    <div className="transform scale-140 origin-center">
                      <ActivityHeatmap data={pageData.heatmap} />
                    </div>
                  </div>
                ) : (
                  <p className="text-white/50 text-center py-10">Dados de heatmap não disponíveis ou vazios.</p>
                )}
              </div>
            </div> 

          </div> 
        </div>
      )}
    </DashboardLayout>
  ); 
}