/**
 * PDF Data Fetcher - Utils (SEM REACT)
 * 
 * Módulo limpo para buscar dados pré-processados da Silver Layer.
 * NÃO contém lógica React, hooks ou estado.
 * Apenas fetch e transformação de dados.
 */

export interface PDFRepositoryData {
  _metadata: {
    repo_name: string;
    processed_at: string;
    processor: string;
    layer: string;
  };
  repository: {
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    language: string;
    license: string;
  };
  stats: {
    total_commits: number;
    total_issues: number;
    total_prs: number;
    total_members: number;
  };
  members: MemberStats[];
  recent_commits: CommitData[];
  recent_issues: IssueData[];
  recent_prs: PRData[];
}

export interface MemberStats {
  login: string;
  commits: number;
  issues: number;
  prs: number;
  total_contributions: number;
}

export interface CommitData {
  author: string;
  message: string;
  date: string;
  additions: number;
  deletions: number;
}

export interface IssueData {
  number: number;
  title: string;
  author: string;
  state: string;
  created_at: string;
  closed_at?: string;
}

export interface PRData {
  number: number;
  title: string;
  author: string;
  state: string;
  created_at: string;
  merged_at?: string;
}

export interface DateFilterOptions {
  startDate?: string; // ISO format
  endDate?: string;   // ISO format
}

/**
 * Busca dados pré-processados da Silver Layer
 * @param repoName Nome do repositório
 * @returns Dados agregados prontos para PDF
 */
export async function fetchPDFData(repoName: string): Promise<PDFRepositoryData> {
  const baseUrl = 'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/extracaoPDf/data/silver/pdf/';
  const url = `${baseUrl}pdf_data_${repoName}.json`;
  
  console.log('[PDF Data Fetcher] Fetching from:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error('[PDF Data Fetcher] Failed to fetch:', {
      url,
      status: response.status,
      statusText: response.statusText
    });
    throw new Error(`Falha ao buscar dados: ${response.status} - ${response.statusText}`);
  }
  
  const data: PDFRepositoryData = await response.json();
  return data;
}

/**
 * Filtra dados por período de data (caso necessário)
 * NOTA: Idealmente, este filtro deveria estar no backend.
 * Mantido aqui apenas para flexibilidade de período customizado.
 */
export function filterDataByDate(
  data: PDFRepositoryData,
  options: DateFilterOptions
): PDFRepositoryData {
  if (!options.startDate && !options.endDate) {
    return data; // Sem filtro, retorna tudo
  }
  
  const startDate = options.startDate ? new Date(options.startDate) : new Date(0);
  const endDate = options.endDate ? new Date(options.endDate) : new Date();
  
  // Função auxiliar para verificar se data está no range
  const isInRange = (dateStr: string): boolean => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    return date >= startDate && date <= endDate;
  };
  
  // Filtrar commits
  const filteredCommits = data.recent_commits.filter(commit => 
    isInRange(commit.date)
  );
  
  // Filtrar issues
  const filteredIssues = data.recent_issues.filter(issue => 
    isInRange(issue.created_at)
  );
  
  // Filtrar PRs
  const filteredPRs = data.recent_prs.filter(pr => 
    isInRange(pr.created_at)
  );
  
  // Recalcular stats se necessário
  // NOTA: Isso é uma simplificação. Idealmente, reprocessar no backend.
  const filteredData: PDFRepositoryData = {
    ...data,
    stats: {
      ...data.stats,
      total_commits: filteredCommits.length,
      total_issues: filteredIssues.length,
      total_prs: filteredPRs.length
    },
    recent_commits: filteredCommits,
    recent_issues: filteredIssues,
    recent_prs: filteredPRs
  };
  
  return filteredData;
}

/**
 * Formata data para exibição PT-BR
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Valida se os dados são válidos
 */
export function validatePDFData(data: any): data is PDFRepositoryData {
  return (
    data &&
    typeof data === 'object' &&
    data._metadata &&
    data.repository &&
    data.stats &&
    Array.isArray(data.members)
  );
}
