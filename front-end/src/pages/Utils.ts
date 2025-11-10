import { scaleOrdinal } from "d3-scale";

// Novo tipo para os dados de atividade do GitHub
export interface ActivityData {
  date: string;
  type: string;
  repo: string;
  user: string;
}

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
  /**
   * Process raw activity data from GitHub into a structured format
   *
   * @param rawActivities - Raw activity data from GitHub API
   * @param filterType - Optional type filter (e.g., 'commit', 'issue', 'pull_request')
   * @returns Processed activity response with grouped repositories
   */
  static processActivityData(
    rawActivities: ActivityData[],
    filterType?: string
  ): ProcessedActivityResponse {
    // Definir tipos relacionados com cada categoria
    const issueTypes = ['issue_created', 'issue_closed', 'event_labeled', 'event_assigned', 'event_milestoned', 'event_demilestoned', 'event_reopened', 'event_renamed', 'event_unassigned'];
    const commitTypes = ['commit'];
    const prTypes = ['pr_created', 'pr_closed'];

    // Filtrar por categoria se especificado
    let filteredActivities = rawActivities;
    
    if (filterType === 'issue') {
      filteredActivities = rawActivities.filter(activity => issueTypes.includes(activity.type));
    } else if (filterType === 'commit') {
      filteredActivities = rawActivities.filter(activity => commitTypes.includes(activity.type));
    } else if (filterType === 'pull_request') {
      filteredActivities = rawActivities.filter(activity => prTypes.includes(activity.type));
    } else if (filterType) {
      // Se um tipo específico foi fornecido, filtrar por ele
      filteredActivities = rawActivities.filter(activity => activity.type === filterType);
    }

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
          displayName: activity.user || 'Unknown',
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

  /**
   * Fetch and process activity data from the remote JSON source
   *
   * @param type - Activity type to filter by (optional)
   * @returns Promise with processed activity data
   * @throws Error if fetch fails
   */
  static async fetchAndProcessActivityData(type?: string): Promise<ProcessedActivityResponse> {
    const response = await fetch(
      'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/silver/temporal_events.json'
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const rawActivities = await response.json();
    const processedData = Utils.processActivityData(rawActivities, type);

    return processedData;
  }
}