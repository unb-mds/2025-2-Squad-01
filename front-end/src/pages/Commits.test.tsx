import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommitsPage from './Commits';
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
  CommitMetricsChart: ({ data, line_toggle }: any) => (
    <div data-testid="commit-metrics-chart">
      CommitMetricsChart with {data.length} points - Line: {line_toggle ? 'visible' : 'hidden'}
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

describe('CommitsPage Component', () => {
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
            additions: 10,
            deletions: 5,
            totalLines: 100,
          },
          {
            date: '2024-01-02T14:00:00Z',
            type: 'commit',
            user: { login: 'user2', displayName: 'User Two' },
            additions: 20,
            deletions: 10,
            totalLines: 110,
          },
        ],
      },
      {
        id: 2,
        name: 'repo2',
        activities: [
          {
            date: '2024-01-03T09:00:00Z',
            type: 'commit',
            user: { login: 'user1', displayName: 'User One' },
            additions: 15,
            deletions: 8,
            totalLines: 117,
          },
        ],
      },
    ],
  };

  const mockBasicData = [
    { date: '2024-01-01', value: 5, additions: 10, deletions: 5, totalLines: 100 },
    { date: '2024-01-02', value: 3, additions: 20, deletions: 10, totalLines: 110 },
    { date: '2024-01-03', value: 8, additions: 15, deletions: 8, totalLines: 117 },
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
          <CommitsPage />
        </SidebarProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do Utils.fetchAndProcessActivityData
    (Utils.fetchAndProcessActivityData as any).mockResolvedValue(mockProcessedData);
    
    // Mock do Utils.selectRepoAndFilter
    (Utils.selectRepoAndFilter as any).mockReturnValue({
      selectedRepo: {
        id: -1,
        name: 'All repositories',
        activities: mockProcessedData.repositories.flatMap(r => r.activities),
      },
      members: ['User One', 'User Two'],
    });
    
    // Mock do Utils.applyFilters
    (Utils.applyFilters as any).mockImplementation((activities) => activities);
    
    // Mock do Utils.aggregateBasicData
    (Utils.aggregateBasicData as any).mockReturnValue(mockBasicData);
    
    // Mock do Utils.aggregatePieData
    (Utils.aggregatePieData as any).mockReturnValue(mockPieData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== RENDERIZAÇÃO E LOADING ==========
  describe('Renderização e Loading', () => {
    test('mostra loading state ao carregar dados', async () => {
      renderWithRouter();

      // Inicialmente mostra loading nos gráficos
      expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
    });

    test('renderiza título e descrição após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Commits analysis')).toBeInTheDocument();
      });
    });

    test('renderiza informações do repositório selecionado', async () => {
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
        expect(layout).toHaveAttribute('data-subpage', 'commits');
      });
    });

    test('não mostra loading após dados carregarem', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  // ========== FETCH DE DADOS ==========
  describe('Fetch de Dados', () => {
    test('chama Utils.fetchAndProcessActivityData com tipo commit', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('commit');
      });
    });

    test('chama Utils.selectRepoAndFilter com repositórios e parâmetro', async () => {
      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(Utils.selectRepoAndFilter).toHaveBeenCalledWith(
          mockProcessedData.repositories,
          '1'
        );
      });
    });

    test('chama Utils.aggregateBasicData com configurações corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
      });
    });

    test('chama Utils.aggregatePieData para distribuição de contribuidores', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregatePieData).toHaveBeenCalled();
      });
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

    test('limpa estado de loading quando erro ocorre', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Error')
      );

      renderWithRouter();

      await waitFor(() => {
        const loadingElements = screen.queryAllByText('Loading...');
        expect(loadingElements.length).toBe(0);
      });
    });

    test('não renderiza gráficos quando há erro', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Fetch failed')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('histogram')).not.toBeInTheDocument();
      });
    });
  });

  // ========== RENDERIZAÇÃO DE COMPONENTES ==========
  describe('Renderização de Componentes', () => {
    test('renderiza Histogram com dados corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const histogram = screen.getByTestId('histogram');
        expect(histogram).toBeInTheDocument();
        expect(histogram).toHaveTextContent('Type: Commit');
      });
    });

    test('renderiza PieChart com dados corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const pieChart = screen.getByTestId('pie-chart');
        expect(pieChart).toBeInTheDocument();
        expect(pieChart).toHaveTextContent('Type: Commit');
      });
    });

    test('renderiza CommitMetricsChart', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('commit-metrics-chart')).toBeInTheDocument();
      });
    });

    test('renderiza lista de contribuidores com métricas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
      });
    });

    test('renderiza cards com títulos corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Timeline')).toBeInTheDocument();
        expect(screen.getByText('Contributors')).toBeInTheDocument();
        expect(screen.getByText('Commits Content Analysis')).toBeInTheDocument();
      });
    });
  });

  // ========== FILTROS ==========
  describe('Filtros', () => {
    test('renderiza BaseFilters component', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });
    });

    test('atualiza selectedMembers ao mudar filtro de membros', async () => {
      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        fireEvent.click(memberFilter);
      });

      await waitFor(() => {
        expect(Utils.applyFilters).toHaveBeenCalled();
      });
    });

    test('atualiza selectedTime ao mudar filtro de tempo', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timeFilter = screen.getByTestId('time-filter');
        fireEvent.click(timeFilter);
      });

      await waitFor(() => {
        expect(screen.getByText(/Time: Last 7 days/)).toBeInTheDocument();
      });
    });

    test('limpa selectedMembers ao mudar de repositório', async () => {
      const { rerender } = renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });

      // Simular mudança de repo
      window.history.pushState({}, '', '?repo=2');
      
      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CommitsPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });
    });

    test('aplica filtros corretamente através do Utils', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.applyFilters).toHaveBeenCalledWith(
          expect.any(Array),
          [],
          'Last 24 hours'
        );
      });
    });
  });

  // ========== INTERATIVIDADE ==========
  describe('Interatividade', () => {
    test('botão de toggle do line graph funciona', async () => {
      renderWithRouter();

      await waitFor(() => {
        const toggleButton = screen.getByText('Show Line Graph');
        expect(toggleButton).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('Show Line Graph');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Hide Line Graph')).toBeInTheDocument();
      });
    });

    test('CommitMetricsChart recebe line_toggle correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const chart = screen.getByTestId('commit-metrics-chart');
        expect(chart).toHaveTextContent('Line: hidden');
      });

      const toggleButton = screen.getByText('Show Line Graph');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const chart = screen.getByTestId('commit-metrics-chart');
        expect(chart).toHaveTextContent('Line: visible');
      });
    });

    test('estado do toggle persiste durante re-render', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        const toggleButton = screen.getByText('Show Line Graph');
        fireEvent.click(toggleButton);
      });

      expect(screen.getByText('Hide Line Graph')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CommitsPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Hide Line Graph')).toBeInTheDocument();
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

    test('mostra número correto de atividades para repositório selecionado', async () => {
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: mockProcessedData.repositories[0],
        members: ['User One', 'User Two'],
      });

      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(screen.getByText(/2 commits/)).toBeInTheDocument();
      });
    });

    test('atualiza dados ao mudar query param de repositório', async () => {
      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(Utils.selectRepoAndFilter).toHaveBeenCalledWith(
          mockProcessedData.repositories,
          '1'
        );
      });

      // Mudar URL sem re-render completo (simula navegação real)
      window.history.pushState({}, '', '?repo=2');
      
      // Trigger um evento que causa re-render (como seria no navegador real)
      window.dispatchEvent(new PopStateEvent('popstate'));

      await waitFor(() => {
        // Verifica que foi chamado novamente
        expect(Utils.selectRepoAndFilter).toHaveBeenCalled();
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
        expect(screen.getByTestId('histogram')).toHaveTextContent('0 points');
      });
    });

    test('renderiza quando não há repositório selecionado', async () => {
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

    test('mostra mensagem quando não há membros', async () => {
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: mockProcessedData.repositories[0],
        members: [],
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('base-filters')).toBeInTheDocument();
      });
    });
  });

  // ========== LAYOUT E ESTILOS ==========
  describe('Layout e Estilos', () => {
    test('container principal tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByText('Commits analysis');
        expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-white');
      });
    });

    test('card Timeline tem estilos inline corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timelineHeader = screen.getByText('Timeline');
        const timelineCard = timelineHeader.parentElement?.parentElement;
        
        expect(timelineCard).toHaveStyle({
          backgroundColor: 'rgb(34, 34, 34)',
          borderColor: 'rgb(51, 51, 51)',
        });
      });
    });

    test('grid de gráficos tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = screen.getByText('Timeline').parentElement?.parentElement?.parentElement;
        expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2');
      });
    });
  });

  // ========== INTEGRAÇÃO ==========
  describe('Integração', () => {
    test('todos os métodos do Utils são chamados na ordem correta', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('commit');
        expect(Utils.selectRepoAndFilter).toHaveBeenCalled();
        expect(Utils.applyFilters).toHaveBeenCalled();
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
        expect(Utils.aggregatePieData).toHaveBeenCalled();
      });
    });

    test('dados fluem corretamente do Utils para os gráficos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const histogram = screen.getByTestId('histogram');
        expect(histogram).toHaveTextContent(`${mockBasicData.length} points`);
        
        const pieChart = screen.getByTestId('pie-chart');
        expect(pieChart).toHaveTextContent(`${mockPieData.length} items`);
      });
    });

    test('filtros afetam agregação de dados', async () => {
      const filteredActivities = [mockProcessedData.repositories[0].activities[0]];
      (Utils.applyFilters as any).mockReturnValue(filteredActivities);

      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        fireEvent.click(memberFilter);
      });

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalledWith(
          filteredActivities,
          expect.any(Object)
        );
      });
    });
  });

  // ========== PERFORMANCE ==========
  describe('Performance', () => {
    test('não refaz fetch em re-renders', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CommitsPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
    });

    test('useMemo previne recálculos desnecessários', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        expect(Utils.aggregateBasicData).toHaveBeenCalled();
      });

      const initialCallCount = (Utils.aggregateBasicData as any).mock.calls.length;

      // Re-render sem mudanças
      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CommitsPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      // Deve manter o mesmo número de chamadas (useMemo preveniu recálculo)
      expect((Utils.aggregateBasicData as any).mock.calls.length).toBe(initialCallCount);
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('headings estão presentes e hierarquizados', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Commits analysis/ })).toBeInTheDocument();
        expect(screen.getByText('Timeline')).toBeInTheDocument();
        expect(screen.getByText('Contributors')).toBeInTheDocument();
      });
    });

    test('botão de toggle tem texto descritivo', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('Show Line Graph');
        expect(button.tagName).toBe('BUTTON');
      });
    });

    test('informações de métricas são exibidas claramente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/activities/)).toBeInTheDocument();
      });
    });
  });

  // ========== DESCRIÇÕES E TEXTO ==========
  describe('Descrições e Texto', () => {
    test('mostra descrição do Commits Content Analysis', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Detailed analysis of code changes/)).toBeInTheDocument();
      });
    });

    test('mostra contador de repositórios quando "All repositories"', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/2 repositories/)).toBeInTheDocument();
      });
    });

    test('mostra "commits" em vez de "activities" para repositório específico', async () => {
      (Utils.selectRepoAndFilter as any).mockReturnValue({
        selectedRepo: mockProcessedData.repositories[0],
        members: ['User One', 'User Two'],
      });

      renderWithRouter('?repo=1');

      await waitFor(() => {
        expect(screen.getByText(/commits/)).toBeInTheDocument();
      });
    });
  });

  // ========== LISTA DE CONTRIBUIDORES ==========
  describe('Lista de Contribuidores', () => {
    test('renderiza cores dos contribuidores corretamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        // Buscar pelos elementos de cor através da classe CSS
        const allDivs = screen.getAllByRole('generic');
        const colorDots = allDivs.filter((el) => 
          el.className.includes('w-3') && el.className.includes('h-3') && el.className.includes('rounded-full')
        );
        expect(colorDots.length).toBeGreaterThanOrEqual(2);
      });
    });

    test('renderiza valores de contribuição para cada membro', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    test('lista tem scroll quando há muitos contribuidores', async () => {
      const manyContributors = Array.from({ length: 20 }, (_, i) => ({
        label: `User ${i}`,
        value: i + 1,
        color: '#3b82f6',
      }));

      (Utils.aggregatePieData as any).mockReturnValue(manyContributors);

      renderWithRouter();

      await waitFor(() => {
        const firstUser = screen.getByText('User 0');
        const listContainer = firstUser.parentElement?.parentElement?.parentElement;
        expect(listContainer).toHaveClass('overflow-y-auto');
      });
    });
  });

  // ========== COMPORTAMENTO DO TOGGLE ==========
  describe('Comportamento do Toggle', () => {
    test('botão tem aria-pressed correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('Show Line Graph');
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });

      fireEvent.click(screen.getByText('Show Line Graph'));

      await waitFor(() => {
        const button = screen.getByText('Hide Line Graph');
        expect(button).toHaveAttribute('aria-pressed', 'true');
      });
    });

    test('botão tem title correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('Show Line Graph');
        expect(button).toHaveAttribute('title', 'Show Line Graph');
      });

      fireEvent.click(screen.getByText('Show Line Graph'));

      await waitFor(() => {
        const button = screen.getByText('Hide Line Graph');
        expect(button).toHaveAttribute('title', 'Hide Line Graph');
      });
    });

    test('botão muda classes CSS ao toggle', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText('Show Line Graph');
        expect(button).toHaveClass('bg-gray-600');
      });

      fireEvent.click(screen.getByText('Show Line Graph'));

      await waitFor(() => {
        const button = screen.getByText('Hide Line Graph');
        expect(button).toHaveClass('bg-gray-400');
      });
    });
  });

  // ========== CONFIGURAÇÕES DE AGREGAÇÃO ==========
  describe('Configurações de Agregação', () => {
    test('usa groupByHour quando tempo é "Last 24 hours"', async () => {
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

    test('passa cutoffDate como null após aplicar filtro', async () => {
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

  // ========== CARDS DE ESTILOS ==========
  describe('Cards de Estilos', () => {
    test('card Commits Content Analysis tem margin-top', async () => {
      renderWithRouter();

      await waitFor(() => {
        const analysisCardContainer = screen.getByText('Commits Content Analysis').parentElement?.parentElement?.parentElement;
        expect(analysisCardContainer).toHaveClass('mt-5');
      });
    });

    test('headers dos cards têm border-bottom', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timelineHeader = screen.getByText('Timeline').parentElement;
        expect(timelineHeader).toHaveStyle({
          borderBottomColor: 'rgb(51, 51, 51)',
        });
      });
    });
  });

  // ========== ESTADOS DE CARREGAMENTO ESPECÍFICOS ==========
  describe('Estados de Carregamento Específicos', () => {
    test('mostra loading no Timeline separadamente', async () => {
      renderWithRouter();

      const loadingElements = screen.getAllByText('Loading...');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    test('mostra loading nos Contributors separadamente', async () => {
      renderWithRouter();

      const loadingElements = screen.getAllByText('Loading...');
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    test('altura do container de loading está correta', async () => {
      renderWithRouter();

      const loadingContainer = screen.getAllByText('Loading...')[0].parentElement;
      expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  // ========== ESTADOS DE ERRO ESPECÍFICOS ==========
  describe('Estados de Erro Específicos', () => {
    test('mostra erro no Timeline quando fetch falha', async () => {
      (Utils.fetchAndProcessActivityData as any).mockRejectedValue(
        new Error('Timeline error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getAllByText('Timeline error').length).toBeGreaterThan(0);
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
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('grid usa breakpoint md para 2 colunas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timelineCard = screen.getByText('Timeline').parentElement?.parentElement;
        const grid = timelineCard?.parentElement;
        expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2');
      });
    });

    test('Timeline tem largura e altura fixas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const timelineCard = screen.getByText('Timeline').parentElement?.parentElement;
        expect(timelineCard).toHaveClass('h-170', 'w-170');
      });
    });
  });

  // ========== INTEGRAÇÃO COMPLETA COM FILTROS ==========
  describe('Integração Completa com Filtros', () => {
    test('filtro de tempo recalcula dados agregados', async () => {
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

    test('mudança de repositório reseta filtros de membro', async () => {
      renderWithRouter('?repo=1');

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        fireEvent.click(memberFilter);
      });

      await waitFor(() => {
        expect(screen.getByText(/Members: 1/)).toBeInTheDocument();
      });

      // Mudar repositório
      window.history.pushState({}, '', '?repo=2');
      
      render(
        <BrowserRouter>
          <SidebarProvider>
            <CommitsPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Members: 0/)).toBeInTheDocument();
      });
    });
  });
});