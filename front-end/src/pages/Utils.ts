/**
 * Utils Module
 *
 * Utility functions and types for processing GitHub activity data.
 * Handles data fetching, processing, and transformation for visualization.
 */

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
   * @param filterType - Optional type filter (e.g., 'commit', 'issue', 'pr')
   * @returns Processed activity response with grouped repositories
   */
  static processActivityData(
    rawActivities: ActivityData[],
    filterType?: string
  ): ProcessedActivityResponse {
    const filteredActivities = filterType
      ? rawActivities.filter((activity) => activity.type === filterType)
      : rawActivities;

    const activitiesByRepo = new Map<string, ActivityData[]>();

    for (const activity of filteredActivities) {
      if ('_metadata' in activity) continue;

      const repoName = activity.repo;
      if (!repoName) continue;

      if (!activitiesByRepo.has(repoName)) {
        activitiesByRepo.set(repoName, []);
      }
      activitiesByRepo.get(repoName)!.push(activity);
    }

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
