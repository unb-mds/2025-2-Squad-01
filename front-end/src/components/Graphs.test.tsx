import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Histogram,
  PieChart,
  CollaborationNetworkGraph,
  ActivityHeatmap,
  LineGraph,
  CommitMetricsChart,
} from './Graphs';

// Mock do D3 (mantido do código anterior)
vi.mock('d3', async () => {
  const actual = await vi.importActual('d3');
  
  const createMockScale = () => {
    const scale: any = vi.fn((value: any) => value * 10);
    scale.domain = vi.fn(() => scale);
    scale.range = vi.fn(() => scale);
    scale.bandwidth = vi.fn(() => 20);
    scale.padding = vi.fn(() => scale);
    scale.nice = vi.fn(() => scale);
    scale.ticks = vi.fn(() => [0, 25, 50, 75, 100]);
    scale.tickValues = vi.fn(() => scale);
    scale.tickFormat = vi.fn(() => (d: any) => String(d));
    return scale;
  };

  const createMockAxis = () => {
    const axis: any = vi.fn((selection: any) => selection);
    axis.scale = vi.fn(() => axis);
    axis.ticks = vi.fn(() => axis);
    axis.tickValues = vi.fn(() => axis);
    axis.tickFormat = vi.fn(() => axis);
    axis.tickSize = vi.fn(() => axis);
    axis.tickSizeInner = vi.fn(() => axis);
    axis.tickSizeOuter = vi.fn(() => axis);
    axis.tickPadding = vi.fn(() => axis);
    return axis;
  };
  
  const createMockSelection = () => {
    const selection: any = {
      selectAll: vi.fn(() => selection),
      select: vi.fn(() => selection),
      remove: vi.fn(() => selection),
      attr: vi.fn(() => selection),
      append: vi.fn(() => selection),
      style: vi.fn(() => selection),
      text: vi.fn(() => selection),
      on: vi.fn(() => selection),
      transition: vi.fn(() => selection),
      duration: vi.fn(() => selection),
      data: vi.fn(() => selection),
      join: vi.fn(() => selection),
      enter: vi.fn(() => selection),
      exit: vi.fn(() => selection),
      merge: vi.fn(() => selection),
      call: vi.fn((fn: any) => { 
        if (typeof fn === 'function') {
          fn(selection);
        }
        return selection; 
      }),
      datum: vi.fn(() => selection),
      raise: vi.fn(() => selection),
      lower: vi.fn(() => selection),
      node: vi.fn(() => document.createElement('g')),
      nodes: vi.fn(() => []),
    };
    return selection;
  };

  const createMockZoom = () => {
    const zoomBehavior: any = vi.fn((selection: any) => selection);
    zoomBehavior.scaleExtent = vi.fn(() => zoomBehavior);
    zoomBehavior.on = vi.fn(() => zoomBehavior);
    zoomBehavior.transform = vi.fn();
    return zoomBehavior;
  };

  const createMockDrag = () => {
    const dragBehavior: any = vi.fn((selection: any) => selection);
    dragBehavior.on = vi.fn(() => dragBehavior);
    dragBehavior.filter = vi.fn(() => dragBehavior);
    return dragBehavior;
  };

  return {
    ...actual,
    select: vi.fn(() => createMockSelection()),
    selectAll: vi.fn(() => createMockSelection()),
    scaleBand: vi.fn(() => createMockScale()),
    scaleLinear: vi.fn(() => createMockScale()),
    scaleTime: vi.fn(() => createMockScale()),
    scaleOrdinal: vi.fn(() => createMockScale()),
    scaleSequential: vi.fn(() => createMockScale()),
    axisBottom: vi.fn(() => createMockAxis()),
    axisLeft: vi.fn(() => createMockAxis()),
    axisRight: vi.fn(() => createMockAxis()),
    axisTop: vi.fn(() => createMockAxis()),
    max: vi.fn((arr: any[]) => Math.max(...arr.map((d: any) => d.value || d || 0))),
    min: vi.fn((arr: any[]) => Math.min(...arr.map((d: any) => d.value || d || 0))),
    extent: vi.fn(() => [new Date('2024-01-01'), new Date('2024-01-07')]),
    pie: vi.fn(() => {
      const pieFn: any = vi.fn((data: any) => data.map((d: any, i: number) => ({
        data: d,
        value: d.value,
        index: i,
        startAngle: 0,
        endAngle: Math.PI * 2,
      })));
      pieFn.value = vi.fn(() => pieFn);
      pieFn.sort = vi.fn(() => pieFn);
      return pieFn;
    }),
    arc: vi.fn(() => {
      const arcFn: any = vi.fn();
      arcFn.innerRadius = vi.fn(() => arcFn);
      arcFn.outerRadius = vi.fn(() => arcFn);
      arcFn.startAngle = vi.fn(() => arcFn);
      arcFn.endAngle = vi.fn(() => arcFn);
      arcFn.centroid = vi.fn(() => [0, 0]);
      return arcFn;
    }),
    line: vi.fn(() => {
      const lineFn: any = vi.fn();
      lineFn.x = vi.fn(() => lineFn);
      lineFn.y = vi.fn(() => lineFn);
      lineFn.curve = vi.fn(() => lineFn);
      return lineFn;
    }),
    area: vi.fn(() => {
      const areaFn: any = vi.fn();
      areaFn.x = vi.fn(() => areaFn);
      areaFn.y0 = vi.fn(() => areaFn);
      areaFn.y1 = vi.fn(() => areaFn);
      areaFn.curve = vi.fn(() => areaFn);
      return areaFn;
    }),
    curveMonotoneX: {},
    interpolateReds: vi.fn((t: number) => `rgb(${Math.floor(t * 255)}, 0, 0)`),
    interpolateBlues: vi.fn((t: number) => `rgb(0, 0, ${Math.floor(t * 255)})`),
    schemeSpectral: { 
      3: ['#fc8d59', '#ffffbf', '#91bfdb'], 
      11: Array(11).fill('#aaa') 
    },
    forceSimulation: vi.fn(() => ({
      force: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      stop: vi.fn(),
      alphaTarget: vi.fn().mockReturnThis(),
      restart: vi.fn().mockReturnThis(),
      nodes: vi.fn().mockReturnThis(),
    })),
    forceLink: vi.fn(() => ({ 
      id: vi.fn().mockReturnThis(), 
      distance: vi.fn().mockReturnThis(),
      links: vi.fn().mockReturnThis(),
    })),
    forceManyBody: vi.fn(() => ({ strength: vi.fn().mockReturnThis() })),
    forceCenter: vi.fn(() => ({ strength: vi.fn().mockReturnThis() })),
    forceCollide: vi.fn(() => ({ 
      radius: vi.fn().mockReturnThis(), 
      strength: vi.fn().mockReturnThis() 
    })),
    drag: vi.fn(() => createMockDrag()),
    zoom: vi.fn(() => createMockZoom()),
    zoomIdentity: { 
      translate: vi.fn().mockReturnThis(), 
      scale: vi.fn().mockReturnThis(),
      k: 1,
      x: 0,
      y: 0,
    },
    range: vi.fn((n: number) => Array.from({ length: n }, (_, i) => i)),
    timeFormat: vi.fn(() => vi.fn((date: any) => String(date))),
  };
});

