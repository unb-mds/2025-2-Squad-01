import { describe, test, expect } from 'vitest';
import type {
  HistogramDatum,
  PieDatum,
  CollaborationEdge,
  HeatmapDataPoint,
  BasicDatum,
} from './charts';

describe('Charts Type Definitions', () => {
  // ========== HISTOGRAMDATUM ==========
  describe('HistogramDatum', () => {
    test('cria objeto válido com todos os campos', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: 10,
      };

      expect(datum).toHaveProperty('dateLabel');
      expect(datum).toHaveProperty('count');
      expect(typeof datum.dateLabel).toBe('string');
      expect(typeof datum.count).toBe('number');
    });

    test('dateLabel aceita diferentes formatos de data', () => {
      const formats: HistogramDatum[] = [
        { dateLabel: '2024-01-01', count: 5 },
        { dateLabel: '01/01/2024', count: 5 },
        { dateLabel: 'Jan 1', count: 5 },
        { dateLabel: '2024-01-01T10:00:00Z', count: 5 },
      ];

      formats.forEach((datum) => {
        expect(datum.dateLabel).toBeTruthy();
        expect(typeof datum.dateLabel).toBe('string');
      });
    });

    test('count aceita valores positivos', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: 100,
      };

      expect(datum.count).toBe(100);
      expect(datum.count).toBeGreaterThan(0);
    });

    test('count aceita zero', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: 0,
      };

      expect(datum.count).toBe(0);
    });

    test('count aceita valores negativos', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: -5,
      };

      expect(datum.count).toBe(-5);
    });

    test('count aceita números decimais', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: 10.5,
      };

      expect(datum.count).toBe(10.5);
    });

    test('dateLabel aceita string vazia', () => {
      const datum: HistogramDatum = {
        dateLabel: '',
        count: 5,
      };

      expect(datum.dateLabel).toBe('');
    });

    test('estrutura em array de HistogramDatum', () => {
      const data: HistogramDatum[] = [
        { dateLabel: '2024-01-01', count: 5 },
        { dateLabel: '2024-01-02', count: 10 },
        { dateLabel: '2024-01-03', count: 8 },
      ];

      expect(data.length).toBe(3);
      data.forEach((datum) => {
        expect(datum).toHaveProperty('dateLabel');
        expect(datum).toHaveProperty('count');
      });
    });
  });

  // ========== PIEDATUM ==========
  describe('PieDatum', () => {
    test('cria objeto válido com campos obrigatórios', () => {
      const datum: PieDatum = {
        label: 'User One',
        value: 50,
      };

      expect(datum).toHaveProperty('label');
      expect(datum).toHaveProperty('value');
      expect(typeof datum.label).toBe('string');
      expect(typeof datum.value).toBe('number');
    });

    test('cria objeto válido com color opcional', () => {
      const datum: PieDatum = {
        label: 'User One',
        value: 50,
        color: '#3b82f6',
      };

      expect(datum.color).toBe('#3b82f6');
      expect(typeof datum.color).toBe('string');
    });

    test('color é opcional', () => {
      const datum: PieDatum = {
        label: 'User One',
        value: 50,
      };

      expect(datum.color).toBeUndefined();
    });

    test('label aceita diferentes tipos de texto', () => {
      const labels: PieDatum[] = [
        { label: 'User Name', value: 10 },
        { label: 'user@email.com', value: 10 },
        { label: 'User-123', value: 10 },
        { label: '用户', value: 10 }, // Caracteres unicode
      ];

      labels.forEach((datum) => {
        expect(typeof datum.label).toBe('string');
        expect(datum.label.length).toBeGreaterThan(0);
      });
    });

    test('value aceita diferentes valores numéricos', () => {
      const values: PieDatum[] = [
        { label: 'Test', value: 0 },
        { label: 'Test', value: 1 },
        { label: 'Test', value: 100 },
        { label: 'Test', value: 10.5 },
        { label: 'Test', value: -5 },
      ];

      values.forEach((datum) => {
        expect(typeof datum.value).toBe('number');
      });
    });

    test('color aceita formatos de cor', () => {
      const colors: PieDatum[] = [
        { label: 'Test', value: 10, color: '#3b82f6' },
        { label: 'Test', value: 10, color: '#fff' },
        { label: 'Test', value: 10, color: 'rgb(59, 130, 246)' },
        { label: 'Test', value: 10, color: 'rgba(59, 130, 246, 0.5)' },
        { label: 'Test', value: 10, color: 'blue' },
      ];

      colors.forEach((datum) => {
        expect(datum.color).toBeTruthy();
        expect(typeof datum.color).toBe('string');
      });
    });

    test('estrutura em array de PieDatum', () => {
      const data: PieDatum[] = [
        { label: 'User One', value: 50, color: '#3b82f6' },
        { label: 'User Two', value: 30, color: '#10b981' },
        { label: 'User Three', value: 20 },
      ];

      expect(data.length).toBe(3);
      expect(data[0].color).toBeDefined();
      expect(data[2].color).toBeUndefined();
    });

    test('label aceita string vazia', () => {
      const datum: PieDatum = {
        label: '',
        value: 10,
      };

      expect(datum.label).toBe('');
    });
  });

  // ========== COLLABORATIONEDGE ==========
  describe('CollaborationEdge', () => {
    test('cria objeto válido com todos os campos obrigatórios', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Bob',
        repo: 'project-repo',
        collaboration_type: 'co-commit',
      };

      expect(edge).toHaveProperty('user1');
      expect(edge).toHaveProperty('user2');
      expect(edge).toHaveProperty('repo');
      expect(edge).toHaveProperty('collaboration_type');
      expect(typeof edge.user1).toBe('string');
      expect(typeof edge.user2).toBe('string');
      expect(typeof edge.repo).toBe('string');
      expect(typeof edge.collaboration_type).toBe('string');
    });

    test('cria objeto válido com _metadata opcional', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Bob',
        repo: 'project-repo',
        collaboration_type: 'co-commit',
        _metadata: { weight: 5 },
      };

      expect(edge._metadata).toBeDefined();
      expect(edge._metadata.weight).toBe(5);
    });

    test('_metadata é opcional', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Bob',
        repo: 'project-repo',
        collaboration_type: 'co-commit',
      };

      expect(edge._metadata).toBeUndefined();
    });

    test('collaboration_type aceita diferentes valores', () => {
      const types: CollaborationEdge[] = [
        { user1: 'A', user2: 'B', repo: 'R', collaboration_type: 'co-commit' },
        { user1: 'A', user2: 'B', repo: 'R', collaboration_type: 'review' },
        { user1: 'A', user2: 'B', repo: 'R', collaboration_type: 'co-author' },
        { user1: 'A', user2: 'B', repo: 'R', collaboration_type: 'issue-collaboration' },
      ];

      types.forEach((edge) => {
        expect(typeof edge.collaboration_type).toBe('string');
        expect(edge.collaboration_type.length).toBeGreaterThan(0);
      });
    });

    test('user1 e user2 podem ser iguais', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Alice',
        repo: 'repo',
        collaboration_type: 'self-review',
      };

      expect(edge.user1).toBe(edge.user2);
    });

    test('_metadata pode conter qualquer estrutura', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Bob',
        repo: 'repo',
        collaboration_type: 'co-commit',
        _metadata: {
          timestamp: '2024-01-01',
          weight: 10,
          nested: { data: 'value' },
        },
      };

      expect(edge._metadata.timestamp).toBe('2024-01-01');
      expect(edge._metadata.nested.data).toBe('value');
    });

    test('estrutura em array de CollaborationEdge', () => {
      const edges: CollaborationEdge[] = [
        { user1: 'A', user2: 'B', repo: 'R1', collaboration_type: 'co-commit' },
        { user1: 'B', user2: 'C', repo: 'R2', collaboration_type: 'review' },
        { user1: 'A', user2: 'C', repo: 'R1', collaboration_type: 'co-author' },
      ];

      expect(edges.length).toBe(3);
      edges.forEach((edge) => {
        expect(edge).toHaveProperty('user1');
        expect(edge).toHaveProperty('user2');
        expect(edge).toHaveProperty('repo');
        expect(edge).toHaveProperty('collaboration_type');
      });
    });

    test('campos aceitam strings vazias', () => {
      const edge: CollaborationEdge = {
        user1: '',
        user2: '',
        repo: '',
        collaboration_type: '',
      };

      expect(edge.user1).toBe('');
      expect(edge.user2).toBe('');
      expect(edge.repo).toBe('');
      expect(edge.collaboration_type).toBe('');
    });
  });

  // ========== HEATMAPDATAPOINT ==========
  describe('HeatmapDataPoint', () => {
    test('cria objeto válido com todos os campos obrigatórios', () => {
      const point: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 14,
        activity_count: 25,
      };

      expect(point).toHaveProperty('day_of_week');
      expect(point).toHaveProperty('hour');
      expect(point).toHaveProperty('activity_count');
      expect(typeof point.day_of_week).toBe('number');
      expect(typeof point.hour).toBe('number');
      expect(typeof point.activity_count).toBe('number');
    });

    test('cria objeto válido com _metadata opcional', () => {
      const point: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 14,
        activity_count: 25,
        _metadata: { intensity: 'high' },
      };

      expect(point._metadata).toBeDefined();
      expect(point._metadata.intensity).toBe('high');
    });

    test('_metadata é opcional', () => {
      const point: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 14,
        activity_count: 25,
      };

      expect(point._metadata).toBeUndefined();
    });

    test('day_of_week aceita valores 0-6', () => {
      const days: HeatmapDataPoint[] = [
        { day_of_week: 0, hour: 10, activity_count: 5 },
        { day_of_week: 1, hour: 10, activity_count: 5 },
        { day_of_week: 2, hour: 10, activity_count: 5 },
        { day_of_week: 3, hour: 10, activity_count: 5 },
        { day_of_week: 4, hour: 10, activity_count: 5 },
        { day_of_week: 5, hour: 10, activity_count: 5 },
        { day_of_week: 6, hour: 10, activity_count: 5 },
      ];

      days.forEach((point, index) => {
        expect(point.day_of_week).toBe(index);
        expect(point.day_of_week).toBeGreaterThanOrEqual(0);
        expect(point.day_of_week).toBeLessThanOrEqual(6);
      });
    });

    test('hour aceita valores 0-23', () => {
      const hours: HeatmapDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
        day_of_week: 1,
        hour: i,
        activity_count: 5,
      }));

      hours.forEach((point, index) => {
        expect(point.hour).toBe(index);
        expect(point.hour).toBeGreaterThanOrEqual(0);
        expect(point.hour).toBeLessThanOrEqual(23);
      });
    });

    test('activity_count aceita diferentes valores', () => {
      const counts: HeatmapDataPoint[] = [
        { day_of_week: 1, hour: 10, activity_count: 0 },
        { day_of_week: 1, hour: 10, activity_count: 1 },
        { day_of_week: 1, hour: 10, activity_count: 100 },
        { day_of_week: 1, hour: 10, activity_count: 10.5 },
      ];

      counts.forEach((point) => {
        expect(typeof point.activity_count).toBe('number');
      });
    });

    test('estrutura em array de HeatmapDataPoint', () => {
      const data: HeatmapDataPoint[] = [
        { day_of_week: 0, hour: 9, activity_count: 10 },
        { day_of_week: 1, hour: 14, activity_count: 25 },
        { day_of_week: 2, hour: 16, activity_count: 15 },
      ];

      expect(data.length).toBe(3);
      data.forEach((point) => {
        expect(point).toHaveProperty('day_of_week');
        expect(point).toHaveProperty('hour');
        expect(point).toHaveProperty('activity_count');
      });
    });

    test('valores negativos são aceitos', () => {
      const point: HeatmapDataPoint = {
        day_of_week: -1,
        hour: -5,
        activity_count: -10,
      };

      expect(point.day_of_week).toBe(-1);
      expect(point.hour).toBe(-5);
      expect(point.activity_count).toBe(-10);
    });

    test('valores muito grandes são aceitos', () => {
      const point: HeatmapDataPoint = {
        day_of_week: 100,
        hour: 50,
        activity_count: 999999,
      };

      expect(point.day_of_week).toBe(100);
      expect(point.hour).toBe(50);
      expect(point.activity_count).toBe(999999);
    });
  });

  // ========== BASICDATUM ==========
  describe('BasicDatum', () => {
    test('cria objeto válido com campos obrigatórios', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 10,
      };

      expect(datum).toHaveProperty('date');
      expect(datum).toHaveProperty('value');
      expect(typeof datum.date).toBe('string');
      expect(typeof datum.value).toBe('number');
    });

    test('cria objeto válido com todos os campos opcionais', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
        deletions: 20,
        totalLines: 70,
      };

      expect(datum.additions).toBe(50);
      expect(datum.deletions).toBe(20);
      expect(datum.totalLines).toBe(70);
    });

    test('campos opcionais são realmente opcionais', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 10,
      };

      expect(datum.additions).toBeUndefined();
      expect(datum.deletions).toBeUndefined();
      expect(datum.totalLines).toBeUndefined();
    });

    test('pode incluir apenas alguns campos opcionais', () => {
      const datum1: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
      };

      const datum2: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        deletions: 20,
      };

      const datum3: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        totalLines: 70,
      };

      expect(datum1.additions).toBe(50);
      expect(datum1.deletions).toBeUndefined();
      
      expect(datum2.deletions).toBe(20);
      expect(datum2.additions).toBeUndefined();
      
      expect(datum3.totalLines).toBe(70);
      expect(datum3.additions).toBeUndefined();
    });

    test('date aceita diferentes formatos', () => {
      const dates: BasicDatum[] = [
        { date: '2024-01-01', value: 5 },
        { date: '2024-01-01T10:00:00Z', value: 5 },
        { date: '01/01/2024', value: 5 },
        { date: 'Jan 1, 2024', value: 5 },
      ];

      dates.forEach((datum) => {
        expect(typeof datum.date).toBe('string');
        expect(datum.date.length).toBeGreaterThan(0);
      });
    });

    test('value aceita diferentes valores numéricos', () => {
      const values: BasicDatum[] = [
        { date: '2024-01-01', value: 0 },
        { date: '2024-01-01', value: -5 },
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-01', value: 10.5 },
      ];

      values.forEach((datum) => {
        expect(typeof datum.value).toBe('number');
      });
    });

    test('additions aceita valores positivos e zero', () => {
      const data: BasicDatum[] = [
        { date: '2024-01-01', value: 5, additions: 0 },
        { date: '2024-01-01', value: 5, additions: 100 },
        { date: '2024-01-01', value: 5, additions: 1500 },
      ];

      data.forEach((datum) => {
        expect(datum.additions).toBeGreaterThanOrEqual(0);
      });
    });

    test('deletions aceita valores positivos e zero', () => {
      const data: BasicDatum[] = [
        { date: '2024-01-01', value: 5, deletions: 0 },
        { date: '2024-01-01', value: 5, deletions: 50 },
        { date: '2024-01-01', value: 5, deletions: 1000 },
      ];

      data.forEach((datum) => {
        expect(datum.deletions).toBeGreaterThanOrEqual(0);
      });
    });

    test('totalLines pode ser soma de additions e deletions', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 5,
        additions: 100,
        deletions: 50,
        totalLines: 150,
      };

      expect(datum.totalLines).toBe(datum.additions! + datum.deletions!);
    });

    test('estrutura em array de BasicDatum', () => {
      const data: BasicDatum[] = [
        { date: '2024-01-01', value: 5, additions: 50, deletions: 20, totalLines: 70 },
        { date: '2024-01-02', value: 8, additions: 100, deletions: 30, totalLines: 130 },
        { date: '2024-01-03', value: 3 },
      ];

      expect(data.length).toBe(3);
      expect(data[0].additions).toBeDefined();
      expect(data[2].additions).toBeUndefined();
    });

    test('campos de commit podem ser negativos', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 5,
        additions: -10,
        deletions: -5,
        totalLines: -15,
      };

      expect(datum.additions).toBe(-10);
      expect(datum.deletions).toBe(-5);
      expect(datum.totalLines).toBe(-15);
    });
  });

  // ========== TYPE SAFETY ==========
  describe('Type Safety', () => {
    test('HistogramDatum tem tipos corretos', () => {
      const datum: HistogramDatum = {
        dateLabel: '2024-01-01',
        count: 10,
      };

      expect(typeof datum.dateLabel).toBe('string');
      expect(typeof datum.count).toBe('number');
    });

    test('PieDatum tem tipos corretos', () => {
      const datum: PieDatum = {
        label: 'User',
        value: 50,
        color: '#3b82f6',
      };

      expect(typeof datum.label).toBe('string');
      expect(typeof datum.value).toBe('number');
      expect(typeof datum.color).toBe('string');
    });

    test('CollaborationEdge tem tipos corretos', () => {
      const edge: CollaborationEdge = {
        user1: 'Alice',
        user2: 'Bob',
        repo: 'repo',
        collaboration_type: 'co-commit',
      };

      expect(typeof edge.user1).toBe('string');
      expect(typeof edge.user2).toBe('string');
      expect(typeof edge.repo).toBe('string');
      expect(typeof edge.collaboration_type).toBe('string');
    });

    test('HeatmapDataPoint tem tipos corretos', () => {
      const point: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 14,
        activity_count: 25,
      };

      expect(typeof point.day_of_week).toBe('number');
      expect(typeof point.hour).toBe('number');
      expect(typeof point.activity_count).toBe('number');
    });

    test('BasicDatum tem tipos corretos', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
        deletions: 20,
        totalLines: 70,
      };

      expect(typeof datum.date).toBe('string');
      expect(typeof datum.value).toBe('number');
      expect(typeof datum.additions).toBe('number');
      expect(typeof datum.deletions).toBe('number');
      expect(typeof datum.totalLines).toBe('number');
    });
  });

  // ========== OPTIONAL FIELDS ==========
  describe('Optional Fields', () => {
    test('PieDatum.color é opcional', () => {
      const withColor: PieDatum = { label: 'Test', value: 10, color: '#fff' };
      const withoutColor: PieDatum = { label: 'Test', value: 10 };

      expect(withColor.color).toBeDefined();
      expect(withoutColor.color).toBeUndefined();
    });

    test('CollaborationEdge._metadata é opcional', () => {
      const withMeta: CollaborationEdge = {
        user1: 'A',
        user2: 'B',
        repo: 'R',
        collaboration_type: 'co-commit',
        _metadata: { weight: 5 },
      };
      const withoutMeta: CollaborationEdge = {
        user1: 'A',
        user2: 'B',
        repo: 'R',
        collaboration_type: 'co-commit',
      };

      expect(withMeta._metadata).toBeDefined();
      expect(withoutMeta._metadata).toBeUndefined();
    });

    test('HeatmapDataPoint._metadata é opcional', () => {
      const withMeta: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 10,
        activity_count: 5,
        _metadata: { source: 'commits' },
      };
      const withoutMeta: HeatmapDataPoint = {
        day_of_week: 1,
        hour: 10,
        activity_count: 5,
      };

      expect(withMeta._metadata).toBeDefined();
      expect(withoutMeta._metadata).toBeUndefined();
    });

    test('BasicDatum campos de commit são opcionais', () => {
      const full: BasicDatum = {
        date: '2024-01-01',
        value: 10,
        additions: 50,
        deletions: 20,
        totalLines: 70,
      };
      const minimal: BasicDatum = {
        date: '2024-01-01',
        value: 10,
      };

      expect(full.additions).toBeDefined();
      expect(minimal.additions).toBeUndefined();
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('HistogramDatum com valores extremos', () => {
      const extremes: HistogramDatum[] = [
        { dateLabel: '', count: 0 },
        { dateLabel: 'A'.repeat(1000), count: Number.MAX_SAFE_INTEGER },
        { dateLabel: '🚀', count: Number.MIN_SAFE_INTEGER },
      ];

      extremes.forEach((datum) => {
        expect(typeof datum.dateLabel).toBe('string');
        expect(typeof datum.count).toBe('number');
      });
    });

    test('PieDatum com valores extremos', () => {
      const datum: PieDatum = {
        label: '🎨'.repeat(100),
        value: Number.MAX_SAFE_INTEGER,
        color: '#' + 'F'.repeat(100),
      };

      expect(datum.label.length).toBeGreaterThan(0);
      expect(datum.value).toBeGreaterThan(0);
    });

    test('CollaborationEdge com Unicode', () => {
      const edge: CollaborationEdge = {
        user1: '用户1',
        user2: 'Usuário2',
        repo: 'репозиторий',
        collaboration_type: '협업',
      };

      expect(edge.user1).toBeTruthy();
      expect(edge.user2).toBeTruthy();
      expect(edge.repo).toBeTruthy();
      expect(edge.collaboration_type).toBeTruthy();
    });

    test('HeatmapDataPoint com valores fora do range típico', () => {
      const point: HeatmapDataPoint = {
        day_of_week: -100,
        hour: 500,
        activity_count: 0,
      };

      expect(point.day_of_week).toBe(-100);
      expect(point.hour).toBe(500);
      expect(point.activity_count).toBe(0);
    });

    test('BasicDatum com valores decimais grandes', () => {
      const datum: BasicDatum = {
        date: '2024-01-01',
        value: 999999.999999,
        additions: 123456.789,
        deletions: 987654.321,
        totalLines: 1111111.111,
      };

      expect(datum.value).toBeCloseTo(999999.999999);
      expect(datum.additions).toBeCloseTo(123456.789);
    });
  });

  // ========== PRACTICAL USAGE ==========
  describe('Practical Usage', () => {
    test('HistogramDatum em cenário real de timeline', () => {
      const timeline: HistogramDatum[] = [
        { dateLabel: 'Mon', count: 5 },
        { dateLabel: 'Tue', count: 8 },
        { dateLabel: 'Wed', count: 12 },
        { dateLabel: 'Thu', count: 6 },
        { dateLabel: 'Fri', count: 10 },
      ];

      const totalCount = timeline.reduce((sum, d) => sum + d.count, 0);
      expect(totalCount).toBe(41);
    });

    test('PieDatum em cenário real de contributors', () => {
      const contributors: PieDatum[] = [
        { label: 'Alice', value: 45, color: '#3b82f6' },
        { label: 'Bob', value: 30, color: '#10b981' },
        { label: 'Charlie', value: 25, color: '#f59e0b' },
      ];

      const total = contributors.reduce((sum, c) => sum + c.value, 0);
      expect(total).toBe(100);
    });

    test('CollaborationEdge em cenário real de network', () => {
      const network: CollaborationEdge[] = [
        { user1: 'Alice', user2: 'Bob', repo: 'frontend', collaboration_type: 'co-commit' },
        { user1: 'Bob', user2: 'Charlie', repo: 'backend', collaboration_type: 'review' },
        { user1: 'Alice', user2: 'Charlie', repo: 'frontend', collaboration_type: 'co-author' },
      ];

      const uniqueUsers = new Set(network.flatMap(e => [e.user1, e.user2]));
      expect(uniqueUsers.size).toBe(3);
    });

    test('HeatmapDataPoint em cenário real de activity heatmap', () => {
      const heatmap: HeatmapDataPoint[] = [];
      
      // Preenche semana completa (7 dias, 24 horas)
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmap.push({
            day_of_week: day,
            hour: hour,
            activity_count: Math.floor(Math.random() * 50),
          });
        }
      }

      expect(heatmap.length).toBe(168); // 7 * 24
    });

    test('BasicDatum em cenário real de commit stats', () => {
      const stats: BasicDatum[] = [
        { date: '2024-01-01', value: 5, additions: 150, deletions: 50, totalLines: 200 },
        { date: '2024-01-02', value: 3, additions: 80, deletions: 20, totalLines: 100 },
        { date: '2024-01-03', value: 8, additions: 300, deletions: 100, totalLines: 400 },
      ];

      const totalCommits = stats.reduce((sum, s) => sum + s.value, 0);
      const totalAdditions = stats.reduce((sum, s) => sum + (s.additions || 0), 0);
      
      expect(totalCommits).toBe(16);
      expect(totalAdditions).toBe(530);
    });
  });
});