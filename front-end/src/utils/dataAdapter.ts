interface LanguageAnalysisFile {
  language: string;
  size: number;
  lines: number;
}

interface LanguageAnalysisData {
  repository: string;
  total_files: number;
  files: {
    [path: string]: LanguageAnalysisFile;
  };
}

interface LanguageData {
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
}

interface RepoAnalysis {
  repository: string;
  owner: string;
  branch: string;
  total_files: number;
  total_bytes: number;
  languages: LanguageData[];
}

export function adaptLanguageAnalysisData(data: LanguageAnalysisData): RepoAnalysis {
  // Agrupar arquivos por linguagem
  const languageMap = new Map<string, {
    files: Array<{ path: string; name: string; size: number; extension: string }>;
    total_bytes: number;
    file_count: number;
  }>();

  let totalBytes = 0;

  Object.entries(data.files).forEach(([path, fileData]) => {
    const language = fileData.language || 'Unknown';
    const size = fileData.size || 0;
    
    totalBytes += size;

    if (!languageMap.has(language)) {
      languageMap.set(language, {
        files: [],
        total_bytes: 0,
        file_count: 0
      });
    }

    const langData = languageMap.get(language)!;
    const fileName = path.split('/').pop() || path;
    const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : 'No Extension';

    langData.files.push({
      path,
      name: fileName,
      size,
      extension
    });
    langData.total_bytes += size;
    langData.file_count += 1;
  });

  // Converter para array de LanguageData
  const languages: LanguageData[] = Array.from(languageMap.entries()).map(([language, langData]) => ({
    language,
    file_count: langData.file_count,
    total_bytes: langData.total_bytes,
    percentage: totalBytes > 0 ? (langData.total_bytes / totalBytes) * 100 : 0,
    files: langData.files
  }));

  // Ordenar por tamanho (maior primeiro)
  languages.sort((a, b) => b.total_bytes - a.total_bytes);

  return {
    repository: data.repository,
    owner: 'unb-mds',
    branch: 'main',
    total_files: data.total_files,
    total_bytes: totalBytes,
    languages
  };
}
