import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Interface for a member's AI analysis
 */
export interface MemberAnalysis {
  name: string;
  repos: string[];
  commits_analysis: string;
  prs_analysis: string;
  issues_analysis: string;
}

/**
 * Type for analysis categories
 */
export type AnalysisType = 'commits_analysis' | 'prs_analysis' | 'issues_analysis';

/**
 * Labels for analysis types in Portuguese
 */
const ANALYSIS_TYPE_LABELS: Record<AnalysisType, string> = {
  commits_analysis: 'Commits',
  prs_analysis: 'Pull Requests',
  issues_analysis: 'Issues',
};

/** Simple repository info for ID to name mapping */
interface RepoInfo {
  id: number;
  name: string;
}

/**
 * Props for the AISummary component
 */
interface AISummaryProps {
  /** URL or path to the JSON file containing AI analysis data */
  jsonUrl?: string;
  /** Title displayed on the dropdown button */
  title?: string;
  /** Callback when a member is selected */
  onSelectMember?: (member: MemberAnalysis) => void;
  /** Fixed analysis type - when set, hides the analysis type filter */
  defaultAnalysisType?: AnalysisType;
  /** Whether to show the name search filter */
  showNameFilter?: boolean;
  /** Whether to show the repository filter */
  showRepoFilter?: boolean;
  /** Sync repository filter with URL search params (repo parameter) */
  syncWithUrlRepo?: boolean;
  /** Repository data for mapping numeric IDs to names when syncWithUrlRepo is enabled */
  repositoryData?: RepoInfo[];
}

/**
 * AISummary - Dropdown component for displaying AI analysis from JSON
 * 
 * Features:
 * - Fetches AI analysis data from a JSON file
 * - Filters by member name, repository, and analysis type
 * - Responsive dropdown with click-outside detection
 * - Dark theme styling matching project conventions
 */
