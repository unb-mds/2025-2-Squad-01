/**
 * Hook React para exportação de PDF
 * 
 * APENAS orquestra: busca dados pré-processados (Silver Layer) e gera PDF.
 * NÃO contém lógica de processamento ou agregação de dados.
 * 
 * Arquitetura:
 * Bronze → Python Silver Processor → Silver JSONs → Frontend (fetch) → PDF
 */

import { useState } from 'react';
import { PDFExporter, PDFExportOptions, RepositoryData } from '../utils/pdfExport';
import { 
  fetchPDFData, 
  filterDataByDate, 
  formatDate,
  validatePDFData,
  type PDFRepositoryData 
} from '../utils/pdfDataFetcher';

interface UseRepositoryPDFExport {
  exportToPDF: (options: PDFExportOptions) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

/**
 * Transforma dados da Silver Layer para formato do PDFExporter
 */
const transformToRepositoryData = (silverData: PDFRepositoryData): RepositoryData => {
  return {
    name: silverData.repository.name,
    description: silverData.repository.description,
    stats: {
      totalCommits: silverData.stats.total_commits,
      totalIssues: silverData.stats.total_issues,
      totalPRs: silverData.stats.total_prs,
      totalMembers: silverData.stats.total_members,
      createdAt: silverData.repository.created_at,
      updatedAt: silverData.repository.updated_at
    },
    members: silverData.members.map(member => ({
      login: member.login,
      commits: member.commits,
      issues: member.issues,
      prs: member.prs,
      contributions: member.total_contributions
    })),
    commits: silverData.recent_commits.map(commit => ({
      author: commit.author,
      message: commit.message,
      date: commit.date,
      additions: commit.additions,
      deletions: commit.deletions
    })),
    issues: silverData.recent_issues.map(issue => ({
      title: issue.title,
      author: issue.author,
      state: issue.state,
      createdAt: issue.created_at,
      closedAt: issue.closed_at
    })),
    pullRequests: silverData.recent_prs.map(pr => ({
      title: pr.title,
      author: pr.author,
      state: pr.state,
      createdAt: pr.created_at,
      mergedAt: pr.merged_at
    }))
  };
};

export const useRepositoryPDFExport = (repoName: string): UseRepositoryPDFExport => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToPDF = async (options: PDFExportOptions): Promise<void> => {
    try {
      setIsExporting(true);
      setError(null);

      // 1. Buscar dados pré-processados da Silver Layer (SEM processar)
      console.log(`[PDF Export] Fetching pre-processed data for ${repoName}...`);
      let silverData = await fetchPDFData(repoName);
      
      // 2. Validar dados
      if (!validatePDFData(silverData)) {
        throw new Error('Dados inválidos recebidos da Silver Layer');
      }
      
      console.log('[PDF Export] Silver data loaded:', {
        repo: silverData.repository.name,
        stats: silverData.stats,
        members: silverData.members.length
      });

      // 3. Aplicar filtro de data se necessário (opcional)
      if (options.startDate || options.endDate) {
        console.log('[PDF Export] Applying date filter:', {
          startDate: options.startDate,
          endDate: options.endDate
        });
        
        silverData = filterDataByDate(silverData, {
          startDate: options.startDate,
          endDate: options.endDate
        });
      }

      // 4. Transformar para formato do PDFExporter
      const repositoryData = transformToRepositoryData(silverData);

      // 5. Gerar PDF
      console.log('[PDF Export] Generating PDF...');
      const exporter = new PDFExporter();
      await exporter.generateRepositoryReport(repositoryData, options);
      
      // 6. Salvar arquivo
      const fileName = `${repoName}_report_${new Date().toISOString().split('T')[0]}`;
      exporter.save(fileName);
      
      console.log('[PDF Export] PDF generated successfully:', fileName);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[PDF Export] Error:', errorMessage, err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    isExporting,
    error
  };
};
