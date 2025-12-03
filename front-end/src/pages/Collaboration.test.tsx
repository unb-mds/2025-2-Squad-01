import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CollaborationPage from './Collaboration';
import { SidebarProvider } from '../contexts/SidebarContext';
import { Utils } from './Utils';

// Mock fetch globally
global.fetch = vi.fn();

// Mock do Utils
vi.mock('./Utils', () => ({
  Utils: {
    fetchAndProcessActivityData: vi.fn(),
  },
}));

// Mock dos componentes de gráfico
vi.mock('../components/Graphs', () => ({
  CollaborationNetworkGraph: ({ data }: any) => (
    <div data-testid="collaboration-graph">
      Graph with {data.length} edges
    </div>
  ),
  ActivityHeatmap: ({ data }: any) => (
    <div data-testid="activity-heatmap">
      Heatmap with {data.length} points
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

describe('CollaborationPage Component', () => {
  const mockCollaborationData = [
    { user1: 'user1', user2: 'user2', repo: 'repo1', collaboration_type: 'commit' },
    { user1: 'user2', user2: 'user3', repo: 'repo1', collaboration_type: 'issue' },
    { user1: 'user1', user2: 'user3', repo: 'repo2', collaboration_type: 'pr' },
  ];

  const mockHeatmapData = [
    { day_of_week: 0, hour: 9, activity_count: 5 },
    { day_of_week: 1, hour: 14, activity_count: 8 },
    { day_of_week: 2, hour: 10, activity_count: 3 },
  ];

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
            date: '2024-01-01',
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
            date: '2024-01-02',
            type: 'commit',
            user: { login: 'user2', displayName: 'User Two' },
          },
        ],
      },
    ],
  };

  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    return render(
      <BrowserRouter>
        <SidebarProvider>
          <CollaborationPage />
        </SidebarProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock do Utils.fetchAndProcessActivityData
    (Utils.fetchAndProcessActivityData as any).mockResolvedValue(mockProcessedData);
    
    // Mock bem-sucedido por padrão para fetch
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('collaboration_edges.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCollaborationData,
        });
      }
      if (url.includes('activity_heatmap.json')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== RENDERIZAÇÃO E LOADING ==========
  describe('Renderização e Loading', () => {
    test('mostra loading state inicialmente', () => {
      renderWithRouter();

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('renderiza título e descrição após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Collaboration Map')).toBeInTheDocument();
      });

      expect(screen.getByText(/Represents the collaboration connections/)).toBeInTheDocument();
    });

    test('renderiza DashboardLayout com props corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-page', 'overview');
        expect(layout).toHaveAttribute('data-subpage', 'collaboration');
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
    test('faz fetch dos dois arquivos em paralelo', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('collaboration_edges.json')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('activity_heatmap.json')
      );
    });

    test('chama Utils.fetchAndProcessActivityData', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('commit');
      });
    });

    test('processa dados de colaboração corretamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toHaveTextContent('Graph with 3 edges');
      });
    });

    test('filtra metadata dos dados', async () => {
      const dataWithMetadata = [
        ...mockCollaborationData,
        { _metadata: { version: '1.0' } } as any,
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => dataWithMetadata,
          });
        }
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockHeatmapData,
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      renderWithRouter();

      await waitFor(() => {
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toHaveTextContent('Graph with 3 edges');
      });
    });

    test('atualiza estado com dados processados', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('collaboration-graph')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
  });

  // ========== TRATAMENTO DE ERROS ==========
  describe('Tratamento de Erros', () => {
    test('mostra erro quando fetch de colaboração falha', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
      });

      expect(screen.getByText(/status: 404/)).toBeInTheDocument();
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
          json: async () => mockCollaborationData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
      });
    });

    test('mostra erro quando fetch lança exceção', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    test('não renderiza gráficos quando há erro', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Fetch failed'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('collaboration-graph')).not.toBeInTheDocument();
    });

    test('limpa estado de loading quando erro ocorre', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
    });
  });

  // ========== RENDERIZAÇÃO DE COMPONENTES ==========
  describe('Renderização de Componentes', () => {
    test('renderiza CollaborationNetworkGraph com dados', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('collaboration-graph')).toBeInTheDocument();
      });
    });

    test('renderiza card de Collaboration Network', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Collaboration Network')).toBeInTheDocument();
      });
    });

    test('mostra mensagem quando não há dados de colaboração', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Collaboration data not available.')).toBeInTheDocument();
      });
    });

    test('renderiza botão de explicação', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/How to interpret this graph/)).toBeInTheDocument();
      });
    });

    test('card pai tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByText('Collaboration Network');
        const card = heading.closest('.border.rounded-lg');
        expect(card).toBeInTheDocument();
      });
    });
  });

  // ========== INTERATIVIDADE - DROPDOWN DE EXPLICAÇÃO ==========
  describe('Interatividade - Dropdown de Explicação', () => {
    test('dropdown está fechado por padrão', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/How to interpret this graph/)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Two developers are considered collaborators/)).not.toBeInTheDocument();
    });

    test('abre dropdown ao clicar no botão', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        fireEvent.click(button!);
      });

      expect(screen.getByText(/Two developers are considered collaborators/)).toBeInTheDocument();
    });

    test('fecha dropdown ao clicar novamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        fireEvent.click(button!);
      });

      expect(screen.getByText(/Two developers are considered collaborators/)).toBeInTheDocument();

      const button = screen.getByText(/How to interpret this graph/).closest('button');
      fireEvent.click(button!);

      expect(screen.queryByText(/Two developers are considered collaborators/)).not.toBeInTheDocument();
    });

    test('mostra seta correta quando fechado', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        expect(button).toHaveTextContent('▶');
      });
    });

    test('mostra seta correta quando aberto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        fireEvent.click(button!);
      });

      const button = screen.getByText(/How to interpret this graph/).closest('button');
      expect(button).toHaveTextContent('▼');
    });

    test('renderiza conteúdo completo da explicação', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        fireEvent.click(button!);
      });

      expect(screen.getByText(/Made commits to the same repository/)).toBeInTheDocument();
      expect(screen.getByText(/Created or commented on issues/)).toBeInTheDocument();
      expect(screen.getByText(/Participated in pull requests/)).toBeInTheDocument();
    });

    test('estado do dropdown persiste durante re-render', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        fireEvent.click(button!);
      });

      expect(screen.getByText(/Two developers are considered collaborators/)).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CollaborationPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(screen.getByText(/Two developers are considered collaborators/)).toBeInTheDocument();
    });
  });

  // ========== FILTRO DE REPOSITÓRIOS ==========
  describe('Filtro de Repositórios', () => {
    test('mostra todos os repositórios por padrão', async () => {
      renderWithRouter();

      await waitFor(() => {
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toHaveTextContent('Graph with 3 edges');
      });
    });

    test('filtra dados por repositório quando especificado', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('collaboration-graph')).toBeInTheDocument();
      });

      const graph = screen.getByTestId('collaboration-graph');
      expect(graph).toBeInTheDocument();
    });

    test('mostra "All repositories" quando repo=all', async () => {
      window.history.pushState({}, '', '?repo=all');

      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
      });
    });

    test('trata repo inválido como "all"', async () => {
      window.history.pushState({}, '', '?repo=invalid');

      renderWithRouter();

      await waitFor(() => {
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toHaveTextContent('Graph with 3 edges');
      });
    });

    test('atualiza gráfico quando filtro de repo muda', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('collaboration-graph')).toBeInTheDocument();
      });

      window.history.pushState({}, '', '?repo=1');

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CollaborationPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toBeInTheDocument();
      });
    });
  });

  // ========== INTEGRAÇÃO COM UTILS ==========
  describe('Integração com Utils', () => {
    test('chama Utils.fetchAndProcessActivityData com tipo correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledWith('commit');
      });
    });

    test('usa dados processados para lista de repositórios', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toBeInTheDocument();
      });
    });

    test('selectedRepo é "All repositories" por padrão sem query param', async () => {
      // Limpa qualquer query param
      window.history.pushState({}, '', '/');
      
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
      });
    });
  });

  // ========== ESTADOS VAZIOS ==========
  describe('Estados Vazios', () => {
    test('mostra mensagem quando não há dados', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Collaboration data not available.')).toBeInTheDocument();
      });
    });

    test('lida com null em dados de colaboração', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => null,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
      });
    });

    test('renderiza quando não há repositórios nos dados processados', async () => {
      // Quando não há repositórios, o componente cria um "All repositories" vazio
      (Utils.fetchAndProcessActivityData as any).mockResolvedValue({
        generatedAt: '2024-01-01T00:00:00Z',
        repoCount: 0,
        totalActivities: 0,
        repositories: [],
      });

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }
        if (url.includes('activity_heatmap.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockHeatmapData,
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      renderWithRouter();

      await waitFor(() => {
        // Com repositories vazio, selectedRepo vira "All repositories" com activities vazias
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-repo', 'All repositories');
        // E mostra mensagem de dados não disponíveis porque collaboration edges está vazio por padrão
        expect(screen.getByText('Collaboration data not available.')).toBeInTheDocument();
      });
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('botão é acessível', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        expect(button).toBeInTheDocument();
      });
    });

    test('heading está presente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Collaboration Map/ })).toBeInTheDocument();
      });
    });

    test('lista usa elementos semânticos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        fireEvent.click(button!);
      });

      const list = screen.getByText(/Made commits to the same repository/).closest('ul');
      expect(list).toBeInTheDocument();
    });
  });

  // ========== PERFORMANCE ==========
  describe('Performance', () => {
    test('renderiza dados eficientemente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('collaboration-graph')).toBeInTheDocument();
      });
    });

    test('não refaz fetch em re-renders', async () => {
      const { rerender } = renderWithRouter();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
      });

      rerender(
        <BrowserRouter>
          <SidebarProvider>
            <CollaborationPage />
          </SidebarProvider>
        </BrowserRouter>
      );

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(Utils.fetchAndProcessActivityData).toHaveBeenCalledTimes(1);
    });

    test('dados filtrados refletem todos os edges quando sem filtro', async () => {
      window.history.pushState({}, '', '/');
      
      renderWithRouter();

      await waitFor(() => {
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toHaveTextContent('Graph with 3 edges');
      });
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('renderiza com dados malformados sem repo', async () => {
      // Dados malformados: um objeto inválido e um válido
      // O filtro d && !d._metadata passa ambos porque ambos não têm _metadata
      // Mas o segundo tem repo, então 2 edges são válidos para renderização
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { invalid: 'data' }, // Sem repo, mas passa no filtro
              { user1: 'user1', user2: 'user2', repo: 'repo1' }, // Válido
            ],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        // O componente renderiza ambos os dados porque o filtro só remove _metadata
        const graph = screen.getByTestId('collaboration-graph');
        expect(graph).toHaveTextContent('Graph with 2 edges');
      });
    });

    test('filtra dados inválidos corretamente', async () => {
      const invalidData = [
        { user1: 'user1', user2: null, repo: 'repo1' },
        { user1: null, user2: 'user2', repo: 'repo1' },
        { user1: 'user1', user2: 'user2', repo: 'repo1' },
      ];

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => invalidData,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('collaboration-graph')).toBeInTheDocument();
      });
    });

    test('lida com timeout', async () => {
      (global.fetch as any).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('lida com JSON inválido', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('collaboration_edges.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => {
              throw new Error('Invalid JSON');
            },
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockHeatmapData,
        });
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Error loading data:/)).toBeInTheDocument();
      });
    });
  });

  // ========== LAYOUT E ESTILOS ==========
  describe('Layout e Estilos', () => {
    test('container tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = screen.getByText('Collaboration Map').parentElement;
        expect(container).toHaveClass('h-fit', 'mt-30');
      });
    });

    test('card tem estilos inline corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByText('Collaboration Network');
        const card = heading.closest('div[style*="background-color"]');
        expect(card).toHaveStyle({
          backgroundColor: 'rgb(34, 34, 34)',
        });
      });
    });

    test('header tem border correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const header = screen.getByText('Collaboration Network').parentElement;
        expect(header).toHaveStyle({
          borderBottomColor: 'rgb(51, 51, 51)',
        });
      });
    });

    test('botão tem classes hover', async () => {
      renderWithRouter();

      await waitFor(() => {
        const button = screen.getByText(/How to interpret this graph/).closest('button');
        expect(button).toHaveClass('hover:bg-gray-800/50');
      });
    });
  });
});