import { scaleOrdinal } from "d3-scale";
import { schemeSpectral } from "d3-scale-chromatic";
import type { BasicDatum, PieDatum } from '../types';

// Novo tipo para os dados de atividade do GitHub
export interface ActivityData {
  date: string;
  type: string;
  repo: string;
  user: string;
  additions?: number;
  deletions?: number;
  totalLines?: number;
  total_changes?: number;
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
  additions?: number;
  deletions?: number;
  totalLines?: number;
}

// Options for data aggregation
// CHANGED: Removed minAdditions and minDeletions - these filters are not needed
// Only temporal grouping (groupByHour) and time cutoff (cutoffDate) are used
export interface AggregationOptions {
  groupByHour?: boolean;  // true = group by hour, false = group by day
  cutoffDate?: Date | null;  // filter out activities before this date
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
        additions: activity.additions,
        deletions: activity.deletions,
        totalLines: activity.totalLines,
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

  /**
   * CHANGED: Aggregate activities into BasicDatum format with temporal grouping
   * SOURCE: temporal_events.json via fetchAndProcessActivityData
   * 
   * CHANGES MADE:
   * - Removed minAdditions filter option
   * - Removed minDeletions filter option
   * - Added detailed comments explaining each step
   * - Extracts additions/deletions directly from temporal_events.json
   * 
   * @param activities - Processed activities to aggregate
   * @param options - Aggregation options (grouping, filtering)
   * @returns Array of BasicDatum with aggregated metrics
   */
  static aggregateBasicData(
    activities: ProcessedActivity[],
    options: AggregationOptions = {}
  ): BasicDatum[] {
    const { groupByHour = false, cutoffDate = null } = options;
    
    // CHANGED: Map to store aggregated data per time bucket
    const map = new Map<string, { 
      value: number;      // count of commits
      additions: number;  // sum of additions
      deletions: number;  // sum of deletions
    }>();

    for (const activity of activities) {
      const iso = activity.date;
      
      // CHANGED: Determine grouping key based on time granularity
      let key: string;
      if (groupByHour) {
        // Group by hour: truncate minutes/seconds
        const d = new Date(iso);
        const hourKey = new Date(d);
        hourKey.setMinutes(0, 0, 0);
        key = hourKey.toISOString();
      } else {
        // Group by day: use YYYY-MM-DD format
        key = iso.slice(0, 10); // YYYY-MM-DD
      }

      // CHANGED: Apply cutoff filter - skip activities before cutoff date
      if (cutoffDate) {
        const activityDate = new Date(key.length > 10 ? key : key + 'T00:00:00Z');
        if (activityDate < cutoffDate) continue;
      }

      // CHANGED: Extract additions/deletions from activity
      // These come directly from temporal_events.json
      const additions = activity.additions ?? 0;
      const deletions = activity.deletions ?? 0;

      // CHANGED: Removed minAdditions and minDeletions filters
      // All activities are now aggregated without filtering by line changes

      // CHANGED: Aggregate data by time bucket (hour or day)
      const entry = map.get(key) ?? { value: 0, additions: 0, deletions: 0 };
      // CHANGED: Aggregate counts - sum up commits, additions, and deletions per time bucket
      entry.value += 1;  // count of commits
      entry.additions += additions;  // sum of lines added
      entry.deletions += deletions;  // sum of lines deleted
      map.set(key, entry);
    }

    // CHANGED: Sort by date and calculate cumulative total lines
    // This creates a running total of code lines over time
    const sortedKeys = [...map.keys()].sort();
    const results: BasicDatum[] = [];
    let cumulativeTotal = 0;

    for (const k of sortedKeys) {
      const e = map.get(k)!;
      cumulativeTotal += (e.additions - e.deletions);  // net change in lines
      
      // CHANGED: Build BasicDatum with all metrics
      results.push({
        date: k,                                    // ISO date or hour string
        value: e.value,                             // number of commits
        additions: e.additions,                     // lines added
        deletions: e.deletions,                     // lines deleted
        totalLines: Math.max(0, cumulativeTotal),  // cumulative total (never negative)
      });
    }

    return results;
  }

  /**
   * CHANGED: Aggregate activities into PieDatum format for contributor distribution
   * SOURCE: temporal_events.json via fetchAndProcessActivityData
   * 
   * CHANGES MADE:
   * - Added detailed comments explaining contributor aggregation
   * - Uses d3-scale-chromatic for color generation
   * - Groups remaining contributors into "Others" category
   * 
   * @param activities - Processed activities to aggregate
   * @param options - Aggregation options (cutoff date, time selection)
   * @param topN - Number of top contributors to show (default: 8)
   * @returns Array of PieDatum with contributor distribution
   */
  static aggregatePieData(
    activities: ProcessedActivity[],
    options: { cutoffDate?: Date | null; selectedTime?: string } = {},
    topN: number = 8
  ): PieDatum[] {
    const { cutoffDate = null, selectedTime = '' } = options;
    
    // CHANGED: Map to count commits per contributor
    const counts = new Map<string, number>();

    for (const activity of activities) {
      // CHANGED: Apply cutoff filter - different logic for 24h vs other periods
      if (cutoffDate) {
        const activityDate = selectedTime === 'Last 24 hours'
          ? new Date(activity.date)  // Compare full timestamp for 24h
          : new Date(activity.date.slice(0, 10) + 'T00:00:00Z');  // Compare day boundary
        if (activityDate < cutoffDate) continue;
      }

      // CHANGED: Extract contributor name from user object
      const label = activity.user.displayName || activity.user.login || 'Unknown';
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    // CHANGED: Sort contributors by commit count (descending)
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, topN);  // Top N contributors
    const restTotal = sorted.slice(topN).reduce((acc, [, value]) => acc + value, 0);  // Sum of others

    // CHANGED: Create d3 color scale using schemeSpectral
    const colorScale = scaleOrdinal<string, string>()
      .domain([...top.map(([label]) => label), 'Others'])
      .range([...schemeSpectral[3], ...schemeSpectral[11]]);

    // CHANGED: Build PieDatum array with colors
    const result = top.map(([label, value]) => ({
      label,
      value,
      color: colorScale(label),
    }));

    if (restTotal > 0) {
      result.push({
        label: 'Others',
        value: restTotal,
        color: colorScale('Others'),
      });
    }

    return result;
  }
}