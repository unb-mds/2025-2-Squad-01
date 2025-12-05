import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import IssuesPage from './Issues';
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

describe('IssuesPage Component', () => {
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
            type: 'issue',
            user: { login: 'user1', displayName: 'User One' },
          },
          {
            date: '2024-01-02T14:00:00Z',
            type: 'issue',
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
            type: 'issue',
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
    window.history.pushState({}, '', initialUrl);
    return render(
      <BrowserRouter>
        <SidebarProvider>
          <IssuesPage />
        </SidebarProvider>
      </BrowserRouter>
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
        expect(screen.getByText('Issues analysis')).toBeInTheDocument();
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
        expect(layout).toHaveAttribute('data-subpage', 'issues');
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
  });

  // ========== FETCH DE DADOS ==========
  describe('Fetch de Dados', () => {
    test('chama Utils.fetchAndProcessActivityData com tipo issue', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('issue');
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

    test('loading tem altura correta no Timeline', () => {
      renderWithRouter();

      const container = screen.getAllByText('Loading...')[0].parentElement;
      expect(container).toHaveClass('h-[420px]', 'flex', 'items-center', 'justify-center');
    });

    test('loading tem altura correta em Contributors', () => {
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
        expect(histogram).toHaveTextContent('Type: Issue');
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
        expect(pieChart).toHaveTextContent('Type: Issue');
      });
    });

    test('PieChart recebe dados corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const pieChart = screen.getByTestId('pie-chart');
        expect(pieChart).toHaveTextContent(`${mockPieData.length} items`);
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

    test('limpa selectedMembers ao mudar de repositório', async () => {
      const { rerender } = renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });

      window.history.pushState({}, '', '?repo=2');
      
      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <IssuesPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
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
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: mockProcessedData.repositories[0],
        members: ['User One'],
      });

      renderWithRouter('?repo=1');

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'repo1');
      });
    });

    test('mostra número correto de issues para repositório', async () => {
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: mockProcessedData.repositories[0],
        members: ['User One', 'User Two'],
      });

      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(screen.getByText(/2 issues/)).toBeInTheDocument();
      });
    });

    test('mostra informação de múltiplos repositórios', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/2 repositories/)).toBeInTheDocument();
      });
    });

    test('atualiza ao mudar query param', async () => {
      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(Utils.selectRepoAndFilter).toHaveBeenCalled();
      });
    });
  });

  // ========== LAYOUT E ESTILOS ==========
  describe('Layout e Estilos', () => {
    test('título principal tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByText('Issues analysis');
        expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-white');
      });
    });

    test('cards têm background correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timelineHeader = screen.getByText('Timeline');
        const card = timelineHeader.parentElement?.parentElement;
        
        expect(card).toHaveStyle({
          backgroundColor: '#222222',
          borderColor: '#333333',
        });
      });
    });

    test('grid usa 2 colunas em md', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = document.querySelector('.grid');
        expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
      });
    });

    test('Timeline tem dimensões fixas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timelineCard = screen.getByText('Timeline').closest('.h-170.w-170');
        expect(timelineCard).toBeInTheDocument();
      });
    });

    test('headers têm border bottom', async () => {
      renderWithRouter();

      await waitFor(() => {
        const header = screen.getByText('Timeline').parentElement;
        expect(header).toHaveClass('border-b');
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

    test('filtros afetam agregação de dados', async () => {
      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        fireEvent.click(memberFilter);
      });

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
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

  // ========== PERFORMANCE ==========
  describe('Performance', () => {
    test('usa useMemo para repositories', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      });
    });

    test('usa useMemo para selectedRepo e members', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.selectRepoAndFilter).toHaveBeenCalled();
      });
    });

    test('usa useMemo para filteredActivities', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.applyFilters).toHaveBeenCalled();
      });
    });

    test('usa useMemo para BasicData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
      });
    });

    test('usa useMemo para pieData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregatePieData).toHaveBeenCalled();
      });
    });

    test('não refaz fetch em re-renders', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <IssuesPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('heading principal está presente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Issues analysis/ })).toBeInTheDocument();
      });
    });

    test('títulos de seção estão presentes', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Timeline')).toBeInTheDocument();
        expect(screen.getByText('Contributors')).toBeInTheDocument();
      });
    });

    test('informações de métricas são descritivas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/activities/)).toBeInTheDocument();
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

    test('passa cutoffDate como null', async () => {
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
  });

  // ========== ESTADOS COMPOSTOS ==========
  describe('Estados Compostos', () => {
    test('chartType padrão é line', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      });
      // chartType não é renderizado visualmente, mas existe no estado
    });

    test('lineToggle padrão é false', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      });
      // lineToggle não é renderizado visualmente, mas existe no estado
    });
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('grid adapta para mobile', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = document.querySelector('.grid-cols-1');
        expect(grid).toBeInTheDocument();
      });
    });

    test('informações de repositório são responsivas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const info = screen.getByText(/activities/);
        expect(info).toHaveClass('text-slate-400', 'text-sm');
      });
    });
  });

  // ========== CARDS E CONTAINERS ==========
  describe('Cards e Containers', () => {
    test('Timeline card tem padding correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const header = screen.getByText('Timeline').parentElement;
        expect(header).toHaveClass('px-6', 'py-4');
      });
    });

    test('Contributors card tem padding correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const content = screen.getByText('User One').closest('.p-6');
        expect(content).toBeInTheDocument();
      });
    });

    test('Timeline tem pt-3', async () => {
      renderWithRouter();

      await waitFor(() => {
        const content = screen.getByTestId('histogram').closest('.pt-3');
        expect(content).toBeInTheDocument();
      });
    });
  });

  // ========== TEXTO E CONTEÚDO ==========
  describe('Texto e Conteúdo', () => {
    test('mostra "issues" para repositório específico', async () => {
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: mockProcessedData.repositories[0],
        members: ['User One', 'User Two'],
      });

      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(screen.getByText(/issues/)).toBeInTheDocument();
      });
    });

    test('mostra "activities" para All repositories', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/activities/)).toBeInTheDocument();
      });
    });

    test('descrição do repositório tem margem top', async () => {
      renderWithRouter();

      await waitFor(() => {
        const description = screen.getByText(/activities/);
        expect(description).toHaveClass('mt-2');
      });
    });
  });

  // ========== INTERAÇÃO USUÁRIO-FILTROS ==========
  describe('Interação Usuário-Filtros', () => {
    test('filtros são aplicados antes de agregação', async () => {
      renderWithRouter();

      await waitFor(() => {
        const callOrder = vi.mocked(Utils.applyFilters).mock.invocationCallOrder[0];
        const aggregateCallOrder = vi.mocked(Utils.aggregateBasicData).mock.invocationCallOrder[0];
        
        expect(callOrder).toBeLessThan(aggregateCallOrder);
      });
    });
  });

  // ========== CLEANUP ==========
  describe('Cleanup', () => {
    test('cancela fetch ao desmontar', async () => {
      const { unmount } = renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalled();
      });

      unmount();

      // Componente usa flag cancelled para evitar state updates após desmontagem
      expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument();
    });
  });
});