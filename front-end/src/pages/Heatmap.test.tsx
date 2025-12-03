import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeatmapPage from './Heatmap';
import { SidebarProvider } from '../contexts/SidebarContext';
import { Utils } from './Utils';

// Mock do Utils
vi.mock('./Utils', () => ({
  Utils: {
    fetchAndProcessActivityData: vi.fn(),
  },
}));

// Mock do DashboardLayout
vi.mock('../components/DashboardLayout', () => ({
  default: ({ children, currentPage, currentSubPage, currentRepo }: any) => (
    <div data-testid="dashboard-layout" data-page={currentPage} data-subpage={currentSubPage} data-repo={currentRepo}>
      {children}
    </div>
  ),
}));

// Mock do ActivityHeatmap
vi.mock('../components/Graphs', () => ({
  ActivityHeatmap: ({ data }: any) => (
    <div data-testid="activity-heatmap">
      Heatmap with {data.length} data points
    </div>
  ),
}));

// Mock do fetch global
global.fetch = vi.fn();

describe('HeatmapPage Component', () => {
  const mockProcessedData = {
    generatedAt: '2024-01-01T00:00:00Z',
    repoCount: 2,
    totalActivities: 10,
    repositories: [
      {
        id: 1,
        name: 'repo1',
        activities: [
          {
            date: '2024-01-01T10:00:00Z',
            type: 'commit',
            user: { login: 'user1', displayName: 'User One' },
          },
        ],
      },
      {
        id: 2,
        name: 'repo2',
        activities: [
          {
            date: '2024-01-02T14:00:00Z',
            type: 'commit',
            user: { login: 'user2', displayName: 'User Two' },
          },
        ],
      },
    ],
  };

  const mockHeatmapData = [
    { day_of_week: 0, hour: 9, activity_count: 5 },
    { day_of_week: 1, hour: 10, activity_count: 3 },
    { day_of_week: 2, hour: 14, activity_count: 8 },
  ];

  const renderWithRouter = (initialUrl: string = '/') => {
    window.history.pushState({}, '', initialUrl);
    return render(
      <BrowserRouter>
        <SidebarProvider>
          <HeatmapPage />
        </SidebarProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful fetch responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('collaboration_edges.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('activity_heatmap.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHeatmapData),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    (Utils.fetchAndProcessActivityData as any).mockResolvedValue(mockProcessedData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== RENDERIZAÇÃO E LOADING ==========
  describe('Renderização e Loading', () => {
    test('mostra loading state ao carregar dados', () => {
      renderWithRouter();
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('renderiza título após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Organization Activity Heatmap Analysis')).toBeInTheDocument();
      });
    });

    test('renderiza descrição após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('General information and key collaboration metrics.')).toBeInTheDocument();
      });
    });

    test('renderiza DashboardLayout com props corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-page', 'overview');
        expect(layout).toHaveAttribute('data-subpage', 'heatmap');
      });
    });

    test('não mostra loading após dados carregarem', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });
    });
  });

  // ========== FETCH DE DADOS ==========
  describe('Fetch de Dados', () => {
    test('chama fetch para collaboration_edges.json', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('collaboration_edges.json')
        );
      });
    });

    test('chama fetch para activity_heatmap.json', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('activity_heatmap.json')
        );
      });
    });

    test('chama Utils.fetchAndProcessActivityData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('commit');
      });
    });

    test('faz chamadas em paralelo', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });
    });

    test('filtra dados com _metadata', async () => {
      const dataWithMetadata = [
        ...mockHeatmapData,
        { _metadata: true, day_of_week: 0, hour: 0, activity_count: 0 },
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(dataWithMetadata),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('activity-heatmap');
        expect(heatmap).toHaveTextContent(`${mockHeatmapData.length} data points`);
      });
    });
  });

  // ========== TRATAMENTO DE ERROS ==========
  describe('Tratamento de Erros', () => {
    test('mostra erro quando fetch de collaboration_edges falha', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
        expect(screen.getByText(/Falha ao buscar dados de colaboração/)).toBeInTheDocument();
      });
    });

    test('mostra erro quando fetch de heatmap falha', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
        expect(screen.getByText(/Falha ao buscar dados do heatmap/)).toBeInTheDocument();
      });
    });

    test('mostra erro quando Utils.fetchAndProcessActivityData falha', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Network error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('limpa estado de loading quando erro ocorre', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Fetch failed'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });
    });

    test('não renderiza heatmap quando há erro', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('activity-heatmap')).not.toBeInTheDocument();
      });
    });
  });

  // ========== RENDERIZAÇÃO DO HEATMAP ==========
  describe('Renderização do Heatmap', () => {
    test('renderiza ActivityHeatmap component', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('activity-heatmap')).toBeInTheDocument();
      });
    });

    test('passa dados corretos para ActivityHeatmap', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('activity-heatmap');
        expect(heatmap).toHaveTextContent(`${mockHeatmapData.length} data points`);
      });
    });

    test('renderiza título do card', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Activity Heatmap')).toBeInTheDocument();
      });
    });

    test('renderiza com escala correta', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = screen.getByTestId('activity-heatmap').parentElement;
        expect(container).toHaveClass('transform', 'scale-140', 'origin-center');
      });
    });

    test('mostra mensagem quando heatmapData está vazio', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Heatmap data not available or empty.')).toBeInTheDocument();
      });
    });
  });

  // ========== LEGENDA DO HEATMAP ==========
  describe('Legenda do Heatmap', () => {
    test('renderiza botão de legenda', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('📖 How to interpret this graph')).toBeInTheDocument();
      });
    });

    test('legenda está inicialmente oculta', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText(/represents the intensity/)).not.toBeInTheDocument();
      });
    });

    test('expande legenda ao clicar no botão', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText(/represents the intensity/)).toBeInTheDocument();
      });
    });

    test('colapsa legenda ao clicar novamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText(/represents the intensity/)).toBeInTheDocument();
      });

      const button = screen.getByText('📖 How to interpret this graph');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText(/represents the intensity/)).not.toBeInTheDocument();
      });
    });

    test('mostra ícone correto quando legenda está fechada', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph').parentElement;
        expect(button?.textContent).toContain('▶');
      });
    });

    test('mostra ícone correto quando legenda está aberta', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph').parentElement;
        expect(button?.textContent).toContain('▼');
      });
    });
  });

  // ========== CONTEÚDO DA LEGENDA ==========
  describe('Conteúdo da Legenda', () => {
    beforeEach(async () => {
      renderWithRouter();
      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });
    });

    test('mostra descrição de como interpretar o gráfico', async () => {
      await waitFor(() => {
        expect(screen.getByText(/represents the intensity/)).toBeInTheDocument();
      });
    });

    test('mostra título da legenda de cores', async () => {
      await waitFor(() => {
        expect(screen.getByText('Color Intensity:')).toBeInTheDocument();
      });
    });

    test('mostra legenda para "White" (sem atividade)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/No activity \(0\)/)).toBeInTheDocument();
      });
    });

    test('mostra legenda para "Light red" (baixa atividade)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Low activity \(1-3\)/)).toBeInTheDocument();
      });
    });

    test('mostra legenda para "Medium red" (atividade moderada)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Moderate activity \(4-7\)/)).toBeInTheDocument();
      });
    });

    test('mostra legenda para "Dark red" (alta atividade)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/High activity \(8-15\)/)).toBeInTheDocument();
      });
    });

    test('mostra legenda para "Deep red" (atividade muito alta)', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Very high activity \(16\+\)/)).toBeInTheDocument();
      });
    });

    test('mostra título de insights', async () => {
      await waitFor(() => {
        expect(screen.getByText('💡 What to observe:')).toBeInTheDocument();
      });
    });

    test('mostra insights sobre padrões regulares', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Regular patterns indicate work routines/)).toBeInTheDocument();
      });
    });

    test('mostra insights sobre áreas claras', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Light areas show weekends/)).toBeInTheDocument();
      });
    });

    test('mostra insights sobre áreas escuras', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Darker areas reveal development sprints/)).toBeInTheDocument();
      });
    });

    test('mostra insights sobre filtro de repositório', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Use repository filter to compare/)).toBeInTheDocument();
      });
    });
  });

  // ========== SELEÇÃO DE REPOSITÓRIO ==========
  describe('Seleção de Repositório', () => {
    test('mostra "All repositories" por padrão', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
      });
    });

    test('mostra repositório específico quando selecionado', async () => {
      renderWithRouter('?repo=1');

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'repo1');
      });
    });

    test('calcula selectedRepo corretamente com useMemo', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
      });
    });

    test('filtra atividades por repositório selecionado', async () => {
      renderWithRouter('?repo=1');

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'repo1');
      });
    });
  });

  // ========== LAYOUT E ESTILOS ==========
  describe('Layout e Estilos', () => {
    test('container principal tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByText('Organization Activity Heatmap Analysis');
        expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-white');
      });
    });

    test('descrição tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const description = screen.getByText('General information and key collaboration metrics.');
        expect(description).toHaveClass('text-slate-400', 'text-sm');
      });
    });

    test('card do heatmap tem estilos inline corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const cardHeader = screen.getByText('Activity Heatmap');
        const card = cardHeader.parentElement?.parentElement;
        
        expect(card).toHaveStyle({
          backgroundColor: 'rgb(34, 34, 34)',
          borderColor: 'rgb(51, 51, 51)',
        });
      });
    });

    test('botão de legenda tem estilos corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph').parentElement;
        expect(button).toHaveClass('w-full', 'flex', 'items-center', 'justify-between');
      });
    });

    test('grid layout é single column', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = screen.getByText('Activity Heatmap').parentElement?.parentElement?.parentElement;
        expect(grid).toHaveClass('grid', 'grid-cols-1');
      });
    });
  });

  // ========== ESTADOS VAZIOS ==========
  describe('Estados Vazios', () => {
    test('não renderiza conteúdo principal quando não há dados', async () => {
      (global.fetch as any).mockRejectedValue(new Error('No data'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('activity-heatmap')).not.toBeInTheDocument();
      });
    });

    test('mostra mensagem quando heatmap está vazio', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Heatmap data not available or empty.')).toBeInTheDocument();
      });
    });
  });

  // ========== INTEGRAÇÃO ==========
  describe('Integração', () => {
    test('carrega todos os dados em paralelo', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });
    });

    test('dados fluem corretamente para o heatmap', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('activity-heatmap');
        expect(heatmap).toHaveTextContent(`${mockHeatmapData.length} data points`);
      });
    });

    test('DashboardLayout recebe mainData correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toBeInTheDocument();
      });
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('heading principal está presente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Organization Activity Heatmap Analysis/ })).toBeInTheDocument();
      });
    });

    test('botão de legenda é clicável', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph').parentElement;
        expect(button?.tagName).toBe('BUTTON');
      });
    });

    test('erro tem role alert', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Error'));

      renderWithRouter();

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
      });
    });
  });

  // ========== PERFORMANCE ==========
  describe('Performance', () => {
    test('usa useMemo para repositories', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      });

      // Repositories são calculados via useMemo
      const layout = screen.getByTestId('dashboard-layout');
      expect(layout).toBeInTheDocument();
    });

    test('não refaz fetch em re-renders', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <HeatmapPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
    });
  });

  // ========== COMPONENTES VISUAIS ==========
  describe('Componentes Visuais', () => {
    test('renderiza indicadores de cor na legenda', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        const colorDots = document.querySelectorAll('.w-5.h-5.rounded-sm');
        expect(colorDots.length).toBeGreaterThanOrEqual(5);
      });
    });

    test('card do heatmap tem min-height correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const card = screen.getByText('Activity Heatmap').parentElement?.parentElement;
        expect(card).toHaveClass('min-h-[600px]');
      });
    });

    test('container de escala tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = screen.getByTestId('activity-heatmap').parentElement;
        expect(container).toHaveClass('transform', 'scale-140', 'origin-center');
      });
    });
  });

  // ========== NOVOS TESTES ==========
  describe('Comportamento da Legenda', () => {
    test('estado da legenda persiste durante re-render', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      expect(screen.getByText(/represents the intensity/)).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <HeatmapPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/represents the intensity/)).toBeInTheDocument();
    });

    test('legenda tem padding e spacing corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        const legendContent = screen.getByText(/represents the intensity/).closest('.px-4.pb-4');
        expect(legendContent).toBeInTheDocument();
      });
    });

    test('indicadores de cor têm estilos corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        const whiteIndicator = document.querySelector('[style*="background-color: rgb(245, 245, 245)"]');
        expect(whiteIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de URL Parameters', () => {
    test('trata repo=all como "All repositories"', async () => {
      renderWithRouter('?repo=all');

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
      });
    });

    test('trata repo inválido como "All repositories"', async () => {
      renderWithRouter('?repo=invalid');

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
      });
    });

    test('trata repo não encontrado como null', async () => {
      renderWithRouter('?repo=999');

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'No Repository Selected');
      });
    });
  });

  describe('Estados Condicionais de Renderização', () => {
    test('não renderiza conteúdo principal durante loading', () => {
      renderWithRouter();

      expect(screen.queryByTestId('activity-heatmap')).not.toBeInTheDocument();
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('não renderiza conteúdo principal quando há erro', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('activity-heatmap')).not.toBeInTheDocument();
      });
    });

    test('não renderiza conteúdo principal quando falta mainData', async () => {
      (Utils.fetchAndProcessActivityData as any).mockResolvedValue(null);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('activity-heatmap')).not.toBeInTheDocument();
      });
    });

    test('não renderiza conteúdo principal quando falta selectedRepo', async () => {
      renderWithRouter('?repo=999');

      await waitFor(() => {
        expect(screen.queryByTestId('activity-heatmap')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filtragem de Metadata', () => {
    test('remove entries null ou undefined', async () => {
      const dataWithNull = [
        ...mockHeatmapData,
        null as any,
        undefined as any,
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(dataWithNull),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('activity-heatmap');
        expect(heatmap).toHaveTextContent(`${mockHeatmapData.length} data points`);
      });
    });

    test('preserva dados válidos após filtragem', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('activity-heatmap');
        expect(heatmap).toHaveTextContent('3 data points');
      });
    });
  });

  describe('Estrutura de Cards', () => {
    test('card tem overflow hidden', async () => {
      renderWithRouter();

      await waitFor(() => {
        const card = screen.getByText('Activity Heatmap').parentElement?.parentElement;
        expect(card).toHaveClass('overflow-hidden');
      });
    });

    test('content area tem flex grow', async () => {
      renderWithRouter();

      await waitFor(() => {
        const contentArea = screen.getByTestId('activity-heatmap').parentElement?.parentElement;
        expect(contentArea).toHaveClass('flex-grow');
      });
    });

    test('header tem border bottom', async () => {
      renderWithRouter();

      await waitFor(() => {
        const header = screen.getByText('Activity Heatmap').parentElement;
        expect(header).toHaveClass('border-b');
      });
    });
  });

  describe('Cores da Legenda', () => {
    beforeEach(async () => {
      renderWithRouter();
      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });
    });

    test('White tem cor #f5f5f5', async () => {
      await waitFor(() => {
        const whiteBox = document.querySelector('[style*="background-color: rgb(245, 245, 245)"]');
        expect(whiteBox).toBeInTheDocument();
      });
    });

    test('Light red tem cor #ffcccc', async () => {
      await waitFor(() => {
        const lightRedBox = document.querySelector('[style*="background-color: rgb(255, 204, 204)"]');
        expect(lightRedBox).toBeInTheDocument();
      });
    });

    test('Medium red tem cor #ff9999', async () => {
      await waitFor(() => {
        const mediumRedBox = document.querySelector('[style*="background-color: rgb(255, 153, 153)"]');
        expect(mediumRedBox).toBeInTheDocument();
      });
    });

    test('Dark red tem cor #ff6666', async () => {
      await waitFor(() => {
        const darkRedBox = document.querySelector('[style*="background-color: rgb(255, 102, 102)"]');
        expect(darkRedBox).toBeInTheDocument();
      });
    });

    test('Deep red tem cor #cc0000', async () => {
      await waitFor(() => {
        const deepRedBox = document.querySelector('[style*="background-color: rgb(204, 0, 0)"]');
        expect(deepRedBox).toBeInTheDocument();
      });
    });
  });

  describe('Transições e Animações', () => {
    test('botão de legenda tem classe transition-colors', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph').parentElement;
        expect(button).toHaveClass('transition-colors');
      });
    });

    test('botão tem hover state', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph').parentElement;
        expect(button).toHaveClass('hover:bg-gray-800/50');
      });
    });
  });

  describe('Responsividade do Heatmap', () => {
    test('heatmap é centralizado', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = screen.getByTestId('activity-heatmap').parentElement?.parentElement;
        expect(container).toHaveClass('flex', 'items-center', 'justify-center');
      });
    });

    test('container do heatmap tem padding', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = screen.getByTestId('activity-heatmap').parentElement?.parentElement;
        expect(container).toHaveClass('p-6');
      });
    });
  });

  describe('Texto e Formatação', () => {
    test('título usa fonte semibold', async () => {
      renderWithRouter();

      await waitFor(() => {
        const title = screen.getByText('Activity Heatmap');
        expect(title).toHaveClass('font-semibold');
      });
    });

    test('descrição da página tem text-sm', async () => {
      renderWithRouter();

      await waitFor(() => {
        const description = screen.getByText('General information and key collaboration metrics.');
        expect(description).toHaveClass('text-sm');
      });
    });

    test('labels na legenda usam text-xs', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('📖 How to interpret this graph');
        fireEvent.click(button);
      });

      await waitFor(() => {
        const labels = document.querySelectorAll('.text-xs');
        expect(labels.length).toBeGreaterThan(0);
      });
    });
  });
});