export function AISummary({
  jsonUrl = '/2025-2-Squad-01/ai_analysis.json',
  title = 'Análise de IA',
  onSelectMember,
  defaultAnalysisType,
  showNameFilter = true,
  showRepoFilter = true,
  syncWithUrlRepo = false,
  repositoryData,
}: AISummaryProps) {
  // URL search params for syncing with page filters
  const [searchParams] = useSearchParams();
  
  // State for dropdown visibility
  const [isOpen, setIsOpen] = useState(false);
  
  // State for AI analysis data
  const [membersData, setMembersData] = useState<MemberAnalysis[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchName, setSearchName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType | 'all'>(
    defaultAnalysisType || 'all'
  );
  
  // State for available repos (extracted from data)
  const [availableRepos, setAvailableRepos] = useState<string[]>([]);
  
  // State for selected member
  const [selectedMember, setSelectedMember] = useState<MemberAnalysis | null>(null);
  
  // Ref for click-outside detection
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data from JSON file
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (jsonUrl) {
          const response = await fetch(jsonUrl);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('FILE_NOT_FOUND');
            }
            throw new Error(`Erro ao carregar dados: ${response.status}`);
          }
          const data = await response.json();
          
          // Convert object to array of members
          const members = Object.values(data) as MemberAnalysis[];
          
          if (members.length === 0) {
            throw new Error('NO_MEMBERS');
          }
          
          setMembersData(members);
          setFilteredMembers(members);
          
          // Extract unique repos
          const repos = [...new Set(members.flatMap(m => m.repos))];
          setAvailableRepos(repos);
        } else {
          throw new Error('No URL provided');
        }
      } catch (err) {
        console.error('Error loading AI analysis data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
        setError(errorMessage);
        setMembersData([]);
        setFilteredMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jsonUrl]);

  // Apply filters when filter values or membersData changes
  useEffect(() => {
    let filtered = [...membersData];

    // Filter by name
    if (searchName.trim()) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by repository
    if (selectedRepo !== 'all') {
      filtered = filtered.filter(member =>
        member.repos.some(repo => 
          repo === selectedRepo ||
          repo.toLowerCase() === selectedRepo.toLowerCase() ||
          repo.toLowerCase().includes(selectedRepo.toLowerCase()) ||
          selectedRepo.toLowerCase().includes(repo.toLowerCase())
        )
      );
    }

    setFilteredMembers(filtered);
  }, [searchName, selectedRepo, membersData]);

  // Sync with URL repo parameter when syncWithUrlRepo is enabled
  useEffect(() => {
    if (syncWithUrlRepo) {
      const urlRepo = searchParams.get('repo');
      if (urlRepo && urlRepo !== 'all') {
        // Try to find matching repo in available repos
        // The URL might have a numeric ID or repo name
        
        let repoNameToFind = urlRepo;
        
        // If it's a numeric ID and we have repositoryData, convert to name
        if (!Number.isNaN(Number(urlRepo)) && repositoryData) {
          const repoById = repositoryData.find(r => r.id === Number(urlRepo));
          if (repoById) {
            repoNameToFind = repoById.name;
          }
        }
        
        // Set the repo name directly - the filter will handle matching
        setSelectedRepo(repoNameToFind);
      } else {
        setSelectedRepo('all');
      }
    }
  }, [syncWithUrlRepo, searchParams, repositoryData]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle member selection
  const handleSelectMember = (member: MemberAnalysis) => {
    setSelectedMember(member);
    onSelectMember?.(member);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchName('');
    setSelectedRepo('all');
    setSelectedAnalysisType('all');
  };

  // Get the analysis content based on selected type
  const getAnalysisContent = (member: MemberAnalysis): { type: string; content: string }[] => {
    if (selectedAnalysisType === 'all') {
      return [
        { type: 'Commits', content: member.commits_analysis },
        { type: 'Pull Requests', content: member.prs_analysis },
        { type: 'Issues', content: member.issues_analysis },
      ];
    }
    return [{
      type: ANALYSIS_TYPE_LABELS[selectedAnalysisType],
      content: member[selectedAnalysisType],
    }];
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md">
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left text-sm font-medium rounded-lg border transition-all duration-200 flex items-center justify-between hover:opacity-90"
        style={{
          backgroundColor: '#333333',
          borderColor: '#444444',
          color: 'white',
        }}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          {title}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-lg border shadow-xl overflow-hidden"
          style={{
            backgroundColor: '#222222',
            borderColor: '#444444',
          }}
        >
          {/* Filters Section */}
          <div className="p-3 border-b" style={{ borderColor: '#444444' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Filtros
              </span>
              {(searchName || selectedRepo !== 'all' || (!defaultAnalysisType && selectedAnalysisType !== 'all')) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="space-y-2">
              {/* Search by Name */}
              {showNameFilter && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Buscar por Nome</label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Digite o nome..."
                    className="w-full px-2 py-1.5 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: '#333333',
                      borderColor: '#444444',
                      color: 'white',
                    }}
                  />
                </div>
              )}

              {/* Filter by Repository */}
              {showRepoFilter && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Repositório</label>
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: '#333333',
                      borderColor: '#444444',
                      color: 'white',
                    }}
                  >
                    <option value="all">Todos os repositórios</option>
                    {availableRepos.map((repo) => (
                      <option key={repo} value={repo}>
                        {repo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filter by Analysis Type - only show if not fixed */}
              {!defaultAnalysisType && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tipo de Análise</label>
                  <select
                    value={selectedAnalysisType}
                    onChange={(e) => setSelectedAnalysisType(e.target.value as AnalysisType | 'all')}
                    className="w-full px-2 py-1.5 text-sm rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: '#333333',
                      borderColor: '#444444',
                      color: 'white',
                    }}
                  >
                    <option value="all">Todas as análises</option>
                    <option value="commits_analysis">Commits</option>
                    <option value="prs_analysis">Pull Requests</option>
                    <option value="issues_analysis">Issues</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-slate-400">
                <svg
                  className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Carregando análises...
              </div>
            )}

            {error && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-900/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {error === 'FILE_NOT_FOUND' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    ) : error === 'NO_MEMBERS' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-red-400 mb-1">
                  {error === 'FILE_NOT_FOUND' 
                    ? 'Arquivo de análises não encontrado'
                    : error === 'NO_MEMBERS'
                    ? 'Nenhum membro encontrado no arquivo'
                    : 'Não foi possível carregar as análises'}
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  {error === 'FILE_NOT_FOUND' 
                    ? 'O arquivo de análises de IA ainda não foi gerado para este projeto.'
                    : error === 'NO_MEMBERS'
                    ? 'O arquivo de análises existe, mas não contém dados de membros.'
                    : 'Ocorreu um erro ao carregar o arquivo de análises.'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 text-xs rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !error && filteredMembers.length === 0 && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-slate-300 mb-1">
                  Nenhum membro encontrado
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedRepo !== 'all' 
                    ? 'Não há análises disponíveis para o repositório selecionado.'
                    : 'Tente ajustar os filtros de busca.'}
                </p>
              </div>
            )}

            {!isLoading && !error && filteredMembers.length > 0 && (
              <ul className="divide-y" style={{ borderColor: '#444444' }}>
                {filteredMembers.map((member) => (
                  <li key={member.name}>
                    <button
                      onClick={() => handleSelectMember(member)}
                      className="w-full px-4 py-3 text-left transition-colors"
                      style={{
                        backgroundColor:
                          selectedMember?.name === member.name ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMember?.name !== member.name) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMember?.name !== member.name) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <h4 className="text-sm font-medium text-white truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {member.repos.join(', ')}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer with count */}
          {!isLoading && !error && filteredMembers.length > 0 && (
            <div
              className="px-4 py-2 text-xs text-slate-400 border-t"
              style={{ borderColor: '#444444' }}
            >
              {filteredMembers.length} membro{filteredMembers.length !== 1 ? 's' : ''} encontrado
              {filteredMembers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Selected Member Analysis Display */}
      {selectedMember && (
        <div
          className="mt-4 p-4 rounded-lg border"
          style={{
            backgroundColor: '#222222',
            borderColor: '#444444',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">
              {selectedMember.name}
            </h3>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Repos badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedMember.repos.map((repo) => (
              <span
                key={repo}
                className="px-2 py-0.5 text-xs rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50"
              >
                {repo}
              </span>
            ))}
          </div>

          {/* Analysis content */}
          <div className="space-y-4">
            {getAnalysisContent(selectedMember).map(({ type, content }) => (
              <div key={type}>
                <h4 className="text-sm font-semibold text-blue-400 mb-1">{type}</h4>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AISummary;
