import { describe, test, expect } from 'vitest';
import type {
  // GitHub types
  AggregatedCommit,
  RepoCommitSummary,
  GithubSummaryResponse,
  // Chart types
  HistogramDatum,
  PieDatum,
  BasicDatum,
  CollaborationEdge,
  HeatmapDataPoint,
} from './index';

describe('Type Index Barrel Exports', () => {
  // ========== GITHUB TYPES EXPORT ==========
  describe('GitHub Types Export', () => {
    test('exporta AggregatedCommit corretamente', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com/user/repo/commit/abc123',
        message: 'test commit',
        author: {
          login: 'johndoe',
          displayName: 'John Doe',
          profileUrl: 'https://github.com/johndoe',
        },
        committedAt: '2024-01-01T10:00:00Z',
      };

      expect(commit).toHaveProperty('sha');
      expect(commit).toHaveProperty('url');
      expect(commit).toHaveProperty('message');
      expect(commit).toHaveProperty('author');
      expect(commit).toHaveProperty('committedAt');
      expect(typeof commit.sha).toBe('string');
      expect(typeof commit.url).toBe('string');
      expect(typeof commit.message).toBe('string');
      expect(typeof commit.committedAt).toBe('string');
    });

    test('AggregatedCommit mantém author.profileUrl opcional', () => {
      const withProfileUrl: AggregatedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: {
          login: 'user',
          displayName: 'User',
          profileUrl: 'https://github.com/user',
        },
        committedAt: '2024-01-01',
      };

      const withoutProfileUrl: AggregatedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: {
          login: 'user',
          displayName: 'User',
        },
        committedAt: '2024-01-01',
      };

      expect(withProfileUrl.author.profileUrl).toBeDefined();
      expect(withoutProfileUrl.author.profileUrl).toBeUndefined();
    });

    test('exporta RepoCommitSummary corretamente', () => {
      const repo: RepoCommitSummary = {
        id: 12345,
        name: 'my-repo',
        fullName: 'user/my-repo',
        url: 'https://github.com/user/my-repo',
        defaultBranch: 'main',
        commits: [
          {
            sha: 'abc123',
            url: 'https://github.com',
            message: 'test',
            author: { login: 'user', displayName: 'User' },
            committedAt: '2024-01-01',
          },
        ],
      };

      expect(repo).toHaveProperty('id');
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('fullName');
      expect(repo).toHaveProperty('url');
      expect(repo).toHaveProperty('defaultBranch');
      expect(repo).toHaveProperty('commits');
      expect(typeof repo.id).toBe('number');
      expect(typeof repo.name).toBe('string');
      expect(Array.isArray(repo.commits)).toBe(true);
    });

    test('RepoCommitSummary mantém estrutura de commits', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo.commits).toEqual([]);
      expect(Array.isArray(repo.commits)).toBe(true);
    });

    test('exporta GithubSummaryResponse corretamente', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 5,
        totalCommits: 150,
        repositories: [
          {
            id: 1,
            name: 'repo',
            fullName: 'user/repo',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [],
          },
        ],
      };

      expect(response).toHaveProperty('generatedAt');
      expect(response).toHaveProperty('repoCount');
      expect(response).toHaveProperty('totalCommits');
      expect(response).toHaveProperty('repositories');
      expect(typeof response.generatedAt).toBe('string');
      expect(typeof response.repoCount).toBe('number');
      expect(typeof response.totalCommits).toBe('number');
      expect(Array.isArray(response.repositories)).toBe(true);
    });

    test('GithubSummaryResponse mantém estrutura aninhada', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 1,
        totalCommits: 1,
        repositories: [
          {
            id: 1,
            name: 'repo',
            fullName: 'user/repo',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'user', displayName: 'User' },
                committedAt: '2024-01-01',
              },
            ],
          },
        ],
      };

      expect(response.repositories[0].commits.length).toBe(1);
      expect(response.repositories[0].commits[0]).toHaveProperty('author');
    });
  });

  // ========== CHART TYPES EXPORT ==========
  describe('Chart Types Export', () => {
    test('exporta HistogramDatum corretamente', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: 10,
      };

      expect(datum).toHaveProperty('dateLabel');
      expect(datum).toHaveProperty('count');
      expect(typeof datum.dateLabel).toBe('string');
      expect(typeof datum.count).toBe('number');
    });

    test('HistogramDatum aceita diferentes valores', () => {
      const data: HistogramDatum[] = [
        { dateLabel: 'Mon', count: 5 },
        { dateLabel: '2024-01-01', count: 10 },
        { dateLabel: '', count: 0 },
      ];

      data.forEach((datum) => {
        expect(datum).toHaveProperty('dateLabel');
        expect(datum).toHaveProperty('count');
      });
    });

    test('exporta PieDatum corretamente', () => {
      const datum: PieDatum = {
        label: 'User One',
        value: 50,
        color: '#3b82f6',
      };

      expect(datum).toHaveProperty('label');
      expect(datum).toHaveProperty('value');
      expect(datum).toHaveProperty('color');
      expect(typeof datum.label).toBe('string');
      expect(typeof datum.value).toBe('number');
      expect(typeof datum.color).toBe('string');
    });

    test('PieDatum mantém color opcional', () => {
      const withColor: PieDatum = {
        label: 'Test',
        value: 10,
        color: '#3b82f6',
      };

      const withoutColor: PieDatum = {
        label: 'Test',
        value: 10,
      };

      expect(withColor.color).toBeDefined();
      expect(withoutColor.color).toBeUndefined();
    });

    test('exporta BasicDatum corretamente', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
        deletions: 20,
        totalLines: 70,
      };

      expect(datum).toHaveProperty('date');
      expect(datum).toHaveProperty('value');
      expect(datum).toHaveProperty('additions');
      expect(datum).toHaveProperty('deletions');
      expect(datum).toHaveProperty('totalLines');
      expect(typeof datum.date).toBe('string');
      expect(typeof datum.value).toBe('number');
    });

    test('BasicDatum mantém campos opcionais', () => {
      const minimal: BasicDatum = {
        date: '2024-01-01',
        value: 10,
      };

      const full: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
        deletions: 20,
        totalLines: 70,
      };

      expect(minimal.additions).toBeUndefined();
      expect(full.additions).toBe(50);
    });

    test('exporta CollaborationEdge corretamente', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Bob',
        repo: 'project-repo',
        collaboration_type: 'co-commit',
        _metadata: { weight: 5 },
      };

      expect(edge).toHaveProperty('user1');
      expect(edge).toHaveProperty('user2');
      expect(edge).toHaveProperty('repo');
      expect(edge).toHaveProperty('collaboration_type');
      expect(edge).toHaveProperty('_metadata');
      expect(typeof edge.user1).toBe('string');
      expect(typeof edge.user2).toBe('string');
      expect(typeof edge.repo).toBe('string');
      expect(typeof edge.collaboration_type).toBe('string');
    });

    test('CollaborationEdge mantém _metadata opcional', () => {
      const withMetadata: CollaborationEdge = {
        user1: 'A',
        user2: 'B',
        repo: 'R',
        collaboration_type: 'co-commit',
        _metadata: { weight: 5 },
      };

      const withoutMetadata: CollaborationEdge = {
        user1: 'A',
        user2: 'B',
        repo: 'R',
        collaboration_type: 'co-commit',
      };

      expect(withMetadata._metadata).toBeDefined();
      expect(withoutMetadata._metadata).toBeUndefined();
    });

    test('exporta HeatmapDataPoint corretamente', () => {
      const point: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 14,
        activity_count: 25,
        _metadata: { intensity: 'high' },
      };

      expect(point).toHaveProperty('day_of_week');
      expect(point).toHaveProperty('hour');
      expect(point).toHaveProperty('activity_count');
      expect(point).toHaveProperty('_metadata');
      expect(typeof point.day_of_week).toBe('number');
      expect(typeof point.hour).toBe('number');
      expect(typeof point.activity_count).toBe('number');
    });

    test('HeatmapDataPoint mantém _metadata opcional', () => {
      const withMetadata: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 10,
        activity_count: 5,
        _metadata: { source: 'commits' },
      };

      const withoutMetadata: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 10,
        activity_count: 5,
      };

      expect(withMetadata._metadata).toBeDefined();
      expect(withoutMetadata._metadata).toBeUndefined();
    });
  });

  // ========== TYPE INTEGRITY ==========
  describe('Type Integrity', () => {
    test('todos os tipos GitHub mantêm estrutura original', () => {
      const commit: AggregatedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      const repo: RepoCommitSummary = {
        id: 1,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: [commit],
      };

      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 1,
        totalCommits: 1,
        repositories: [repo],
      };

      expect(response.repositories[0].commits[0].sha).toBe('abc');
    });

    test('todos os tipos Chart mantêm estrutura original', () => {
      const histogram: HistogramDatum = { dateLabel: 'Mon', count: 5 };
      const pie: PieDatum = { label: 'User', value: 50, color: '#fff' };
      const basic: BasicDatum = { date: '2024-01-01', value: 10 };
      const edge: CollaborationEdge = {
        user1: 'A',
        user2: 'B',
        repo: 'R',
        collaboration_type: 'co-commit',
      };
      const heatmap: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 10,
        activity_count: 5,
      };

      expect(histogram.count).toBe(5);
      expect(pie.value).toBe(50);
      expect(basic.value).toBe(10);
      expect(edge.user1).toBe('A');
      expect(heatmap.activity_count).toBe(5);
    });

    test('tipos podem ser usados em arrays', () => {
      const commits: AggregatedCommit[] = [
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
      ];

      const histograms: HistogramDatum[] = [{ dateLabel: 'Mon', count: 5 }];
      const pies: PieDatum[] = [{ label: 'User', value: 50 }];
      const basics: BasicDatum[] = [{ date: '2024-01-01', value: 10 }];
      const edges: CollaborationEdge[] = [
        { user1: 'A', user2: 'B', repo: 'R', collaboration_type: 'co-commit' },
      ];
      const heatmaps: HeatmapDataPoint[] = [
        { day_of_week: 1, hour: 10, activity_count: 5 },
      ];

      expect(commits.length).toBe(1);
      expect(histograms.length).toBe(1);
      expect(pies.length).toBe(1);
      expect(basics.length).toBe(1);
      expect(edges.length).toBe(1);
      expect(heatmaps.length).toBe(1);
    });

    test('tipos podem ser combinados', () => {
      const githubData: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 1,
        totalCommits: 1,
        repositories: [
          {
            id: 1,
            name: 'repo',
            fullName: 'user/repo',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'user', displayName: 'User' },
                committedAt: '2024-01-01',
              },
            ],
          },
        ],
      };

      const chartData = {
        histogram: { dateLabel: 'Mon', count: 5 } as HistogramDatum,
        pie: { label: 'User', value: 50 } as PieDatum,
        basic: { date: '2024-01-01', value: 10 } as BasicDatum,
      };

      expect(githubData.repoCount).toBe(1);
      expect(chartData.histogram.count).toBe(5);
    });
  });

  // ========== IMPORT VALIDATION ==========
  describe('Import Validation', () => {
    test('todos os tipos GitHub são importáveis', () => {
      const commit: AggregatedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      const repo: RepoCommitSummary = {
        id: 1,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: [],
      };

      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 0,
        totalCommits: 0,
        repositories: [],
      };

      expect(commit).toBeDefined();
      expect(repo).toBeDefined();
      expect(response).toBeDefined();
    });

    test('todos os tipos Chart são importáveis', () => {
      const histogram: HistogramDatum = { dateLabel: 'Mon', count: 5 };
      const pie: PieDatum = { label: 'User', value: 50 };
      const basic: BasicDatum = { date: '2024-01-01', value: 10 };
      const edge: CollaborationEdge = {
        user1: 'A',
        user2: 'B',
        repo: 'R',
        collaboration_type: 'co-commit',
      };
      const heatmap: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 10,
        activity_count: 5,
      };

      expect(histogram).toBeDefined();
      expect(pie).toBeDefined();
      expect(basic).toBeDefined();
      expect(edge).toBeDefined();
      expect(heatmap).toBeDefined();
    });

    test('imports podem ser desestruturados', () => {
      type GitHubTypes = AggregatedCommit | RepoCommitSummary | GithubSummaryResponse;
      type ChartTypes = HistogramDatum | PieDatum | BasicDatum | CollaborationEdge | HeatmapDataPoint;

      const githubExample: GitHubTypes = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      const chartExample: ChartTypes = { dateLabel: 'Mon', count: 5 };

      expect(githubExample).toBeDefined();
      expect(chartExample).toBeDefined();
    });

    test('tipos mantêm inferência correta', () => {
      const createCommit = (sha: string): AggregatedCommit => ({
        sha,
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      });

      const createHistogram = (count: number): HistogramDatum => ({
        dateLabel: 'Mon',
        count,
      });

      const commit = createCommit('abc123');
      const histogram = createHistogram(10);

      expect(commit.sha).toBe('abc123');
      expect(histogram.count).toBe(10);
    });
  });

  // ========== NO CONFLICTS ==========
  describe('No Type Conflicts', () => {
    test('não há conflito entre tipos GitHub e Chart', () => {
      const commit: AggregatedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      const basic: BasicDatum = {
        date: '2024-01-01',
        value: 10,
      };

      // Ambos têm campos relacionados a datas, mas não conflitam
      expect(commit.committedAt).toBeDefined();
      expect(basic.date).toBeDefined();
    });

    test('tipos podem coexistir no mesmo escopo', () => {
      const allTypes = {
        commit: {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        } as AggregatedCommit,
        repo: {
          id: 1,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        } as RepoCommitSummary,
        response: {
          generatedAt: '2024-01-01',
          repoCount: 0,
          totalCommits: 0,
          repositories: [],
        } as GithubSummaryResponse,
        histogram: { dateLabel: 'Mon', count: 5 } as HistogramDatum,
        pie: { label: 'User', value: 50 } as PieDatum,
        basic: { date: '2024-01-01', value: 10 } as BasicDatum,
        edge: {
          user1: 'A',
          user2: 'B',
          repo: 'R',
          collaboration_type: 'co-commit',
        } as CollaborationEdge,
        heatmap: {
          day_of_week: 1,
          hour: 10,
          activity_count: 5,
        } as HeatmapDataPoint,
      };

      expect(Object.keys(allTypes).length).toBe(8);
    });

    test('tipos podem ser usados em funções genéricas', () => {
      function processData<T>(data: T): T {
        return data;
      }

      const commit = processData<AggregatedCommit>({
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      });

      const histogram = processData<HistogramDatum>({
        dateLabel: 'Mon',
        count: 5,
      });

      expect(commit.sha).toBe('abc');
      expect(histogram.count).toBe(5);
    });

    test('tipos não interferem em type guards', () => {
      type AllTypes = AggregatedCommit | HistogramDatum;

      function isCommit(obj: AllTypes): obj is AggregatedCommit {
        return 'sha' in obj;
      }

      function isHistogram(obj: AllTypes): obj is HistogramDatum {
        return 'dateLabel' in obj;
      }

      const commit: AllTypes = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      const histogram: AllTypes = { dateLabel: 'Mon', count: 5 };

      expect(isCommit(commit)).toBe(true);
      expect(isHistogram(histogram)).toBe(true);
      expect(isCommit(histogram)).toBe(false);
      expect(isHistogram(commit)).toBe(false);
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('todos os tipos podem ter campos undefined quando opcionais', () => {
      const commit: AggregatedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: {
          login: 'user',
          displayName: 'User',
          profileUrl: undefined,
        },
        committedAt: '2024-01-01',
      };

      const pie: PieDatum = {
        label: 'User',
        value: 50,
        color: undefined,
      };

      const basic: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: undefined,
        deletions: undefined,
        totalLines: undefined,
      };

      expect(commit.author.profileUrl).toBeUndefined();
      expect(pie.color).toBeUndefined();
      expect(basic.additions).toBeUndefined();
    });

    test('tipos podem ser parcialmente construídos com Partial', () => {
      const partialCommit: Partial<AggregatedCommit> = {
        sha: 'abc',
      };

      const partialHistogram: Partial<HistogramDatum> = {
        count: 5,
      };

      expect(partialCommit.sha).toBe('abc');
      expect(partialHistogram.count).toBe(5);
    });

    test('tipos podem ser tornados obrigatórios com Required', () => {
      type RequiredBasicDatum = Required<BasicDatum>;

      const datum: RequiredBasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
        deletions: 20,
        totalLines: 70,
      };

      expect(datum.additions).toBeDefined();
      expect(datum.deletions).toBeDefined();
      expect(datum.totalLines).toBeDefined();
    });

    test('tipos podem ser transformados com Pick', () => {
      type CommitBasicInfo = Pick<AggregatedCommit, 'sha' | 'message'>;

      const info: CommitBasicInfo = {
        sha: 'abc123',
        message: 'test commit',
      };

      expect(info.sha).toBe('abc123');
      expect(info.message).toBe('test commit');
    });

    test('tipos podem ser transformados com Omit', () => {
      type SimpleCommit = Omit<AggregatedCommit, 'author' | 'committedAt'>;

      const simple: SimpleCommit = {
        sha: 'abc123',
        url: 'https://github.com',
        message: 'test',
      };

      expect(simple.sha).toBe('abc123');
      expect(simple.message).toBe('test');
    });
  });

  // ========== PRACTICAL USAGE ==========
  describe('Practical Usage Scenarios', () => {
    test('cenário completo de dados do GitHub', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-15T10:00:00Z',
        repoCount: 2,
        totalCommits: 5,
        repositories: [
          {
            id: 1,
            name: 'frontend',
            fullName: 'company/frontend',
            url: 'https://github.com/company/frontend',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc123',
                url: 'https://github.com/company/frontend/commit/abc123',
                message: 'feat: add login',
                author: {
                  login: 'alice',
                  displayName: 'Alice Developer',
                  profileUrl: 'https://github.com/alice',
                },
                committedAt: '2024-01-14T09:00:00Z',
              },
              {
                sha: 'def456',
                url: 'https://github.com/company/frontend/commit/def456',
                message: 'fix: resolve bug',
                author: {
                  login: 'bob',
                  displayName: 'Bob Smith',
                },
                committedAt: '2024-01-14T10:00:00Z',
              },
            ],
          },
          {
            id: 2,
            name: 'backend',
            fullName: 'company/backend',
            url: 'https://github.com/company/backend',
            defaultBranch: 'develop',
            commits: [
              {
                sha: 'ghi789',
                url: 'https://github.com/company/backend/commit/ghi789',
                message: 'refactor: optimize queries',
                author: {
                  login: 'charlie',
                  displayName: 'Charlie Brown',
                },
                committedAt: '2024-01-14T11:00:00Z',
              },
            ],
          },
        ],
      };

      const totalCommitsInRepos = response.repositories.reduce(
        (sum, repo) => sum + repo.commits.length,
        0
      );

      expect(response.repoCount).toBe(2);
      expect(totalCommitsInRepos).toBe(3);
    });

    test('cenário completo de dados de gráficos', () => {
      const chartData = {
        timeline: [
          { dateLabel: 'Mon', count: 5 },
          { dateLabel: 'Tue', count: 8 },
          { dateLabel: 'Wed', count: 12 },
        ] as HistogramDatum[],
        contributors: [
          { label: 'Alice', value: 45, color: '#3b82f6' },
          { label: 'Bob', value: 30, color: '#10b981' },
          { label: 'Charlie', value: 25, color: '#f59e0b' },
        ] as PieDatum[],
        commitStats: [
          { date: '2024-01-01', value: 5, additions: 150, deletions: 50, totalLines: 200 },
          { date: '2024-01-02', value: 3, additions: 80, deletions: 20, totalLines: 100 },
        ] as BasicDatum[],
        collaboration: [
          { user1: 'Alice', user2: 'Bob', repo: 'frontend', collaboration_type: 'co-commit' },
          { user1: 'Bob', user2: 'Charlie', repo: 'backend', collaboration_type: 'review' },
        ] as CollaborationEdge[],
        heatmap: [
          { day_of_week: 0, hour: 9, activity_count: 10 },
          { day_of_week: 1, hour: 14, activity_count: 25 },
          { day_of_week: 2, hour: 16, activity_count: 15 },
        ] as HeatmapDataPoint[],
      };

      const totalTimelineCount = chartData.timeline.reduce((sum, d) => sum + d.count, 0);
      const totalContributorsValue = chartData.contributors.reduce((sum, c) => sum + c.value, 0);

      expect(totalTimelineCount).toBe(25);
      expect(totalContributorsValue).toBe(100);
      expect(chartData.collaboration.length).toBe(2);
      expect(chartData.heatmap.length).toBe(3);
    });

    test('transformação de dados GitHub para Chart', () => {
      const githubData: RepoCommitSummary = {
        id: 1,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: [
          {
            sha: 'abc',
            url: 'https://github.com',
            message: 'commit 1',
            author: { login: 'alice', displayName: 'Alice' },
            committedAt: '2024-01-01',
          },
          {
            sha: 'def',
            url: 'https://github.com',
            message: 'commit 2',
            author: { login: 'alice', displayName: 'Alice' },
            committedAt: '2024-01-01',
          },
          {
            sha: 'ghi',
            url: 'https://github.com',
            message: 'commit 3',
            author: { login: 'bob', displayName: 'Bob' },
            committedAt: '2024-01-01',
          },
        ],
      };

      // Transformar commits em PieDatum
      const authorCounts = githubData.commits.reduce((acc, commit) => {
        const author = commit.author.login;
        acc[author] = (acc[author] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const pieData: PieDatum[] = Object.entries(authorCounts).map(([author, count]) => ({
        label: author,
        value: count,
      }));

      expect(pieData.length).toBe(2);
      expect(pieData.find(p => p.label === 'alice')?.value).toBe(2);
      expect(pieData.find(p => p.label === 'bob')?.value).toBe(1);
    });
  });

  // ========== TYPE COMPOSITION ==========
  describe('Type Composition', () => {
    test('tipos podem ser compostos em interfaces customizadas', () => {
      interface DashboardData {
        github: GithubSummaryResponse;
        charts: {
          timeline: HistogramDatum[];
          contributors: PieDatum[];
          stats: BasicDatum[];
        };
      }

      const dashboard: DashboardData = {
        github: {
          generatedAt: '2024-01-01',
          repoCount: 1,
          totalCommits: 1,
          repositories: [],
        },
        charts: {
          timeline: [{ dateLabel: 'Mon', count: 5 }],
          contributors: [{ label: 'Alice', value: 100 }],
          stats: [{ date: '2024-01-01', value: 10 }],
        },
      };

      expect(dashboard.github.repoCount).toBe(1);
      expect(dashboard.charts.timeline.length).toBe(1);
    });

    test('tipos podem ser usados em type unions', () => {
      type ChartData = HistogramDatum | PieDatum | BasicDatum;

      const data: ChartData[] = [
        { dateLabel: 'Mon', count: 5 },
        { label: 'User', value: 50 },
        { date: '2024-01-01', value: 10 },
      ];

      expect(data.length).toBe(3);
    });

    test('tipos podem ser usados em type intersections', () => {
      type EnhancedCommit = AggregatedCommit & { customField: string };

      const commit: EnhancedCommit = {
        sha: 'abc',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
        customField: 'extra data',
      };

      expect(commit.customField).toBe('extra data');
    });
  });
});