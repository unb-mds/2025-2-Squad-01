import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimelineExtraction, TimelineData } from './TimelineExtraction';

// Mock do fetch global
global.fetch = vi.fn();

describe('TimelineExtraction Class', () => {
  const mockRawData = [
    {
      _metadata: { version: '1.0' }, // Deve ser filtrado
    },
    {
      date: '2024-01-01',
      authors: [
        {
          name: 'User One',
          repositories: ['repo1', '2025-2-Squad-01'],
          commits: 5,
          issues_created: 2,
          issues_closed: 1,
          prs_created: 3,
          prs_closed: 2,
          comments: 10,
        },
        {
          name: 'User Two',
          repositories: ['repo2'],
          commits: 3,
          issues_created: 1,
          issues_closed: 0,
          prs_created: 1,
          prs_closed: 1,
          comments: 5,
        },
      ],
    },
    {
      date: '2024-01-02',
      authors: [
        {
          name: 'User Three',
          repositories: ['2025-2-Squad-01'],
          commits: 8,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 2,
          prs_closed: 0,
          comments: 3,
        },
      ],
    },
    {
      date: '2024-01-03',
      authors: [], // Dia vazio - deve ser mantido
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== EXTRACTTIMELINEDATA - SUCCESS CASES ==========
  describe('extractTimelineData - Success Cases', () => {
    test('busca dados para last_7_days', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/extraction-overhall/data/gold/timeline_last_7_days.json'
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('busca dados para last_12_months', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_12_months');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/extraction-overhall/data/gold/timeline_last_12_months.json'
      );
      expect(result).toBeDefined();
    });

    test('busca dados com repo_filter', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days', '2025-2-Squad-01');

      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    test('processa dados corretamente após fetch', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days');

      // Verifica que metadata foi removido
      expect(result.length).toBe(3); // 3 dias sem metadata
    });

    test('retorna array de TimelineData com estrutura correta', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days');

      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('users');
      expect(Array.isArray(result[0].users)).toBe(true);
    });
  });

  // ========== EXTRACTTIMELINEDATA - URL SELECTION ==========
  describe('extractTimelineData - URL Selection', () => {
    test('seleciona URL correta para last_7_days', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await TimelineExtraction.extractTimelineData('last_7_days');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeline_last_7_days.json')
      );
    });

    test('seleciona URL correta para last_12_months', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await TimelineExtraction.extractTimelineData('last_12_months');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeline_last_12_months.json')
      );
    });

    test('URL inclui branch extraction-overhall', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await TimelineExtraction.extractTimelineData('last_7_days');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('extraction-overhall')
      );
    });

    test('URL inclui caminho data/gold', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await TimelineExtraction.extractTimelineData('last_7_days');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('data/gold')
      );
    });
  });

  // ========== EXTRACTTIMELINEDATA - ERROR HANDLING ==========
  describe('extractTimelineData - Error Handling', () => {
    test('lança erro para time_filter inválido', async () => {
      await expect(
        TimelineExtraction.extractTimelineData('invalid_filter')
      ).rejects.toThrow('Invalid time filter: invalid_filter');
    });

    test('mensagem de erro inclui filtros válidos', async () => {
      await expect(
        TimelineExtraction.extractTimelineData('wrong')
      ).rejects.toThrow("Use 'last_7_days' or 'last_12_months'");
    });

    test('lança erro quando fetch falha', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        TimelineExtraction.extractTimelineData('last_7_days')
      ).rejects.toThrow('Failed to fetch data: 404 Not Found');
    });

    test('lança erro com status 500', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        TimelineExtraction.extractTimelineData('last_7_days')
      ).rejects.toThrow('Failed to fetch data: 500');
    });

    test('lança erro quando response.json() falha', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('JSON parse error');
        },
      });

      await expect(
        TimelineExtraction.extractTimelineData('last_7_days')
      ).rejects.toThrow('JSON parse error');
    });

    test('lança erro quando fetch é rejeitado', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(
        TimelineExtraction.extractTimelineData('last_7_days')
      ).rejects.toThrow('Network error');
    });
  });

  // ========== PROCESSTIMELINEDATA - DATA MAPPING ==========
  describe('processTimelineData - Data Mapping', () => {
    test('mapeia corretamente date', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
    });

    test('mapeia corretamente users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users.length).toBe(2);
      expect(result[1].users.length).toBe(1);
    });

    test('mapeia corretamente name dos users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].name).toBe('User One');
      expect(result[0].users[1].name).toBe('User Two');
    });

    test('mapeia corretamente repositories', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].repositories).toEqual(['repo1', '2025-2-Squad-01']);
      expect(result[0].users[1].repositories).toEqual(['repo2']);
    });

    test('mapeia corretamente activities.commits', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].activities.commits).toBe(5);
      expect(result[0].users[1].activities.commits).toBe(3);
    });

    test('mapeia corretamente activities.issues_created', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].activities.issues_created).toBe(2);
      expect(result[0].users[1].activities.issues_created).toBe(1);
    });

    test('mapeia corretamente activities.issues_closed', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].activities.issues_closed).toBe(1);
      expect(result[0].users[1].activities.issues_closed).toBe(0);
    });

    test('mapeia corretamente activities.prs_created', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].activities.prs_created).toBe(3);
      expect(result[0].users[1].activities.prs_created).toBe(1);
    });

    test('mapeia corretamente activities.prs_closed', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].activities.prs_closed).toBe(2);
      expect(result[0].users[1].activities.prs_closed).toBe(1);
    });

    test('mapeia corretamente activities.comments', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users[0].activities.comments).toBe(10);
      expect(result[0].users[1].activities.comments).toBe(5);
    });
  });

  // ========== PROCESSTIMELINEDATA - METADATA FILTERING ==========
  describe('processTimelineData - Metadata Filtering', () => {
    test('remove entrada com _metadata', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result.length).toBe(3); // 4 items - 1 metadata
    });

    test('não inclui item com _metadata no resultado', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      const hasMetadata = result.some((item: any) => item._metadata !== undefined);
      expect(hasMetadata).toBe(false);
    });

    test('filtra metadata mesmo quando está no meio do array', () => {
      const dataWithMetadataInMiddle = [
        { date: '2024-01-01', authors: [] },
        { _metadata: { version: '1.0' } },
        { date: '2024-01-02', authors: [] },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithMetadataInMiddle);

      expect(result.length).toBe(2);
    });

    test('filtra múltiplas entradas de metadata', () => {
      const dataWithMultipleMetadata = [
        { _metadata: { version: '1.0' } },
        { date: '2024-01-01', authors: [] },
        { _metadata: { other: 'data' } },
        { date: '2024-01-02', authors: [] },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithMultipleMetadata);

      expect(result.length).toBe(2);
    });

    test('mantém dados válidos após filtrar metadata', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
    });
  });

  // ========== PROCESSTIMELINEDATA - REPOSITORY FILTER ==========
  describe('processTimelineData - Repository Filter', () => {
    test('filtra users por repositório específico', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, '2025-2-Squad-01');

      // Apenas User One e User Three têm 2025-2-Squad-01
      expect(result[0].users.length).toBe(1); // User One
      expect(result[0].users[0].name).toBe('User One');
    });

    test('filtro é case-insensitive', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, 'SQUAD-01');

      expect(result[0].users.length).toBe(1);
      expect(result[0].users[0].name).toBe('User One');
    });

    test('filtro "all" retorna todos os users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, 'all');

      expect(result[0].users.length).toBe(2);
    });

    test('sem filtro retorna todos os users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users.length).toBe(2);
    });

    test('filtro undefined retorna todos os users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, undefined);

      expect(result[0].users.length).toBe(2);
    });

    test('filtro por substring funciona', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, 'Squad');

      expect(result[0].users.length).toBe(1);
      expect(result[0].users[0].name).toBe('User One');
    });

    test('filtro por repo inexistente retorna array vazio de users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, 'nonexistent-repo');

      expect(result[0].users.length).toBe(0);
    });

    test('mantém estrutura de dias mesmo sem users após filtro', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, 'nonexistent-repo');

      expect(result.length).toBe(3); // Mantém os 3 dias
      expect(result[0].date).toBe('2024-01-01');
    });

    test('filtro procura em todos os repositórios do user', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData, 'repo1');

      expect(result[0].users.length).toBe(1);
      expect(result[0].users[0].name).toBe('User One');
    });
  });

  // ========== PROCESSTIMELINEDATA - DEFAULT VALUES ==========
  describe('processTimelineData - Default Values', () => {
    test('usa array vazio para repositories quando ausente', () => {
      const dataWithoutRepos = [
        {
          date: '2024-01-01',
          authors: [
            {
              name: 'User',
              commits: 5,
            },
          ],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutRepos);

      expect(result[0].users[0].repositories).toEqual([]);
    });

    test('usa 0 para commits quando ausente', () => {
      const dataWithoutCommits = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutCommits);

      expect(result[0].users[0].activities.commits).toBe(0);
    });

    test('usa 0 para issues_created quando ausente', () => {
      const dataWithoutIssues = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutIssues);

      expect(result[0].users[0].activities.issues_created).toBe(0);
    });

    test('usa 0 para issues_closed quando ausente', () => {
      const dataWithoutIssues = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutIssues);

      expect(result[0].users[0].activities.issues_closed).toBe(0);
    });

    test('usa 0 para prs_created quando ausente', () => {
      const dataWithoutPRs = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutPRs);

      expect(result[0].users[0].activities.prs_created).toBe(0);
    });

    test('usa 0 para prs_closed quando ausente', () => {
      const dataWithoutPRs = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutPRs);

      expect(result[0].users[0].activities.prs_closed).toBe(0);
    });

    test('usa 0 para comments quando ausente', () => {
      const dataWithoutComments = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutComments);

      expect(result[0].users[0].activities.comments).toBe(0);
    });

    test('todos os defaults aplicados simultaneamente', () => {
      const minimalData = [
        {
          date: '2024-01-01',
          authors: [{ name: 'User' }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(minimalData);

      expect(result[0].users[0]).toEqual({
        name: 'User',
        repositories: [],
        activities: {
          commits: 0,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 0,
          prs_closed: 0,
          comments: 0,
        },
      });
    });
  });

  // ========== PROCESSTIMELINEDATA - EMPTY DAYS ==========
  describe('processTimelineData - Empty Days', () => {
    test('mantém dias sem users', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[2].date).toBe('2024-01-03');
      expect(result[2].users.length).toBe(0);
    });

    test('não remove dias vazios do array', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result.length).toBe(3); // Inclui dia vazio
    });

    test('mantém estrutura correta para dia vazio', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[2]).toHaveProperty('date');
      expect(result[2]).toHaveProperty('users');
      expect(Array.isArray(result[2].users)).toBe(true);
    });

    test('dia vazio não afeta processamento dos outros dias', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      expect(result[0].users.length).toBe(2);
      expect(result[1].users.length).toBe(1);
      expect(result[2].users.length).toBe(0);
    });

    test('múltiplos dias vazios são mantidos', () => {
      const dataWithMultipleEmptyDays = [
        { date: '2024-01-01', authors: [{ name: 'User' }] },
        { date: '2024-01-02', authors: [] },
        { date: '2024-01-03', authors: [] },
        { date: '2024-01-04', authors: [{ name: 'User' }] },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithMultipleEmptyDays);

      expect(result.length).toBe(4);
      expect(result[1].users.length).toBe(0);
      expect(result[2].users.length).toBe(0);
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('processa array vazio', () => {
      const result = TimelineExtraction.processTimelineData([]);

      expect(result).toEqual([]);
    });

    test('processa dados com apenas metadata', () => {
      const onlyMetadata = [{ _metadata: { version: '1.0' } }];

      const result = TimelineExtraction.processTimelineData(onlyMetadata);

      expect(result).toEqual([]);
    });

    test('processa dia com author sem name', () => {
      const dataWithoutName = [
        {
          date: '2024-01-01',
          authors: [{ commits: 5 }],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithoutName);

      expect(result[0].users[0].name).toBeUndefined();
    });

    test('processa dados com caracteres especiais no nome', () => {
      const dataWithSpecialChars = [
        {
          date: '2024-01-01',
          authors: [
            {
              name: 'User@#$%',
              repositories: ['repo-with-dash_underscore'],
              commits: 1,
            },
          ],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithSpecialChars);

      expect(result[0].users[0].name).toBe('User@#$%');
    });

    test('processa dados com valores negativos', () => {
      const dataWithNegatives = [
        {
          date: '2024-01-01',
          authors: [
            {
              name: 'User',
              commits: -5,
              issues_created: -2,
            },
          ],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithNegatives);

      expect(result[0].users[0].activities.commits).toBe(-5);
      expect(result[0].users[0].activities.issues_created).toBe(-2);
    });

    test('processa dados com valores muito grandes', () => {
      const dataWithLargeNumbers = [
        {
          date: '2024-01-01',
          authors: [
            {
              name: 'User',
              commits: 999999,
              comments: 888888,
            },
          ],
        },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithLargeNumbers);

      expect(result[0].users[0].activities.commits).toBe(999999);
      expect(result[0].users[0].activities.comments).toBe(888888);
    });

    test('processa data em diferentes formatos', () => {
      const dataWithDifferentDateFormat = [
        { date: '2024-01-01T10:00:00Z', authors: [] },
        { date: '2024/01/02', authors: [] },
        { date: '01-03-2024', authors: [] },
      ];

      const result = TimelineExtraction.processTimelineData(dataWithDifferentDateFormat);

      expect(result[0].date).toBe('2024-01-01T10:00:00Z');
      expect(result[1].date).toBe('2024/01/02');
      expect(result[2].date).toBe('01-03-2024');
    });
  });

  // ========== INTEGRATION ==========
  describe('Integration Tests', () => {
    test('extractTimelineData processa dados corretamente end-to-end', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days');

      expect(result.length).toBe(3);
      expect(result[0].users.length).toBe(2);
      expect(result[0].users[0].name).toBe('User One');
    });

    test('extractTimelineData com filtro aplica filtro corretamente', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days', '2025-2-Squad-01');

      expect(result[0].users.length).toBe(1);
      expect(result[0].users[0].name).toBe('User One');
    });

    test('fluxo completo last_7_days sem filtro', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_7_days');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('users');
    });

    test('fluxo completo last_12_months com filtro', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result = await TimelineExtraction.extractTimelineData('last_12_months', 'repo2');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('last_12_months')
      );
      expect(result[0].users[0].name).toBe('User Two');
    });
  });

  // ========== TYPE SAFETY ==========
  describe('Type Safety', () => {
    test('retorna tipo TimelineData[]', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockRawData,
      });

      const result: TimelineData[] = await TimelineExtraction.extractTimelineData('last_7_days');

      expect(Array.isArray(result)).toBe(true);
    });

    test('cada item tem estrutura TimelineData', () => {
      const result = TimelineExtraction.processTimelineData(mockRawData);

      result.forEach((item) => {
        expect(typeof item.date).toBe('string');
        expect(Array.isArray(item.users)).toBe(true);
        
        item.users.forEach((user) => {
          expect(user).toHaveProperty('activities');
          expect(typeof user.activities.commits).toBe('number');
          expect(typeof user.activities.issues_created).toBe('number');
          expect(typeof user.activities.issues_closed).toBe('number');
          expect(typeof user.activities.prs_created).toBe('number');
          expect(typeof user.activities.prs_closed).toBe('number');
          expect(typeof user.activities.comments).toBe('number');
        });
      });
    });
  });

  // ========== PERFORMANCE ==========
  describe('Performance', () => {
    test('processa grande volume de dados eficientemente', () => {
      const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${(i % 31) + 1}`,
        authors: Array.from({ length: 10 }, (_, j) => ({
          name: `User ${j}`,
          repositories: [`repo${j}`],
          commits: Math.floor(Math.random() * 100),
          issues_created: Math.floor(Math.random() * 10),
          issues_closed: Math.floor(Math.random() * 10),
          prs_created: Math.floor(Math.random() * 5),
          prs_closed: Math.floor(Math.random() * 5),
          comments: Math.floor(Math.random() * 50),
        })),
      }));

      const startTime = performance.now();
      const result = TimelineExtraction.processTimelineData(largeMockData);
      const endTime = performance.now();

      expect(result.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
    });

    test('filtro de repositório não degrada performance', () => {
      const largeMockData = Array.from({ length: 500 }, (_, i) => ({
        date: `2024-01-${(i % 31) + 1}`,
        authors: Array.from({ length: 20 }, (_, j) => ({
          name: `User ${j}`,
          repositories: [`repo${j}`, '2025-2-Squad-01'],
          commits: 1,
        })),
      }));

      const startTime = performance.now();
      const result = TimelineExtraction.processTimelineData(largeMockData, '2025-2-Squad-01');
      const endTime = performance.now();

      expect(result.length).toBe(500);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});