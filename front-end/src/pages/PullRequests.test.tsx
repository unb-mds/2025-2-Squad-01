import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PullRequestsPage from './PullRequests';
import { SidebarProvider } from '../contexts/SidebarContext';
import { Utils } from './Utils';

// Mock do Utils
vi.mock('./Utils', () => ({
  Utils: {
    fetchAndProcessActivityData: vi.fn(),
    selectRepoAndFilter: vi.fn(),
    applyFilters: vi.fn(),
    aggregateBasicData: vi.fn(),
    aggregatePieData: vi.fn(),
  },
}));

// Mock dos componentes de gráfico
vi.mock('../components/Graphs', () => ({
  Histogram: ({ data, type }: any) => (
    <div data-testid="histogram">
      Histogram with {data.length} points - Type: {type}
    </div>
  ),
  PieChart: ({ data, type }: any) => (
    <div data-testid="pie-chart">
      PieChart with {data.length} items - Type: {type}
    </div>
  ),
}));

// Mock do DashboardLayout
vi.mock('../components/DashboardLayout', () => ({
  default: ({ children, currentPage, currentSubPage, currentRepo }: any) => (
    <div data-testid="dashboard-layout" data-page={currentPage} data-subpage={currentSubPage} data-repo={currentRepo}>
      {children}
    </div>
  ),
}));

// Mock do BaseFilters
vi.mock('../components/BaseFilters', () => ({
  default: ({ members, selectedMembers, selectedTime, onMemberChange, onTimeChange }: any) => (
    <div data-testid="base-filters">
      <button data-testid="member-filter" onClick={() => onMemberChange(['user1'])}>
        Members: {selectedMembers.length}
      </button>
      <button data-testid="time-filter" onClick={() => onTimeChange('Last 7 days')}>
        Time: {selectedTime}
      </button>
    </div>
  ),
}));

