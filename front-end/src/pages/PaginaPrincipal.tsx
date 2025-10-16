import { Link } from 'react-router-dom';

export default function PaginaPrincipal() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: '#181818' }}>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 opacity-100">

        {/* Adicionada a classe "container-principal" para forçar o layout */}
        <div className="container-principal grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Coluna da Esquerda: Textos e Botões */}
          <div>
            <h1 className="text-7xl font-didot font-bold text-gray-200 leading-tight animate-fade-in">
              Do overview<br /> ao detalhe<br /> em um clique
            </h1>
            <h2 className="mt-4 text-2xl font-normal text-gray-200 animate-fade-in-delayed">
              Veja commits e colaboração por repositório ou organização - tudo em uma só tela.
            </h2>

            <div className="mt-10 space-y-4 animate-fade-in-delayed-2">
              
              {/* Adicionada a classe "container-botoes" para forçar o layout */}
              <div className="container-botoes flex flex-col sm:flex-row gap-4">
                <div className="hover:scale-105 transition-transform duration-200">
                  <Link 
                    to="/repos/commits" 
                    className="botao-principal"
                  >
                    Ver Métricas
                  </Link>
                </div>
                <div className="hover:scale-105 transition-transform duration-200">
                  <Link 
                    to="/documentacao" 
                    className="botao-secundario"
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

          {/* Coluna da Direita: Gráfico SVG */}
          <div className="flex items-start justify-center relative grafico-container mt-0">
            <svg 
              width="540" 
              height="320" 
              viewBox="0 0 540 320" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="grafico-principal animate-fade-in-delayed-2 rounded-md relative z-10 hover:scale-105 transition-transform duration-300 opacity-100"
            >
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7db7ffb6" stopOpacity={100} />   
                <stop offset="100%" stopColor="#7db7ffff" stopOpacity={0}/> 
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7db7ffb6" stopOpacity={10} />   
                <stop offset="100%" stopColor="#7db7ffb6" stopOpacity={0}/> 
              </linearGradient>
              <linearGradient id="gradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7db7ffb6" stopOpacity={10} />   
                <stop offset="95%" stopColor="#7db7ffb6" stopOpacity={0}/> 
              </linearGradient>
              <linearGradient id="gradient5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7db8ffff" />   
                <stop offset="100%" stopColor="#1a1a1aff" /> 
              </linearGradient>
            </defs>
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="70%" stopColor="#222222" />   
                <stop offset="100%" stopColor="#181818" /> 
              </linearGradient>
            </defs>            
              {/* Background */}
              <rect x="0" y="0" width="540" height="320" rx="10" fill="url(#gradient2)" />
              

              {/* Barras com gradientes */}
              <g transform="translate(75,30)">
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '0ms' }} x="0" y="170" width="70" height="115" rx="6" fill="url(#barGradientUniform)" opacity="0.69" />

                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '120ms' }} x="100" y="80" width="70" height="150" rx="6" fill="url(#barGradientUniform)" opacity="0.75" />

                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '240ms' }} x="200" y="0" width="70" height="290" rx="6" fill="url(#barGradientUniform)" opacity="0.95" />

                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '360ms' }} x="300" y="150" width="70" height="80" rx="6" fill="url(#barGradientUniform)" opacity="0.7" />
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} x="400" y="230" width="70" height="60" rx="6" fill="url(#barGradientUniform)" opacity="0.6" />
              </g>



              {/* Marcações de altura e máscara alinhadas */}
              <g transform="translate(40,30)">
                <mask id="barMask">
                  <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '600ms' }} x="0" y="0" width="470" height="320" fill="white" />
                  <g>
                    <rect x="0" y="170" width="70" height="120" rx="6" fill="black" />
                    <rect x="100" y="80" width="70" height="220" rx="6" fill="black" />
                    <rect x="200" y="0" width="70" height="290" rx="6" fill="black" />
                    <rect x="300" y="150" width="70" height="140" rx="6" fill="black" />
                    <rect x="400" y="230" width="70" height="60" rx="6" fill="black" />
                  </g>
                </mask>
                {/* Linhas horizontais com gradiente de opacidade e máscara */}
                <g mask="url(#barMask)">
                  <line x1="0" y1="50" x2="540" y2="50" stroke="#64748b" strokeWidth="1" strokeDasharray="6.8" opacity="0.25" />
                  <line x1="0" y1="100" x2="540" y2="100" stroke="#64748b" strokeWidth="1" strokeDasharray="6.8" opacity="0.22" />
                  <line x1="0" y1="150" x2="540" y2="150" stroke="#64748b" strokeWidth="1" strokeDasharray="6.8" opacity="0.18" />
                  <line x1="0" y1="200" x2="540" y2="200" stroke="#64748b" strokeWidth="1" strokeDasharray="6.8" opacity="0.13" />
                  <line x1="0" y1="250" x2="540" y2="250" stroke="#64748b" strokeWidth="1" strokeDasharray="6.8" opacity="0.08" />
                  <line x1="0" y1="300" x2="540" y2="300" stroke="#64748b" strokeWidth="1" strokeDasharray="6.8" opacity="0.04" />
                </g>
                {/* Barras com gradientes */}
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '0ms' }} x="0" y="170" width="70" height="120" rx="6" fill="url(#gradient1)" opacity="0.7" />
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '120ms' }} x="100" y="80" width="70" height="220" rx="6" fill="url(#gradient4)" opacity="0.85" />
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '240ms' }} x="200" y="0" width="70" height="290" rx="6" fill="url(#gradient1)" opacity="0.95" />
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '360ms' }} x="300" y="150" width="70" height="140" rx="6" fill="url(#gradient1)" opacity="0.8" />
                <rect className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} x="400" y="230" width="70" height="60" rx="6" fill="url(#gradient3)" opacity="0.65" />
              </g>
                            {/* Gráfico de linha sobreposto */}
              <g transform="translate(40,30)">
                <polyline
                  points="35,205 135,115 235,35 335,185 435,265"
                  fill="none"
                  stroke="#ffffffff"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  opacity="0.85"
                  className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }}
                />
                {/* Pontos da linha */}
                <circle className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} cx="35" cy="205" r="5" fill="#ffffffff " />
                <circle className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} cx="135" cy="115" r="5" fill="#ffffffff" />
                <circle className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} cx="235" cy="35" r="5" fill="#ffffffff" />
                <circle className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} cx="335" cy="185" r="5" fill="#ffffffff" />
                <circle className="animate-fade-in-delayed-3" style={{ animationDelay: '480ms' }} cx="435" cy="265" r="5" fill="#ffffffff" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}