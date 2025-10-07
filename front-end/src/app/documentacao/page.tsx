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
          <a href="#prototypes" className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Protótipos</a>
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

              {/* Diagramas C4 */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-6">📊 Diagramas C4 - Arquitetura do Sistema</h4>
                <ul className="space-y-4 text-white/80 text-lg">
                  <li>
                    <span className="text-blue-400 font-semibold">🏗️ Nível 1: Contexto do Sistema</span><br />
                    <a
                      href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/arquitetura/Level1-System_Context_Diagram.svg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      Visualizar Diagrama no GitHub
                    </a>
                  </li>
                  <li>
                    <span className="text-green-400 font-semibold">📦 Nível 2: Diagrama de Contêineres</span><br />
                    <a
                      href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/arquitetura/Level2-Container-Diagram.drawio.svg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 underline hover:text-green-300"
                    >
                      Visualizar Diagrama no GitHub
                    </a>
                  </li>
                  <li>
                    <span className="text-purple-400 font-semibold">🧩 Nível 3: Diagrama de Componentes (Frontend)</span><br />
                    <a
                      href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/arquitetura/Level-3-Frontend-Component-Diagram.svg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 underline hover:text-purple-300"
                    >
                      Visualizar Diagrama no GitHub
                    </a>
                  </li>
                  <li>
                    <span className="text-pink-400 font-semibold">🧩 Nível 3: Diagrama de Componentes (ETL Scripts)</span><br />
                    <a
                      href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/arquitetura/docs_adr/Level3-ETL-Scripts-component-diagram.svg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 underline hover:text-pink-300"
                    >
                      Visualizar Diagrama no GitHub
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-3">📋 Componentes da Arquitetura:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-purple-400">👥 Atores do Sistema:</h5>
                    <ul className="space-y-1 text-white/80 text-sm">
                      <li>• <span className="text-blue-400">Gestores de Projetos</span> - Donos de organizações GitHub</li>
                      <li>• <span className="text-green-400">Estudantes</span> - Contribuidores de engenharia de software</li>
                      <li>• <span className="text-yellow-400">Pesquisadores</span> - Analistas de dados de repositórios</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-semibold text-orange-400">🔧 Sistemas Principais:</h5>
                    <ul className="space-y-1 text-white/80 text-sm">
                      <li>• <span className="text-blue-400">Sistema de Visualização</span> - Interface de métricas</li>
                      <li>• <span className="text-green-400">Sistema de Extração</span> - Coleta de dados GitHub</li>
                      <li>• <span className="text-purple-400">Arquitetura Medallion</span> - Processamento em camadas</li>
                    </ul>
                  </div>
                </div>
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
            <h2 className="text-3xl font-semibold text-white mb-6">📖 User Stories</h2>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Story Map Interativo</h3>
                <p className="text-white/80 mb-6">
                  Explore o mapeamento completo das histórias de usuário do CoOps. O Story Map apresenta 
                  a jornada do usuário organizada por épicos, features e tarefas, mostrando o fluxo 
                  completo desde o acesso inicial até a análise avançada de métricas.
                </p>
              </div>
              
              {/* Figma Embed */}
              <div className="relative w-full bg-slate-900/50 rounded-lg border border-slate-600/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 border-b border-slate-600/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-white/60 text-sm">Story Map CoOps - User Stories</span>
                  <a 
                    href="https://www.figma.com/design/ZjoCsY6wHtB5A6t2mhJNda/Story-Map?node-id=1-2&t=zzf2jH3mjS7wdccr-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Abrir no Figma →
                  </a>
                </div>
                
                <div className="relative pb-[75%] h-0">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FZjoCsY6wHtB5A6t2mhJNda%2FStory-Map%3Fnode-id%3D1-2%26t%3Dzzf2jH3mjS7wdccr-1"
                    allowFullScreen
                    style={{ border: 'none' }}
                    title="Story Map CoOps - User Stories"
                  />
                </div>
              </div>

              {/* Story Map Information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">🎯 Épicos Principais</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Autenticação e Acesso</li>
                    <li>• Visualização de Métricas</li>
                    <li>• Análise de Dados</li>
                    <li>• Configurações do Sistema</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">👥 Personas Identificadas</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• <span className="text-blue-400">Gestor de Projetos</span></li>
                    <li>• <span className="text-green-400">Desenvolvedor</span></li>
                    <li>• <span className="text-yellow-400">Pesquisador</span></li>
                    <li>• <span className="text-pink-400">Estudante</span></li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-400 mb-2">📊 Funcionalidades Core</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Dashboard de métricas</li>
                    <li>• Análise de colaboração</li>
                    <li>• Relatórios automatizados</li>
                    <li>• Exportação de dados</li>
                  </ul>
                </div>
              </div>

              {/* Key User Stories Summary */}
              <div className="mt-8 bg-slate-700/20 p-6 rounded-lg border border-slate-600/30">
                <h4 className="text-lg font-semibold text-white mb-4">🔑 Histórias Principais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/90 text-sm">
                        <strong className="text-blue-400">Gestor:</strong> Visualizar métricas consolidadas da organização para tomada de decisões estratégicas
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/90 text-sm">
                        <strong className="text-green-400">Desenvolvedor:</strong> Acompanhar contribuições individuais e performance da equipe
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/90 text-sm">
                        <strong className="text-yellow-400">Pesquisador:</strong> Acessar dados brutos para análises acadêmicas e estudos
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-white/90 text-sm">
                        <strong className="text-pink-400">Estudante:</strong> Entender métricas de colaboração para aprendizado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Protótipos */}
          <section id="prototypes">
            <h2 className="text-3xl font-semibold text-white mb-6">🎨 Protótipos</h2>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Protótipo de Alta Fidelidade</h3>
                <p className="text-white/80 mb-6">
                  Visualize o protótipo interativo da aplicação CoOps desenvolvido no Figma. 
                  O protótipo apresenta a interface principal com métricas de colaboração, 
                  dashboards e funcionalidades de análise de repositórios GitHub.
                </p>
              </div>
              
              {/* Figma Embed */}
              <div className="relative w-full bg-slate-900/50 rounded-lg border border-slate-600/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 border-b border-slate-600/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-white/60 text-sm">Protótipo CoOps - Alta Fidelidade</span>
                  <a 
                    href="https://www.figma.com/proto/oCBp6kKarswmGbJAiIToyt/Prot%C3%B3tipo-Alta-Fidelidade?node-id=17-460&p=f&t=JcFBYqvzn89t0xPV-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A1080&show-proto-sidebar=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Abrir no Figma →
                  </a>
                </div>
                
                <div className="relative pb-[75%] h-0">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FoCBp6kKarswmGbJAiIToyt%2FProt%25C3%25B3tipo-Alta-Fidelidade%3Fnode-id%3D17-460%26p%3Df%26t%3DJcFBYqvzn89t0xPV-0%26scaling%3Dcontain%26content-scaling%3Dfixed%26page-id%3D0%253A1%26starting-point-node-id%3D1%253A1080%26show-proto-sidebar%3D1"
                    allowFullScreen
                    style={{ border: 'none' }}
                    title="Protótipo CoOps - Alta Fidelidade"
                  />
                </div>
              </div>

              {/* Prototype Information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400 mb-2">🎯 Funcionalidades Principais</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Dashboard de métricas interativo</li>
                    <li>• Visualização de dados de repositórios</li>
                    <li>• Análise de colaboração entre desenvolvedores</li>
                    <li>• Interface responsiva e intuitiva</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">🔗 Links Relacionados</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/prototipo_alta_fidelidade.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Documentação do Protótipo</a></li>
                    <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/prototipo_baixa_fidelidade.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Protótipo Baixa Fidelidade</a></li>
                    <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/FIGMA.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Guia do Figma</a></li>
                  </ul>
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
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Documentacao-Backend.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Backend</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Documentacao-Frontend.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Frontend</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Requisitos.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Requisitos</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Levantamento-Inicial-do-Produto.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Levantamento Inicial</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/SCRUM-e-Metodos-Agile.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">SCRUM e Métodos Ágeis</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Benchmarking-LinearB.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Benchmarking LinearB</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Benchmarking-Keypup.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Benchmarking Keypup</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/OqueEAPI.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">O que é API</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Estudo-Completo-sobre-GitHub-Actions.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">GitHub Actions</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Decisao-Frontend.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Decisão Frontend</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/Testar-API.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Testar API</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/fluxos/fluxo_usuario_metricas_github.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Fluxo do Usuário</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/OqueEAPI.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">O que é API</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/FIGMA.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Figma</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/prototipo_baixa_fidelidade.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Protótipo Baixa Fidelidade</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/prototipo_alta_fidelidade.md" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Protótipo Alta Fidelidade</a></li>
                </ul>
              </div>

              {/* Atas de Reuniões */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-green-400 mb-4">📋 Atas de Reuniões</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/tree/main/docs/atas" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">Atas de Reuniões - Todas</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-08-26.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">26/08/2025 - Reunião Inicial</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-08-28.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">28/08/2025 - Definição do Projeto</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-01.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">01/09/2025 - Retrospectiva e Planejamento</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-08.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">08/09/2025 - Planejamento da Sprint 2</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-09.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">09/09/2025 - Definição de Acesso e Planejamento</a></li>
                  <li>• <a href="https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/atas/2025-09-15.md" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">15/09/2025 - Pivô Estratégico e Priorização</a></li>
                </ul>
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