describe('PullRequestsPage Component', () => {
  const mockProcessedData = {
    generatedAt: '2024-01-01T00:00:00Z',
    repoCount: 2,
    totalActivities: 15,
    repositories: [
      {
        id: 1,
        name: 'repo1',
        activities: [
          {
            date: '2024-01-01T10:00:00Z',
            type: 'pull_request',
            user: { login: 'user1', displayName: 'User One' },
          },
          {
            date: '2024-01-02T14:00:00Z',
            type: 'pull_request',
            user: { login: 'user2', displayName: 'User Two' },
          },
        ],
      },
      {
        id: 2,
        name: 'repo2',
        activities: [
          {
            date: '2024-01-03T09:00:00Z',
            type: 'pull_request',
            user: { login: 'user1', displayName: 'User One' },
          },
        ],
      },
    ],
  };

  const mockBasicData = [
    { date: '2024-01-01', value: 5, additions: 0, deletions: 0, totalLines: 0 },
    { date: '2024-01-02', value: 3, additions: 0, deletions: 0, totalLines: 0 },
    { date: '2024-01-03', value: 8, additions: 0, deletions: 0, totalLines: 0 },
  ];

  const mockPieData = [
    { label: 'User One', value: 10, color: '#3b82f6' },
    { label: 'User Two', value: 5, color: '#10b981' },
  ];

  const renderWithRouter = (initialUrl: string = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <SidebarProvider>
          <PullRequestsPage />
        </SidebarProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (Utils.fetchAndProcessActivityData as any).mockResolvedValue(mockProcessedData);
    
    (Utils.selectRepoAndFilter as any).mockReturnValue({
      selectedRepo: {
        id: -1,
        name: 'All repositories',
        activities: mockProcessedData.repositories.flatMap(r => r.activities),
      },
      members: ['User One', 'User Two'],
    });
    
    (Utils.applyFilters as any).mockImplementation((activities) => activities);
    (Utils.aggregateBasicData as any).mockReturnValue(mockBasicData);
    (Utils.aggregatePieData as any).mockReturnValue(mockPieData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza título principal', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Pull Requests analysis')).toBeInTheDocument();
      });
    });

    test('renderiza informações do repositório', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/3 activities/)).toBeInTheDocument();
      });
    });

    test('renderiza DashboardLayout com props corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-page', 'repos');
        expect(layout).toHaveAttribute('data-subpage', 'pullrequests');
      });
    });

    test('renderiza BaseFilters', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });
    });

    test('renderiza grid de gráficos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
        expect(grid).toBeInTheDocument();
      });
    });

    test('renderiza seção Timeline', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Timeline')).toBeInTheDocument();
      });
    });

    test('renderiza seção Contributors', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Contributors')).toBeInTheDocument();
      });
    });
  });

  // ========== FETCH DE DADOS ==========
  describe('Fetch de Dados', () => {
    test('chama Utils.fetchAndProcessActivityData com tipo pull_request', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('pull_request');
      });
    });

    test('chama fetch apenas uma vez na montagem', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });
    });

    test('chama Utils.selectRepoAndFilter com repositórios', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.selectRepoAndFilter).toHaveBeenCalled();
      });
    });

    test('chama Utils.applyFilters com atividades', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.applyFilters).toHaveBeenCalled();
      });
    });

    test('chama Utils.aggregateBasicData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
      });
    });

    test('chama Utils.aggregatePieData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregatePieData).toHaveBeenCalled();
      });
    });
  });

  // ========== ESTADOS DE LOADING ==========
  describe('Estados de Loading', () => {
    test('mostra loading no Timeline', () => {
      renderWithRouter();

      const loadingElements = screen.getAllByText('Loading...');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    test('mostra loading em Contributors', () => {
      renderWithRouter();

      const loadingElements = screen.getAllByText('Loading...');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    test('não mostra loading após dados carregarem', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    test('loading do Timeline tem altura correta', () => {
      renderWithRouter();

      const container = screen.getAllByText('Loading...')[0].parentElement;
      expect(container).toHaveClass('h-[420px]', 'flex', 'items-center', 'justify-center');
    });

    test('loading do Contributors tem altura correta', () => {
      renderWithRouter();

      const containers = screen.getAllByText('Loading...');
      const contributorsContainer = containers[1]?.parentElement;
      if (contributorsContainer) {
        expect(contributorsContainer).toHaveClass('h-[140px]');
      }
    });
  });

  // ========== TRATAMENTO DE ERROS ==========
  describe('Tratamento de Erros', () => {
    test('mostra erro quando fetch falha', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Network error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getAllByText('Network error').length).toBeGreaterThan(0);
      });
    });

    test('erro tem cor vermelha', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Error message')
      );

      renderWithRouter();

      await waitFor(() => {
        const errorElement = screen.getAllByText('Error message')[0];
        expect(errorElement).toHaveClass('text-red-400');
      });
    });

    test('não renderiza gráficos quando há erro', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('histogram')).not.toBeInTheDocument();
      });
    });

    test('limpa loading quando erro ocorre', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    test('erro aparece no Timeline', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Timeline error')
      );

      renderWithRouter();

      await waitFor(() => {
        const errors = screen.getAllByText('Timeline error');
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    test('erro aparece em Contributors', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Contributors error')
      );

      renderWithRouter();

      await waitFor(() => {
        const errors = screen.getAllByText('Contributors error');
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    test('trata erro como string quando não é Error', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue('String error');

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getAllByText('String error').length).toBeGreaterThan(0);
      });
    });
  });

  // ========== RENDERIZAÇÃO DE GRÁFICOS ==========
  describe('Renderização de Gráficos', () => {
    test('renderiza Histogram após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('histogram')).toBeInTheDocument();
      });
    });

    test('Histogram recebe tipo correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const histogram = screen.getByTestId('histogram');
        expect(histogram).toHaveTextContent('Type: Pull request');
      });
    });

    test('Histogram recebe dados corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const histogram = screen.getByTestId('histogram');
        expect(histogram).toHaveTextContent(`${mockBasicData.length} points`);
      });
    });

    test('renderiza PieChart após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });

    test('PieChart recebe tipo correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const pieChart = screen.getByTestId('pie-chart');
        expect(pieChart).toHaveTextContent('Type: Pull request');
      });
    });

    test('PieChart recebe dados corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const pieChart = screen.getByTestId('pie-chart');
        expect(pieChart).toHaveTextContent(`${mockPieData.length} items`);
      });
    });

    test('PieChart está centralizado', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = screen.getByTestId('pie-chart').closest('.flex.items-center.justify-center');
        expect(container).toBeInTheDocument();
      });
    });
  });

  // ========== LISTA DE CONTRIBUIDORES ==========
  describe('Lista de Contribuidores', () => {
    test('renderiza nomes dos contribuidores', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
      });
    });

    test('renderiza valores de contribuição', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    test('renderiza cores dos contribuidores', async () => {
      renderWithRouter();

      await waitFor(() => {
        const colorDots = document.querySelectorAll('.w-3.h-3.rounded-full');
        expect(colorDots.length).toBeGreaterThanOrEqual(2);
      });
    });

    test('lista tem scroll quando necessário', async () => {
      renderWithRouter();

      await waitFor(() => {
        const list = screen.getByText('User One').closest('.max-h-\\[400px\\]');
        expect(list).toBeInTheDocument();
      });
    });

    test('items da lista têm background correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const item = screen.getByText('User One').closest('div');
        expect(item?.parentElement).toHaveStyle({
          backgroundColor: 'rgba(51, 51, 51, 0.3)',
        });
      });
    });

    test('items têm layout flexbox correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const item = screen.getByText('User One').closest('.flex.items-center.justify-between');
        expect(item).toBeInTheDocument();
      });
    });

    test('valores têm tamanho de fonte correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const value = screen.getByText('10');
        expect(value).toHaveClass('text-xs', 'font-bold');
      });
    });

    test('nomes têm tamanho de fonte correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const name = screen.getByText('User One');
        expect(name).toHaveClass('text-sm', 'text-slate-300');
      });
    });
  });

  // ========== FILTROS ==========
  describe('Filtros', () => {
    test('filtro de membros atualiza selectedMembers', async () => {
      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        fireEvent.click(memberFilter);
      });

      await waitFor(() => {
        expect(Utils.applyFilters).toHaveBeenCalled();
      });
    });

    test('filtro de tempo atualiza selectedTime', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timeFilter = screen.getByTestId('time-filter');
        fireEvent.click(timeFilter);
      });

      await waitFor(() => {
        expect(screen.getByText(/Time: Last 7 days/)).toBeInTheDocument();
      });
    });

    test('selectedTime padrão é "Last 24 hours"', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Time: Last 24 hours/)).toBeInTheDocument();
      });
    });

    test('selectedMembers padrão é array vazio', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Members: 0/)).toBeInTheDocument();
      });
    });

    test('BaseFilters recebe lista de membros', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });
    });
  });

  // ========== INTEGRAÇÃO ==========
  describe('Integração', () => {
    test('fluxo completo de dados funciona', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalled();
        expect(Utils.selectRepoAndFilter).toHaveBeenCalled();
        expect(Utils.applyFilters).toHaveBeenCalled();
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
        expect(Utils.aggregatePieData).toHaveBeenCalled();
      });
    });

    test('mudança de tempo recalcula dados', async () => {
      renderWithRouter();

      const initialCalls = (Utils.aggregateBasicData as any).mock.calls.length;

      await waitFor(() => {
        const timeFilter = screen.getByTestId('time-filter');
        fireEvent.click(timeFilter);
      });

      await waitFor(() => {
        expect((Utils.aggregateBasicData as any).mock.calls.length).toBeGreaterThan(initialCalls);
      });
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('heading principal está presente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Pull Requests analysis/ })).toBeInTheDocument();
      });
    });

    test('títulos de seção estão presentes', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Timeline')).toBeInTheDocument();
        expect(screen.getByText('Contributors')).toBeInTheDocument();
      });
    });

    test('heading tem nível correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Pull Requests analysis/ });
        expect(heading.tagName).toBe('H2');
      });
    });
  });

  // ========== ESTADOS VAZIOS ==========
  describe('Estados Vazios', () => {
    test('renderiza quando não há dados', async () => {
      (Utils.aggregateBasicData as any).mockReturnValue([]);
      (Utils.aggregatePieData as any).mockReturnValue([]);

      renderWithRouter();

      await waitFor(() => {
        const histogram = screen.getByTestId('histogram');
        expect(histogram).toHaveTextContent('0 points');
      });
    });

    test('renderiza quando selectedRepo é null', async () => {
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: null,
        members: [],
      });

      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'No repository selected');
      });
    });
  });

  // ========== CONFIGURAÇÕES DE AGREGAÇÃO ==========
  describe('Configurações de Agregação', () => {
    test('usa groupByHour para "Last 24 hours"', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            groupByHour: true,
          })
        );
      });
    });

    test('não usa groupByHour para outros períodos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timeFilter = screen.getByTestId('time-filter');
        fireEvent.click(timeFilter);
      });

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            groupByHour: false,
          })
        );
      });
    });

    test('passa cutoffDate como null para BasicData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            cutoffDate: null,
          })
        );
      });
    });

    test('passa cutoffDate como null para pieData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregatePieData).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            cutoffDate: null,
          })
        );
      });
    });

    test('passa selectedTime para pieData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregatePieData).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            selectedTime: 'Last 24 hours',
          })
        );
      });
    });
  });
});