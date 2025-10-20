import { Link } from 'react-router-dom';

export default function DocumentacaoPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden doc-page">
      {/* Fundo e efeitos visuais */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-blue-950/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600/10 rounded-full blur-3xl"></div>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}></div>
      
      <div className="relative mx-auto w-full max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link 
            to="/" 
            className="link-voltar"
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
        <div className="doc-nav">
          <a href="#intro">Introdução</a>
          <a href="#team">Equipe</a>
          <a href="#tech">Tecnologias</a>
          <a href="#arch">Arquitetura</a>
          <a href="#req">Requisitos</a>
          <a href="#stories">User Stories</a>
          <a href="#prototypes">Protótipos</a>
          <a href="#docs">Documentos</a>
        </div>

        {/* Content */}
        <div className="space-y-16">
          <section id="intro">
            <h2>Introdução</h2>
            <div className="doc-card">
              <p>
                O projeto CoOps foi desenvolvido na disciplina Métodos de Desenvolvimento de Software (MDS) da Engenharia de Software (UnB). 
                Seu objetivo é apoiar desenvolvedores, mantenedores e organizações na análise da colaboração dentro de projetos GitHub, 
                fornecendo métricas claras, visuais e interpretadas por IA.
              </p>
            </div>
          </section>

          <section id="team">
            <h2>Equipe</h2>
            <div className="doc-card">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p><span className="font-semibold text-blue-400">Scrum Master:</span> Pedro Druck</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p><span className="font-semibold text-green-400">Product Owner (PO):</span> Marcos Antonio</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <p><span className="font-semibold text-purple-400">Time de Desenvolvimento:</span></p>
                  </div>
                  <p className="ml-6 mt-1 text-white/70">Gustavo, Pedro Rocha, Carlos, Heitor</p>
                </div>
              </div>
            </div>
          </section>

          <section id="tech">
            <h2>Tecnologias Utilizadas</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="tech-card border-l-yellow-500">
                <h3>🐍 Python</h3>
                <p>Extração de dados via API GitHub</p>
              </div>
              <div className="tech-card border-l-blue-500">
                <h3>⚡ GitHub Actions</h3>
                <p>Automação de workflows</p>
              </div>
              <div className="tech-card border-l-orange-500">
                <h3>🎨 HTML5 & CSS3</h3>
                <p>Frontend e documentação (GitHub Pages)</p>
              </div>
              <div className="tech-card border-l-gray-500">
                <h3>📝 Markdown</h3>
                <p>Documentação estruturada</p>
              </div>
              <div className="tech-card border-l-pink-500">
                <h3>🎨 Figma</h3>
                <p>Protótipos e design</p>
              </div>
              <div className="tech-card border-l-cyan-500">
                <h3>⚛️ React/Next.js</h3>
                <p>Interface moderna e responsiva</p>
              </div>
            </div>
          </section>

          <section id="arch">
            <h2>Arquitetura do Projeto</h2>
            <div className="doc-card">
              <p>O projeto segue uma arquitetura orientada a serviços, com automações para coleta de dados e geração de relatórios.</p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="arch-card">
                  <h4>📊 Coletor de Métricas</h4>
                  <p>Scripts Python que extraem dados da API do GitHub.</p>
                </div>
                <div className="arch-card">
                  <h4>🔄 Workflows</h4>
                  <p>GitHub Actions para orquestrar a coleta e atualização dos dados.</p>
                </div>
                <div className="arch-card">
                  <h4>🌐 Frontend</h4>
                  <p>GitHub Pages para visualização e documentação.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="stories">
            <h2>📖 User Stories</h2>
            <div className="doc-card">
              <h3>Story Map Interativo</h3>
              <p>Explore o mapeamento completo das histórias de usuário do CoOps...</p>
              <div className="figma-embed-container">
                <div className="figma-embed-header">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span>Story Map CoOps - User Stories</span>
                  <a href="https://www.figma.com/design/ZjoCsY6wHtB5A6t2mhJNda/Story-Map?node-id=1-2&t=zzf2jH3mjS7wdccr-1" target="_blank" rel="noopener noreferrer">Abrir no Figma →</a>
                </div>
                <div className="figma-embed-iframe-wrapper">
                  <iframe src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FZjoCsY6wHtB5A6t2mhJNda%2FStory-Map%3Fnode-id%3D1-2%26t%3Dzzf2jH3mjS7wdccr-1" allowFullScreen></iframe>
                </div>
              </div>
            </div>
          </section>

          {/* ... Outras seções podem ser adicionadas da mesma forma ... */}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/commits" className="botao-final">
            🚀 Explorar Métricas →
          </Link>
        </div>

        <div className="space-y-16 mt-16">
          <section id="prototypes">
            <h2>🎨 Protótipo de Alta Fidelidade</h2>
            <div className="doc-card">
              <h3>Protótipo Interativo</h3>
              <p>Explore o protótipo de alta fidelidade do CoOps...</p>
              <div className="figma-embed-container">
                <div className="figma-embed-header">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span>Protótipo Alta Fidelidade - CoOps</span>
                  <a href="https://www.figma.com/proto/oCBp6kKarswmGbJAiIToyt/Prot%C3%B3tipo-Alta-Fidelidade?node-id=1-1080&p=f&t=JcFBYqvzn89t0xPV-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A1080" target="_blank" rel="noopener noreferrer">Abrir no Figma →</a>
                </div>
                <div className="figma-embed-iframe-wrapper">
                  <iframe src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FoCBp6kKarswmGbJAiIToyt%2FProt%25C3%25B3tipo-Alta-Fidelidade%3Fnode-id%3D1-1080%26p%3Df%26t%3DJcFBYqvzn89t0xPV-0%26scaling%3Dcontain%26content-scaling%3Dfixed%26page-id%3D0%253A1%26starting-point-node-id%3D1%253A1080&hide-ui=1" allowFullScreen></iframe>
                </div>
              </div>
            </div>
          </section>

          <section id="docs">
            <h2>📚 Documentos</h2>
            <div className="doc-card">
              <h3>Documentação Técnica</h3>
              <p>Acesse toda a documentação detalhada do projeto CoOps...</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/api/api.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-green-500 hover:bg-slate-800/50 transition-all">
                  <h3>🔌 API</h3>
                  <p>Integração com a API do GitHub</p>
                </a>
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/arquitetura/arquitetura.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-purple-500 hover:bg-slate-800/50 transition-all">
                  <h3>📐 Arquitetura</h3>
                  <p>Arquitetura do sistema</p>
                </a>
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/atas/atas.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-blue-500 hover:bg-slate-800/50 transition-all">
                  <h3>📝 Atas</h3>
                  <p>Atas de reuniões do time</p>
                </a>
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/backend/backend.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-red-500 hover:bg-slate-800/50 transition-all">
                  <h3>⚙️ Backend</h3>
                  <p>Documentação do backend</p>
                </a>
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/benchmarking/benchmarking.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-orange-500 hover:bg-slate-800/50 transition-all">
                  <h3>📊 Benchmarking</h3>
                  <p>Análise comparativa</p>
                </a>
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/benchmarking/levantamento-inicial.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-yellow-500 hover:bg-slate-800/50 transition-all">
                  <h3>🔍 Levantamento</h3>
                  <p>Levantamento inicial do produto</p>
                </a>
                <a href="https://unb-mds.github.io/2025-2-Squad-01/docs/frontend/frontend.html" target="_blank" rel="noopener noreferrer" className="tech-card border-l-cyan-500 hover:bg-slate-800/50 transition-all">
                  <h3>🎨 Frontend</h3>
                  <p>Documentação do frontend</p>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
