import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout'; 
import { CollaborationNetworkGraph } from '../components/Graphs';

type CollaborationEdge = {
  user1: string;
  user2: string;
  repo: string;
  collaboration_type: string;
  _metadata?: any; // Para ignorar a entrada de metadados
};

type RepoHomeData = {
  collaboration: CollaborationEdge[];
};


// Componente simples para os cards dos gráficos (Placeholder)
function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="doc-card h-64 flex items-center justify-center"> 
      <span className="text-white/50">{title}</span>
    </div>
  );
}

export default function RepoHomePage() {

  const [pageData, setPageData] = useState<RepoHomeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Busca o JSON específico da colaboração
        const response = await fetch('/data/silver/collaboration_edges.json'); 

        if (!response.ok) {
          throw new Error(`Falha ao buscar dados de colaboração (status: ${response.status})`);
        }
        const collaborationData: CollaborationEdge[] = await response.json();

        // Guarda os dados no state (ajuste se buscar mais dados)
        setPageData({ collaboration: collaborationData }); 

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
        setPageData(null); 
      } finally {
        setLoading(false); 
      }
    }
    fetchData();
  }, []); // Array vazio = rodar só na montagem  

  return (
    // ===== Usa o DashboardLayout para a estrutura principal =====
    <DashboardLayout
      currentPage="repos"      // Marca "Repositories" como ativo na sidebar
      currentSubPage={null}    // Nenhuma aba de métrica ativa 
      // data={null}           // Dados gerais do repositório/org podem ser passados aqui
      // currentRepo={"Visão Geral"} // Título a ser exibido no header
    >
     
      

      {/* --- Estado de Carregamento --- */}
      {loading && (
        <div className="text-center text-white/70 py-10">Carregando dados da colaboração...</div>
      )}

      {/* --- Estado de Erro --- */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded relative text-center" role="alert">
          <strong className="font-bold">Erro ao carregar dados: </strong>
          <span>{error}</span>
        </div>
      )}

      {/* --- Estado de Sucesso (Dados Carregados) --- */}
      {pageData && !loading && !error && (
        <div>
          {/* Você pode adicionar a barra de navegação das abas aqui se o DashboardLayout não a incluir */}
          {/* Exemplo:
          <div className="mb-10 content-header"> ... (código das abas) ... </div> 
          */}

          <h1 className="text-3xl font-bold text-white mb-4">Visão Geral do Repositório</h1>
          <p className="text-slate-400 text-sm mb-8">Informações gerais e métricas chave de colaboração.</p>

          {/* Grid para os Cards dos Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card: Rede de Colaboração (Gráfico Real) */}
            <div className="doc-card col-span-1 md:col-span-2"> {/* Ocupa mais espaço */}
              <h2 className="text-xl font-semibold text-white mb-4">Rede de Colaboração</h2>
              {/* === AQUI USAMOS O COMPONENTE DO GRÁFICO === */}
              <CollaborationNetworkGraph data={pageData.collaboration} />
            </div>

            {/* Outros Placeholders */}
            <PlaceholderCard title="Gráfico: Contribuições por Repositório (Empilhado)" />
            <PlaceholderCard title="Gráfico: Contribuições ao Longo do Tempo (Linhas)" />
            {/* Adicione mais placeholders conforme necessário */}

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}