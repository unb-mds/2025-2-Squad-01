import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout'; 

// Componente simples para os cards dos gráficos (Placeholder)
function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="doc-card h-64 flex items-center justify-center"> 
      <span className="text-white/50">{title}</span>
    </div>
  );
}

export default function RepoGeralPage() {

  return (
    // ===== Usa o DashboardLayout para a estrutura principal =====
    <DashboardLayout
      currentPage="repos"      // Marca "Repositories" como ativo na sidebar
      currentSubPage={null}    // Nenhuma aba de métrica ativa 
      // data={null}           // Dados gerais do repositório/org podem ser passados aqui
      // currentRepo={"Visão Geral"} // Título a ser exibido no header
    >
     
      

      {/* Conteúdo da Página Geral */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Visão Geral do Repositório</h1>
        <p className="text-slate-400 text-sm mb-8">Informações gerais e métricas chave de colaboração.</p>

        {/* Grid para os Cards dos Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PlaceholderCard title="Gráfico: Contribuições por Repositório (Empilhado)" />
          <PlaceholderCard title="Gráfico: Contribuições ao Longo do Tempo (Linhas)" />
          <PlaceholderCard title="Gráfico: Contribuições por Membro (Barras)" />
        </div>
      </div>
      

    </DashboardLayout>
  );
}