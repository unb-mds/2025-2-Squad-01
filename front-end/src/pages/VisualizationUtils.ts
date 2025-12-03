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
  private static readonly DATA_URL = `${import.meta.env.BASE_URL}data/silver/language_analysis_all.json`;
  private static cache: Map<string, LanguageAnalysis> = new Map();
  private static cacheLoaded = false;

  /**
   * Load all language analysis data into cache
   */
  private static async loadAllLanguageData(): Promise<void> {
    if (this.cacheLoaded) return;

    try {
      console.log(`[VisualizationUtils] Fetching from: ${this.DATA_URL}`);
      console.log(`[VisualizationUtils] BASE_URL: ${import.meta.env.BASE_URL}`);
      const response = await fetch(this.DATA_URL);
      console.log(`[VisualizationUtils] Response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Filtra apenas objetos válidos (ignora _metadata)
      const analyses: LanguageAnalysis[] = Array.isArray(data) 
        ? data.filter((item: any) => item.repository && item.languages)
        : [];

      // Popula o cache
      analyses.forEach((analysis) => {
        this.cache.set(analysis.repository, analysis);
      });

      this.cacheLoaded = true;
      console.log(`[VisualizationUtils] Loaded ${this.cache.size} repositories into cache`);
    } catch (error) {
      console.error("Error loading language analysis data:", error);
      throw error;
    }
  }

  /**
   * Fetch available repository names from cache
   */
  static async fetchAvailableRepos(): Promise<string[]> {
    try {
      await this.loadAllLanguageData();
      return Array.from(this.cache.keys());
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  }

  /**
   * Fetch language analysis data for a specific repository from cache
   * 
   * @param repoName - Name of the repository
   * @returns Language analysis data or null if not found
   */
  static async fetchLanguageData(repoName: string): Promise<LanguageAnalysis | null> {
    try {
      await this.loadAllLanguageData();
      const data = this.cache.get(repoName);
      if (!data) {
        console.warn(`Repository "${repoName}" not found in cache`);
        return null;
      }
      return data;
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
      const response = await fetch(`${import.meta.env.BASE_URL}data/silver/repo_tree_pack_${repoName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load tree data for ${repoName}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching tree data for ${repoName}:`, error);
      return null;
    }
  }

  /**
   * Get color for a programming language
   */
  static getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      JavaScript: "#f1e05a",
      TypeScript: "#2b7489",
      Python: "#3572A5",
      Java: "#b07219",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Ruby: "#701516",
      Go: "#00ADD8",
      Rust: "#dea584",
      PHP: "#4F5D95",
      C: "#555555",
      "C++": "#f34b7d",
      "C#": "#178600",
      Shell: "#89e051",
      Swift: "#ffac45",
      Kotlin: "#F18E33",
      Dart: "#00B4AB",
      Vue: "#41b883",
      Svelte: "#ff3e00",
    };

    return colors[language] || "#8e8e8e";
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
}