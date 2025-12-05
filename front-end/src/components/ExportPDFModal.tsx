import { useState } from 'react';
import { PDFExportOptions } from '../utils/pdfExport';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PDFExportOptions) => Promise<void>;
  repoName: string;
}

export const ExportPDFModal: React.FC<ExportPDFModalProps> = ({
  isOpen,
  onClose,
  onExport,
  repoName
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [sections, setSections] = useState({
    overview: true,
    members: true,
    commits: true,
    issues: true,
    prs: true,
    collaboration: false
  });

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const options: PDFExportOptions = {
        repoName,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeSections: sections
      };

      await onExport(options);
      onClose();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setExporting(false);
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📄</span>
              Exportar para PDF
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={exporting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Repositório: <span className="text-white font-semibold">{repoName}</span>
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {/* Período */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">📅 Período</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Data Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={exporting}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={exporting}
                />
              </div>
            </div>
            {!startDate && !endDate && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Deixe em branco para exportar todos os dados disponíveis
              </p>
            )}
          </div>

          {/* Seções */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">📊 Seções do Relatório</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.overview}
                  onChange={() => toggleSection('overview')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  disabled={exporting}
                />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">📈 Visão Geral</span>
                  <p className="text-xs text-gray-400">Estatísticas gerais do repositório</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.members}
                  onChange={() => toggleSection('members')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  disabled={exporting}
                />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">👥 Membros</span>
                  <p className="text-xs text-gray-400">Atividades e contribuições dos membros</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.commits}
                  onChange={() => toggleSection('commits')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  disabled={exporting}
                />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">💻 Commits</span>
                  <p className="text-xs text-gray-400">Lista de commits do período</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.issues}
                  onChange={() => toggleSection('issues')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  disabled={exporting}
                />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">🐛 Issues</span>
                  <p className="text-xs text-gray-400">Issues abertas e fechadas</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={sections.prs}
                  onChange={() => toggleSection('prs')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  disabled={exporting}
                />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">🔀 Pull Requests</span>
                  <p className="text-xs text-gray-400">PRs criados e mergeados</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-750 transition-colors cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={sections.collaboration}
                  onChange={() => toggleSection('collaboration')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  disabled={true}
                />
                <div className="flex-1">
                  <span className="text-sm text-white font-medium">🤝 Colaboração</span>
                  <p className="text-xs text-gray-400">Gráficos de colaboração (Em breve)</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={exporting}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={exporting || (!sections.overview && !sections.members && !sections.commits && !sections.issues && !sections.prs)}
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
