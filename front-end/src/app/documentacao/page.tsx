import Link from 'next/link';

export default function DocumentacaoPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fundo suave com gradientes */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-blue-950/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl"></div>
      
      {/* Padrão sutil de pontos */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}></div>
      
      <div className="relative mx-auto w-full max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-8"
          >
            ← Voltar ao início
          </Link>
          <h1 className="text-6xl font-didot text-blue-600 leading-tight mb-4">
            CoOps – Métricas GitHub
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Visualização, análise e explicação de métricas de colaboração em repositórios e organizações GitHub.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <a href="#intro" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Introdução</a>
          <a href="#team" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Equipe</a>
          <a href="#tech" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Tecnologias</a>
          <a href="#arch" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Arquitetura</a>
          <a href="#req" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Requisitos</a>
          <a href="#stories" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">User Stories</a>
          <a href="#docs" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Documentos</a>
        </div>

        {/* Content */}
        <div className="space-y-16">
          
          {/* Introdução */}
          <section id="intro">
            <h2 className="text-3xl font-semibold text-white mb-6">Introdução</h2>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <p className="text-white/90 text-lg leading-relaxed">
                O projeto CoOps foi desenvolvido na disciplina Métodos de Desenvolvimento de Software (MDS) da Engenharia de Software (UnB). 
                Seu objetivo é apoiar desenvolvedores, mantenedores e organizações na análise da colaboração dentro de projetos GitHub, 
                fornecendo métricas claras, visuais e interpretadas por IA.
              </p>
            </div>
          </section>

          {/* Equipe */}
          <section id="team">
            <h2 className="text-3xl font-semibold text-white mb-6">Equipe</h2>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p className="text-white/90"><span className="font-semibold text-blue-400">Scrum Master:</span> Pedro Druck</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-white/90"><span className="font-semibold text-green-400">Product Owner (PO):</span> Marcos Antonio</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <p className="text-white/90"><span className="font-semibold text-purple-400">Time de Desenvolvimento:</span></p>
                  </div>
                  <p className="text-white/70 ml-6 mt-1">Gustavo, Pedro Rocha, Carlos, Heitor</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tecnologias */}
          <section id="tech">
            <h2 className="text-3xl font-semibold text-white mb-6">Tecnologias Utilizadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 border-l-4 border-l-yellow-500 hover:transform hover:scale-105 transition-all">
                <h3 className="text-white text-xl font-semibold mb-2">🐍 Python</h3>
                <p className="text-white/70">Extração de dados via API GitHub</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 border-l-4 border-l-blue-500 hover:transform hover:scale-105 transition-all">
                <h3 className="text-white text-xl font-semibold mb-2">⚡ GitHub Actions</h3>
                <p className="text-white/70">Automação de workflows</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 border-l-4 border-l-orange-500 hover:transform hover:scale-105 transition-all">
                <h3 className="text-white text-xl font-semibold mb-2">🎨 HTML5 & CSS3</h3>
                <p className="text-white/70">Frontend e documentação (GitHub Pages)</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 border-l-4 border-l-gray-500 hover:transform hover:scale-105 transition-all">
                <h3 className="text-white text-xl font-semibold mb-2">📝 Markdown</h3>
                <p className="text-white/70">Documentação estruturada</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 border-l-4 border-l-pink-500 hover:transform hover:scale-105 transition-all">
                <h3 className="text-white text-xl font-semibold mb-2">🎨 Figma</h3>
                <p className="text-white/70">Protótipos e design</p>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 border-l-4 border-l-cyan-500 hover:transform hover:scale-105 transition-all">
                <h3 className="text-white text-xl font-semibold mb-2">⚛️ React/Next.js</h3>
                <p className="text-white/70">Interface moderna e responsiva</p>
              </div>
            </div>
          </section>

          {/* Arquitetura */}
          <section id="arch">
            <h2 className="text-3xl font-semibold text-white mb-6">Arquitetura do Projeto</h2>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 space-y-6">
              <p className="text-white/90 text-lg">
                O projeto segue uma arquitetura orientada a serviços, com automações para coleta de dados e geração de relatórios.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">📊 Coletor de Métricas</h4>
                  <p className="text-white/80 text-sm">Scripts Python que extraem dados da API do GitHub.</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">🔄 Workflows</h4>
                  <p className="text-white/80 text-sm">GitHub Actions para orquestrar a coleta e atualização dos dados.</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">🌐 Frontend</h4>
                  <p className="text-white/80 text-sm">GitHub Pages para visualização e documentação.</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">📋 Diagramas de Arquitetura:</h4>
                <ul className="space-y-2 text-white/80">
                  <li>• <span className="text-blue-400">Visão Geral da Arquitetura</span></li>
                  <li>• <span className="text-blue-400">Documentação do Backend</span></li>
                  <li>• <span className="text-blue-400">Diagrama: Arquitetura Medallion</span></li>
                  <li>• <span className="text-blue-400">Diagrama: Fluxo ETL Sequencial</span></li>
                  <li>• <span className="text-blue-400">Diagrama: Topologia do Dashboard</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Requisitos */}
          <section id="req">
            <h2 className="text-3xl font-semibold text-white mb-6">Requisitos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Requisitos Funcionais */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-green-400 mb-4">Requisitos Funcionais</h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 font-bold">RF01:</span>
                    <span>Exibir dashboard de métricas de colaboração.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 font-bold">RF02:</span>
                    <span>Permitir alternar entre visão de repositório e organização.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 font-bold">RF03:</span>
                    <span>Coletar e exibir métricas de issues, commits, pull requests, tecnologias e qualidade de código.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 font-bold">RF04:</span>
                    <span>Fornecer explicações automáticas das métricas via IA.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 font-bold">RF05:</span>
                    <span>Atualizar dados automaticamente via GitHub Actions.</span>
                  </li>
                </ul>
              </div>

              {/* Requisitos Não-Funcionais */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-orange-400 mb-4">Requisitos Não-Funcionais</h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 font-bold">RNF01:</span>
                    <span>Interface responsiva e acessível.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 font-bold">RNF02:</span>
                    <span>Código aberto e documentado.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 font-bold">RNF03:</span>
                    <span>Atualização automática dos dados sem intervenção manual.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-orange-400 font-bold">RNF04:</span>
                    <span>Segurança dos dados sensíveis (tokens, etc).</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Stories */}
          <section id="stories">
            <h2 className="text-3xl font-semibold text-white mb-6">User Stories</h2>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-white/90">
                    Como <span className="font-semibold text-blue-400">mantenedor</span>, quero ver issues abertas e fechadas, 
                    para entender o andamento do projeto.
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-white/90">
                    Como <span className="font-semibold text-green-400">desenvolvedor</span>, quero ver quantos commits fiz no mês, 
                    para acompanhar minha contribuição.
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-white/90">
                    Como <span className="font-semibold text-purple-400">líder de equipe</span>, quero ver o tempo médio para revisar PRs, 
                    para identificar gargalos.
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="text-white/90">
                    Como <span className="font-semibold text-orange-400">gestor de organização</span>, quero métricas consolidadas de todos os repositórios, 
                    para avaliar performance geral.
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-pink-500">
                  <p className="text-white/90">
                    Como <span className="font-semibold text-pink-400">usuário iniciante</span>, quero que a IA explique métricas, 
                    para interpretar melhor os gráficos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Documentação Técnica */}
          <section id="docs">
            <h2 className="text-3xl font-semibold text-white mb-6">Documentação Técnica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Documentos Técnicos */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">📚 Documentos Técnicos</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• <span className="text-blue-400">Backend</span></li>
                  <li>• <span className="text-blue-400">Frontend</span></li>
                  <li>• <span className="text-blue-400">GitHub Actions</span></li>
                  <li>• <span className="text-blue-400">Benchmarking LinearB</span></li>
                  <li>• <span className="text-blue-400">Benchmarking Keypup</span></li>
                  <li>• <span className="text-blue-400">Benchmarking Swarmia e SonarCloud</span></li>
                  <li>• <span className="text-blue-400">Decisão Frontend</span></li>
                  <li>• <span className="text-blue-400">Levantamento Inicial</span></li>
                  <li>• <span className="text-blue-400">SCRUM e Métodos Ágeis</span></li>
                  <li>• <span className="text-blue-400">Testar API</span></li>
                  <li>• <span className="text-blue-400">Fluxo do Usuário</span></li>
                </ul>
              </div>

              {/* Atas de Reuniões */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-green-400 mb-4">📋 Atas de Reuniões</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-08-26.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">26/08/2025 - Reunião Inicial</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-08-28.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">28/08/2025 - Definição do Projeto</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-01.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">01/09/2025 - Retrospectiva e Planejamento</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-08.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">08/09/2025 - Planejamento da Sprint 2</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-09.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">09/09/2025 - Definição de Acesso e Planejamento</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-15.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">15/09/2025 - Pivô Estratégico e Priorização</a></li>
                </ul>
              </div>
            </div>

            {/* Arquivos e Diagramas */}
            <div className="mt-8 bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">📊 Arquivos e Diagramas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-purple-400 font-medium">• Diagrama C4 - Contexto</p>
                </div>
                <div>
                  <p className="text-purple-400 font-medium">• Diagrama C4 - Containers</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Link 
            href="/commits" 
            className="inline-flex items-center rounded-md bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-lg font-semibold text-white hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-blue-500/25"
          >
            🚀 Explorar Métricas →
          </Link>
        </div>
      </div>
    </div>
  );
}