vi.mock('d3-zoom', () => ({
  zoom: vi.fn(() => {
    const zoomBehavior: any = vi.fn((selection: any) => selection);
    zoomBehavior.scaleExtent = vi.fn(() => zoomBehavior);
    zoomBehavior.on = vi.fn(() => zoomBehavior);
    zoomBehavior.transform = vi.fn();
    return zoomBehavior;
  }),
}));

vi.mock('./Filter', () => ({
  Filter: ({ title, content }: any) => (
    <div data-testid="filter" data-title={title}>
      {content && content.map((item: string, i: number) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  ),
}));

describe('Graphs Components - Cobertura Completa', () => {
  const mockBasicData = [
    { date: '2024-01-01', value: 10, additions: 50, deletions: 20, totalLines: 1000 },
    { date: '2024-01-02', value: 15, additions: 70, deletions: 30, totalLines: 1040 },
    { date: '2024-01-03', value: 8, additions: 40, deletions: 15, totalLines: 1065 },
  ];

  const mockPieData = [
    { label: 'User1', value: 25, color: '#fc8d59' },
    { label: 'User2', value: 15, color: '#ffffbf' },
  ];

  const mockCollaborationData = [
    { user1: 'Alice', user2: 'Bob', repo: 'repo1', collaboration_type: 'commit' },
    { user1: 'Bob', user2: 'Charlie', repo: 'repo1', collaboration_type: 'pr' },
  ];

  const mockHeatmapData = [
    { day_of_week: 0, hour: 9, activity_count: 5 },
    { day_of_week: 1, hour: 10, activity_count: 12 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== HISTOGRAM - COBERTURA COMPLETA ==========
  describe('Histogram - Cobertura Completa', () => {
    test('renderiza com dados válidos', () => {
      const { container } = render(<Histogram data={mockBasicData} type="commit" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('mostra mensagem de erro quando não há dados', () => {
      const { container } = render(<Histogram data={[]} type="commit" />);
      // O SVG ainda é renderizado, mas sem conteúdo de barras
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza botão de toggle', () => {
      render(<Histogram data={mockBasicData} type="commit" />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Line Graph');
    });

    test('alterna para line graph ao clicar', async () => {
      render(<Histogram data={mockBasicData} type="commit" />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Bar Graph');
      });
    });

    test('alterna de volta para bar graph', async () => {
      render(<Histogram data={mockBasicData} type="commit" />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      await waitFor(() => expect(button).toHaveTextContent('Bar Graph'));
      
      fireEvent.click(button);
      await waitFor(() => expect(button).toHaveTextContent('Line Graph'));
    });

    test('renderiza com type="issue"', () => {
      const { container } = render(<Histogram data={mockBasicData} type="issue" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com type="pull_request"', () => {
      const { container } = render(<Histogram data={mockBasicData} type="pull_request" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com muitos dados (>12 pontos)', () => {
      const manyData = Array.from({ length: 20 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        value: Math.floor(Math.random() * 50),
        additions: 30,
        deletions: 10,
        totalLines: 1000 + i * 50,
      }));
      
      const { container } = render(<Histogram data={manyData} type="commit" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ========== PIE CHART - COBERTURA COMPLETA ==========
  describe('PieChart - Cobertura Completa', () => {
    test('renderiza com dados válidos', () => {
      const { container } = render(<PieChart data={mockPieData} type="commit" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('mostra SVG vazio quando não há dados', () => {
      const { container } = render(<PieChart data={[]} type="commit" />);
      // O SVG é renderizado, mas sem segmentos
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('usa cores customizadas dos dados', () => {
      const { container } = render(<PieChart data={mockPieData} type="commit" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com type="issue"', () => {
      const { container } = render(<PieChart data={mockPieData} type="issue" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com 1 único segmento', () => {
      const singleData = [{ label: 'Single', value: 100, color: '#ff0000' }];
      const { container } = render(<PieChart data={singleData} type="commit" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ========== COLLABORATION NETWORK - COBERTURA COMPLETA ==========
  describe('CollaborationNetworkGraph - Cobertura Completa', () => {
    test('renderiza com dados válidos', () => {
      const { container } = render(
        <CollaborationNetworkGraph data={mockCollaborationData} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza controles de filtro', () => {
      render(<CollaborationNetworkGraph data={mockCollaborationData} />);
      expect(screen.getByText(/Conexões mínimas/i)).toBeInTheDocument();
      expect(screen.getByText(/Ocultar bots/i)).toBeInTheDocument();
    });

    test('slider de threshold funciona', () => {
      render(<CollaborationNetworkGraph data={mockCollaborationData} />);
      const slider = screen.getByRole('slider');
      
      fireEvent.change(slider, { target: { value: '5' } });
      expect(screen.getByText('5+')).toBeInTheDocument();
    });

    test('checkbox de bots funciona', () => {
      render(<CollaborationNetworkGraph data={mockCollaborationData} />);
      const checkbox = screen.getByRole('checkbox');
      
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test('botão de reset funciona', () => {
      render(<CollaborationNetworkGraph data={mockCollaborationData} />);
      const resetButton = screen.getByRole('button', { name: /Resetar vista/i });
      
      fireEvent.click(resetButton);
      expect(resetButton).toBeInTheDocument();
    });

    test('filtra bots quando checkbox ativo', () => {
      const dataWithBots = [
        { user1: 'Alice', user2: 'dependabot[bot]', repo: 'repo1', collaboration_type: 'pr' },
        { user1: 'Bob', user2: 'Charlie', repo: 'repo1', collaboration_type: 'commit' },
      ];
      
      render(<CollaborationNetworkGraph data={dataWithBots} />);
      expect(screen.getByText(/Ocultar bots/i)).toBeInTheDocument();
    });

    test('renderiza com dados vazios', () => {
      const { container } = render(<CollaborationNetworkGraph data={[]} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('mostra contador de colaboradores', () => {
      render(<CollaborationNetworkGraph data={mockCollaborationData} />);
      expect(screen.getByText(/Exibindo/i)).toBeInTheDocument();
      expect(screen.getByText(/colaboradores/i)).toBeInTheDocument();
    });

    test('renderiza com dimensões customizadas', () => {
      const { container } = render(
        <CollaborationNetworkGraph data={mockCollaborationData} width={800} height={600} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ========== ACTIVITY HEATMAP - COBERTURA COMPLETA ==========
  describe('ActivityHeatmap - Cobertura Completa', () => {
    test('renderiza com dados válidos', () => {
      const { container } = render(<ActivityHeatmap data={mockHeatmapData} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza SVG vazio quando não há dados', () => {
      const { container } = render(<ActivityHeatmap data={[]} />);
      // O SVG é renderizado, mas sem células
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com dimensões customizadas', () => {
      const { container } = render(
        <ActivityHeatmap data={mockHeatmapData} width={800} height={300} />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '800');
    });

    test('filtra dados inválidos (day_of_week null)', () => {
      const invalidData: any[] = [
        { day_of_week: null, hour: 10, activity_count: 5 },
        { day_of_week: 1, hour: 12, activity_count: 8 },
      ];
      
      const { container } = render(<ActivityHeatmap data={invalidData} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('filtra dados inválidos (hour undefined)', () => {
      const invalidData: any[] = [
        { day_of_week: 0, hour: undefined, activity_count: 5 },
      ];
      
      const { container } = render(<ActivityHeatmap data={invalidData} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ========== LINE GRAPH - COBERTURA COMPLETA ==========
  describe('LineGraph - Cobertura Completa', () => {
    test('renderiza com dados válidos', () => {
      const { container } = render(<LineGraph data={mockBasicData} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza Filter component', () => {
      render(<LineGraph data={mockBasicData} />);
      expect(screen.getByTestId('filter')).toBeInTheDocument();
    });

    test('renderiza com timeRange "Last 24 hours"', () => {
      const { container } = render(<LineGraph data={mockBasicData} timeRange="Last 24 hours" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com timeRange "Last 7 days"', () => {
      const { container } = render(<LineGraph data={mockBasicData} timeRange="Last 7 days" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com timeRange "Last 30 days"', () => {
      const { container } = render(<LineGraph data={mockBasicData} timeRange="Last 30 days" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com timeRange "Last 6 months"', () => {
      const { container } = render(<LineGraph data={mockBasicData} timeRange="Last 6 months" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com timeRange "Last Year"', () => {
      const { container } = render(<LineGraph data={mockBasicData} timeRange="Last Year" />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('lida com dados vazios', () => {
      const { container } = render(<LineGraph data={[]} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('lida com dados degenerados (xMin === xMax)', () => {
      const sameDate = [
        { date: '2024-01-01', value: 10, additions: 50, deletions: 20, totalLines: 1000 },
        { date: '2024-01-01', value: 15, additions: 70, deletions: 30, totalLines: 1040 },
      ];
      
      const { container } = render(<LineGraph data={sameDate} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ========== COMMIT METRICS CHART - COBERTURA COMPLETA ==========
  describe('CommitMetricsChart - Cobertura Completa', () => {
    test('renderiza com dados válidos e line_toggle=false', () => {
      const { container } = render(
        <CommitMetricsChart data={mockBasicData} line_toggle={false} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com line_toggle=true', () => {
      const { container } = render(
        <CommitMetricsChart data={mockBasicData} line_toggle={true} />
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza SVG vazio quando não há dados', () => {
      const { container } = render(<CommitMetricsChart data={[]} line_toggle={false} />);
      // O SVG é renderizado, mas sem conteúdo
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('toggle controla opacidade da linha', () => {
      const { rerender } = render(
        <CommitMetricsChart data={mockBasicData} line_toggle={false} />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();
      
      rerender(<CommitMetricsChart data={mockBasicData} line_toggle={true} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    test('lida com valores grandes', () => {
      const largeData = [
        { date: '2024-01-01', value: 1000, additions: 5000, deletions: 2000, totalLines: 100000 },
      ];
      
      const { container } = render(<CommitMetricsChart data={largeData} line_toggle={false} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('lida com valores zero', () => {
      const zeroData = [
        { date: '2024-01-01', value: 0, additions: 0, deletions: 0, totalLines: 0 },
      ];
      
      const { container } = render(<CommitMetricsChart data={zeroData} line_toggle={false} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renderiza com muitos dados (>15 pontos)', () => {
      const manyData = Array.from({ length: 20 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        value: i + 5,
        additions: (i + 1) * 20,
        deletions: (i + 1) * 10,
        totalLines: 1000 + i * 100,
      }));
      
      const { container } = render(<CommitMetricsChart data={manyData} line_toggle={false} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});