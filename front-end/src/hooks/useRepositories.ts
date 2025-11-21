import { useState, useEffect } from 'react';

export function useRepositories() {
  const [repositories, setRepositories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRepositories() {
      try {
        setLoading(true);
        
        // Adiciona barra após BASE_URL
        const url = `${import.meta.env.BASE_URL}/data/silver/language_analysis_index.json`;
        console.log('🔍 Tentando carregar:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to load repositories');
        }
        
        const data = await response.json();
        console.log('✅ Dados carregados:', data.length, 'repositórios');
        setRepositories(data);
        setError(null);
      } catch (err) {
        console.error('❌ Erro ao carregar:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRepositories([]);
      } finally {
        setLoading(false);
      }
    }

    loadRepositories();
  }, []);

  return { repositories, loading, error };
}