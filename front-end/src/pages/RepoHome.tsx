import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { CollaborationNetworkGraph, ActivityHeatmap } from '../components/Graphs';
import { CollaborationEdge, HeatmapDataPoint } from '../types';

type RepoHomePageData = {
  collaboration?: CollaborationEdge[];
  heatmap?: HeatmapDataPoint[];
};

function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="doc-card h-64 flex items-center justify-center">
      <span className="text-white/50">{title}</span>
    </div>
  );
}

export default function RepoHomePage() { // Renomeado de volta para RepoHomePage

  const [pageData, setPageData] = useState<RepoHomePageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Busca os dois arquivos em paralelo
        const [collabResponse, heatmapResponse] = await Promise.all([
          fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/collaboration_edges.json'),
           fetch('https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/activity_heatmap.json') 
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
          collaboration: collaborationData,
          heatmap: heatmapData
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
        setPageData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Array vazio = rodar só na montagem

if (pageData && !loading && !error) { // Adiciona verificações de loading/error
    console.log("Dados disponíveis para renderizar Heatmap:", pageData.heatmap);
  }

  return (
    <DashboardLayout
      currentPage="repos"
      currentSubPage={null}
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
      {pageData && !loading && !error && (
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Visão Geral do Repositório</h1>
          <p className="text-slate-400 text-sm mb-8">Informações gerais e métricas chave de colaboração.</p>

          {/* Grid para os Cards dos Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card: Rede de Colaboração */}
            <div
              className="border rounded-lg flex flex-col min-h-[750px]"
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
              <div className="flex-grow p-2 overflow-hidden">
                {pageData.collaboration && pageData.collaboration.length > 0 ? (
                  <CollaborationNetworkGraph data={pageData.collaboration} />
                ) : (
                  <p className="text-white/50 text-center py-10">Dados de colaboração não disponíveis.</p>
                )}
              </div>
            </div> 

            {/* Card: Heatmap de Atividade */}
            <div
              className="border rounded-lg flex flex-col min-h-[750px]" 
              style={{ backgroundColor: '#222222', borderColor: '#333333' }}
            >
              {/* Header do Card*/}
              <div
                className="px-6 py-4 border-b" // 
                style={{ borderBottomColor: '#333333' }} 
              >
                 
                <h3 className="text-xl font-semibold text-white">Heatmap de Atividade</h3>
              </div> 

              {/* Conteúdo do Card */}
              <div className="flex-grow p-4 flex items-center justify-center">
                {pageData?.heatmap && pageData.heatmap.length > 0 ? (
                  <ActivityHeatmap data={pageData.heatmap} />
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