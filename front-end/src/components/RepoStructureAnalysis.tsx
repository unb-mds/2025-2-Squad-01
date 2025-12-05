import { useState } from 'react';

interface LanguageData {
  language: string;
  file_count: number;
  total_bytes: number;
  percentage: number;
}

interface RepoAnalysis {
  repository: string;
  owner: string;
  branch: string;
  total_files: number;
  total_bytes: number;
  languages: LanguageData[];
}

interface RepoStructureAnalysisProps {
  data: RepoAnalysis;
}

export const RepoStructureAnalysis: React.FC<RepoStructureAnalysisProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = () => {
    setLoading(true);
    
    // Análise baseada nas linguagens e estrutura
    const sortedLanguages = [...data.languages].sort((a, b) => b.percentage - a.percentage);
    const primaryLanguage = sortedLanguages[0];
    const secondaryLanguages = sortedLanguages.slice(1, 4);
    
    let analysisText = `## 🔍 Análise da Estrutura do Repositório\n\n`;
    
    // 1. Linguagem Principal
    analysisText += `### 🎯 Linguagem Dominante\n`;
    analysisText += `**${primaryLanguage.language}** é a linguagem predominante, representando **${primaryLanguage.percentage.toFixed(1)}%** do código `;
    analysisText += `(${primaryLanguage.file_count} arquivos, ${formatBytes(primaryLanguage.total_bytes)}). `;
    
    // Interpretação baseada na linguagem
    const languageInsights: Record<string, string> = {
      'Python': 'Isso sugere um projeto focado em backend, ciência de dados, automação ou machine learning. Python é conhecida por sua versatilidade e produtividade.',
      'JavaScript': 'Indica um projeto web dinâmico, possivelmente com foco em funcionalidades interativas no frontend ou backend Node.js.',
      'TypeScript': 'Demonstra um projeto moderno com tipagem estática, geralmente usado em aplicações web escaláveis e de grande porte.',
      'Java': 'Aponta para uma aplicação empresarial robusta, com foco em performance e arquitetura orientada a objetos.',
      'HTML': 'Sugere um projeto web com foco em estrutura e conteúdo de páginas.',
      'CSS': 'Indica forte ênfase em estilização e design visual.',
      'Go': 'Sugere um projeto focado em performance, concorrência e microsserviços.',
      'Rust': 'Indica um projeto que prioriza segurança de memória e performance extrema.',
      'C++': 'Aponta para sistemas de alto desempenho, jogos ou aplicações que exigem controle fino de recursos.',
      'Shell': 'Demonstra automação de infraestrutura, scripts de build ou DevOps.'
    };
    
    analysisText += languageInsights[primaryLanguage.language] || 'Esta linguagem oferece características específicas para o domínio do projeto.';
    analysisText += `\n\n`;
    
    // 2. Linguagens Secundárias
    if (secondaryLanguages.length > 0) {
      analysisText += `### 🔧 Linguagens Complementares\n`;
      secondaryLanguages.forEach(lang => {
        analysisText += `- **${lang.language}** (${lang.percentage.toFixed(1)}%): `;
        
        const complementaryInsights: Record<string, string> = {
          'HTML': 'Interface de usuário e estruturação de conteúdo web.',
          'CSS': 'Estilização e apresentação visual da aplicação.',
          'JavaScript': 'Interatividade e lógica do frontend.',
          'TypeScript': 'Tipagem estática para código JavaScript mais robusto.',
          'JSON': 'Configurações e estruturas de dados.',
          'YAML': 'Arquivos de configuração e pipelines.',
          'Markdown': 'Documentação do projeto.',
          'Shell': 'Scripts de automação e build.',
          'Python': 'Scripts auxiliares ou backend.',
          'Dockerfile': 'Configuração de containers e deployment.'
        };
        
        analysisText += complementaryInsights[lang.language] || 'Suporte adicional ao projeto.';
        analysisText += `\n`;
      });
      analysisText += `\n`;
    }
    
    // 3. Arquitetura Inferida
    analysisText += `### 🏗️ Arquitetura Inferida\n`;
    
    const hasHTML = data.languages.some(l => l.language === 'HTML');
    const hasCSS = data.languages.some(l => l.language === 'CSS' || l.language === 'SCSS');
    const hasJS = data.languages.some(l => ['JavaScript', 'TypeScript'].includes(l.language));
    const hasPython = data.languages.some(l => l.language === 'Python');
    const hasJava = data.languages.some(l => l.language === 'Java');
    
    if (hasHTML && hasCSS && hasJS) {
      analysisText += `Este repositório apresenta uma **arquitetura web completa** com:\n`;
      analysisText += `- ✅ **Frontend**: Estrutura HTML, estilização CSS/SCSS e lógica JavaScript/TypeScript\n`;
      if (hasPython || hasJava) {
        analysisText += `- ✅ **Backend**: Provavelmente separado usando ${hasPython ? 'Python' : 'Java'}\n`;
        analysisText += `- ✅ **Stack Full-Stack**: Aplicação web completa com separação de responsabilidades\n`;
      }
    } else if (primaryLanguage.language === 'Python' && data.total_files > 20) {
      analysisText += `Projeto estruturado em **Python**, possivelmente com:\n`;
      analysisText += `- Backend API (Flask/Django/FastAPI)\n`;
      analysisText += `- Scripts de processamento ou análise de dados\n`;
      analysisText += `- Testes automatizados\n`;
    } else if (primaryLanguage.language === 'JavaScript' || primaryLanguage.language === 'TypeScript') {
      analysisText += `Projeto **JavaScript/TypeScript**, indicando:\n`;
      analysisText += `- Aplicação web moderna (React/Vue/Angular)\n`;
      analysisText += `- Possivelmente servidor Node.js\n`;
      analysisText += `- Build tools e bundling\n`;
    }
    analysisText += `\n`;
    
    // 4. Tamanho e Complexidade
    analysisText += `### 📊 Métricas de Complexidade\n`;
    analysisText += `- **Total de Arquivos**: ${data.total_files} arquivos\n`;
    analysisText += `- **Tamanho Total**: ${formatBytes(data.total_bytes)}\n`;
    analysisText += `- **Diversidade de Linguagens**: ${data.languages.length} linguagens diferentes\n`;
    
    const avgFilesPerLanguage = data.total_files / data.languages.length;
    const complexityLevel = data.total_files < 50 ? 'baixa' : data.total_files < 200 ? 'média' : 'alta';
    
    analysisText += `\n**Avaliação**: Projeto de complexidade **${complexityLevel}** `;
    analysisText += `(${avgFilesPerLanguage.toFixed(0)} arquivos por linguagem em média). `;
    
    if (complexityLevel === 'alta') {
      analysisText += `Este é um projeto robusto que provavelmente requer boa organização e documentação.`;
    } else if (complexityLevel === 'média') {
      analysisText += `Tamanho adequado para uma aplicação funcional com escopo bem definido.`;
    } else {
      analysisText += `Projeto compacto, possivelmente em estágio inicial ou com escopo focado.`;
    }
    analysisText += `\n\n`;
    
    // 5. Recomendações
    analysisText += `### 💡 Recomendações\n`;
    
    if (primaryLanguage.percentage > 80) {
      analysisText += `- ⚠️ **Diversificação**: ${primaryLanguage.percentage.toFixed(0)}% do código está em uma única linguagem. Considere se há oportunidades para modularização.\n`;
    }
    
    if (!data.languages.some(l => l.language === 'Markdown')) {
      analysisText += `- 📝 **Documentação**: Adicione arquivos Markdown (README.md, CONTRIBUTING.md) para melhorar a documentação.\n`;
    }
    
    if (data.languages.length > 10) {
      analysisText += `- 🎯 **Padronização**: Com ${data.languages.length} linguagens, considere padronizar o stack para facilitar manutenção.\n`;
    }
    
    const hasTests = data.languages.some(l => 
      l.language.toLowerCase().includes('test') || 
      data.repository.toLowerCase().includes('test')
    );
    
    if (!hasTests && data.total_files > 30) {
      analysisText += `- ✅ **Testes**: Considere adicionar testes automatizados para garantir qualidade.\n`;
    }
    
    setAnalysis(analysisText);
    setLoading(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Títulos
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('## ', '')}</h2>;
      }
      
      // Listas
      if (line.startsWith('- ')) {
        const content = line.replace('- ', '');
        return (
          <li key={index} className="text-slate-300 ml-4 mb-1">
            {renderInlineFormatting(content)}
          </li>
        );
      }
      
      // Parágrafo vazio
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Parágrafo normal
      return (
        <p key={index} className="text-slate-300 mb-2">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    // **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="border rounded-lg mb-6" style={{ backgroundColor: '#222222', borderColor: '#333333' }}>
      {/* Header */}
      <button
        onClick={() => {
          if (!analysis && !loading) {
            generateAnalysis();
          }
          setIsExpanded(!isExpanded);
        }}
        className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div className="text-left">
            <h3 className="text-xl font-semibold">Análise Inteligente da Estrutura</h3>
            <p className="text-sm text-slate-400">
              Interpretação automática da organização e linguagens do repositório
            </p>
          </div>
        </div>
        <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t" style={{ borderTopColor: '#333333' }}>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-slate-400">Analisando estrutura do repositório...</p>
              </div>
            </div>
          )}

          {!loading && analysis && (
            <div className="mt-4 prose prose-invert max-w-none">
              {renderMarkdown(analysis)}
            </div>
          )}

          {!loading && !analysis && (
            <div className="py-8 text-center">
              <button
                onClick={generateAnalysis}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                🚀 Gerar Análise
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
