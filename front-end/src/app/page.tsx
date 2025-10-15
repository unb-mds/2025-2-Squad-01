import Link from 'next/link';

export default function Home() {
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
      
      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 opacity-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-7xl font-didot text-blue-600 leading-tight animate-fade-in">
              Do overview<br /> ao detalhe<br /> em um clique.
            </h1>
            <h2 className="mt-4 text-2xl font-semibold text-white animate-fade-in-delayed">
              Veja commits e colaboração por repositório ou organização - tudo em uma só tela.
            </h2>

            <div className="mt-10 space-y-4 animate-fade-in-delayed-2">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="hover:scale-105 transition-transform duration-200">
                  <Link 
                    href="/commits" 
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-500 transition-colors w-full"
                  >
                    Ver Métricas de Commits
                  </Link>
                </div>
                <div className="hover:scale-105 transition-transform duration-200">
                  <Link 
                    href="/documentacao" 
                    className="inline-flex items-center justify-center rounded-md bg-slate-600 px-8 py-4 text-lg font-semibold text-white hover:bg-slate-500 transition-colors w-full"
                  >
                    Documentação
                  </Link>
                </div>
              </div>
              
              <p className="text-white/60 text-sm">
                Selecione repositórios específicos ou visualize dados agregados da organização
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center relative">
            {/* Brilho sutil atrás do gráfico */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-xl scale-110"></div>
            
            {/* Generic chart preview as white card */}
            <svg 
              width="520" 
              height="320" 
              viewBox="0 0 520 320" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="rounded-md shadow-2xl relative z-10 hover:scale-105 transition-transform duration-300 opacity-100"
            >
              <rect x="0" y="0" width="520" height="320" rx="10" fill="#E0E0E0" />
              <g transform="translate(40,30)">
                <rect x="0" y="180" width="70" height="120" rx="4" fill="#2563eb" />
                <rect x="100" y="80" width="70" height="220" rx="4" fill="#2563eb" />
                <rect x="200" y="0" width="70" height="290" rx="4" fill="#2563eb" />
                <rect x="300" y="150" width="70" height="140" rx="4" fill="#2563eb" />
                <rect x="400" y="230" width="70" height="90" rx="4" fill="#2563eb" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
