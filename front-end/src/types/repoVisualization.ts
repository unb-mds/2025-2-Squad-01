export type LanguageData = {
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
};

export type RepoAnalysis = {
  repository: string;
  owner: string;
  branch: string;
  analyzed_at?: string;
  total_files: number;
  total_bytes: number;
  languages: LanguageData[];
};