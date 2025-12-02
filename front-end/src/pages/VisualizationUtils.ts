export interface LanguageAnalysisFile {
  path: string;
  name: string;
  size: number;
  extension: string;
}

export interface LanguageData {
  language: string;
  file_count: number;
  total_bytes: number;
  percentage: number;
  files?: LanguageAnalysisFile[];
  has_more?: boolean;
}

export interface LanguageAnalysis {
  repository: string;
  owner: string;
  branch: string;
  analyzed_at?: string;
  sample_config?: {
    max_files_per_language: number;
    strategy: string;
  };
  total_files: number;
  total_bytes: number;
  languages: LanguageData[];
}

export class VisualizationUtils {
  /**
   * Fetch available repository names from index
   */
  static async fetchAvailableRepos(): Promise<string[]> {
    try {
      const response = await fetch('/2025-2-Squad-01/data/silver/language_analysis_index.json');
      if (!response.ok) {
        throw new Error('Failed to fetch repository index');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  /**
   * Fetch language analysis data for a specific repository
   * 
   * @param repoName - Name of the repository
   * @returns Language analysis data or null if not found
   */
  static async fetchLanguageData(repoName: string): Promise<LanguageAnalysis | null> {
    try {
      const response = await fetch(`/2025-2-Squad-01/data/silver/language_analysis_${repoName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language data for ${repoName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching language data for ${repoName}:`, error);
      return null;
    }
  }

  /**
   * Fetch tree pack data for a specific repository
   * 
   * @param repoName - Name of the repository
   * @returns Tree pack data or null if not found
   */
  static async fetchTreeData(repoName: string): Promise<any | null> {
    try {
      const response = await fetch(`/2025-2-Squad-01/data/silver/repo_tree_pack_${repoName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load tree data for ${repoName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching tree data for ${repoName}:`, error);
      return null;
    }
  }
}