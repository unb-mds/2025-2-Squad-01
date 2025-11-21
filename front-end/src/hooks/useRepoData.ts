import { useState, useEffect } from 'react';

interface LanguageAnalysis {
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
  languages: Array<{
    language: string;
    file_count: number;
    total_bytes: number;
    percentage: number;
    files?: Array<{
      path: string;
      name: string;
      size: number;
      extension: string;
    }>;
    has_more?: boolean;
  }>;
}

interface TreePackNode {
  name: string;
  children?: TreePackNode[];
  value?: number;
  language?: string;
}

export function useRepoData(repoName: string | null) {
  const [languageData, setLanguageData] = useState<LanguageAnalysis | null>(null);
  const [treeData, setTreeData] = useState<TreePackNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repoName) {
      setLanguageData(null);
      setTreeData(null);
      return;
    }

    async function loadRepoData() {
      try {
        setLoading(true);
        setError(null);

        // Carrega language_analysis
        const langResponse = await fetch(`${import.meta.env.BASE_URL}/data/silver/language_analysis_${repoName}.json`);
        if (!langResponse.ok) {
          throw new Error(`Failed to load language data for ${repoName}`);
        }
        const langData = await langResponse.json();
        setLanguageData(langData);

        // Carrega repo_tree_pack
        const treeResponse = await fetch(`${import.meta.env.BASE_URL}/data/silver/repo_tree_pack_${repoName}.json`);
        if (!treeResponse.ok) {
          throw new Error(`Failed to load tree data for ${repoName}`);
        }
        const treeData = await treeResponse.json();
        setTreeData(treeData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLanguageData(null);
        setTreeData(null);
      } finally {
        setLoading(false);
      }
    }

    loadRepoData();
  }, [repoName]);

  return { languageData, treeData, loading, error };
}