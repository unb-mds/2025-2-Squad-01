
import { scaleOrdinal } from "d3-scale";

// Novo tipo para os dados de atividade do GitHub
export interface ActivityData {
  date: string;
  type: string;
  repo: string;
  user: string;
}

// Interface para o resultado processado
export interface ProcessedActivityResponse {
  generatedAt: string;
  repoCount: number;
  totalActivities: number;
  repositories: RepoActivitySummary[];
}

export interface RepoActivitySummary {
  id: number;
  name: string;
  activities: ProcessedActivity[];
}

export interface ProcessedActivity {
  date: string;
  type: string;
  user: {
    login: string;
    displayName: string;
  };
}

export class Utils {

    static processActivityData(rawActivities: ActivityData[], filterType?: string): ProcessedActivityResponse {
      // Filtrar por tipo se especificado
      const filteredActivities = filterType 
        ? rawActivities.filter(activity => activity.type === filterType)
        : rawActivities;

      // Agrupar atividades por repositório
      const activitiesByRepo = new Map<string, ActivityData[]>();

      for (const activity of filteredActivities) {
        // Pular entradas de metadata
        if ('_metadata' in activity) continue;
        const repoName = activity.repo;
        if (!repoName) continue;
        if (!activitiesByRepo.has(repoName)) {
          activitiesByRepo.set(repoName, []);
        }
        activitiesByRepo.get(repoName)!.push(activity);
      }

      // Converter para o formato esperado
      const repositories: RepoActivitySummary[] = [];
      let repoId = 1;
      for (const [repoName, repoActivities] of activitiesByRepo.entries()) {
        const processedActivities: ProcessedActivity[] = repoActivities.map((activity) => ({
          date: activity.date,
          type: activity.type,
          user: {
            login: activity.user,
            displayName: activity.user || 'Desconhecido',
          },
        }));

        repositories.push({
          id: repoId++,
          name: repoName,
          activities: processedActivities,
        });
      }

      const totalActivities = repositories.reduce((sum, repo) => sum + repo.activities.length, 0);
      return {
        generatedAt: new Date().toISOString(),
        repoCount: repositories.length,
        totalActivities,
        repositories,
      };
    }
    static async fetchAndProcessActivityData(type?: string): Promise<ProcessedActivityResponse> {
        const response = await fetch(
          'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/temporal_events.json'
        );
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status} ${response.statusText}`);
        }
        const rawActivities = await response.json();
        const processedData = Utils.processActivityData(rawActivities, type);

        return processedData;
    }
}