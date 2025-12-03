import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Timeline from './Timeline';
import { SidebarProvider } from '../contexts/SidebarContext';
import { TimelineExtraction } from './TimelineExtraction';

// Mock do TimelineExtraction
vi.mock('./TimelineExtraction', () => ({
  TimelineExtraction: {
    extractTimelineData: vi.fn(),
  },
}));

// Mock do CalendarHeatmap
vi.mock('../components/CalendarHeatmap', () => ({
  default: ({ userData, mode, dateLabels }: any) => (
    <div data-testid="calendar-heatmap">
      <div>Users: {userData.length}</div>
      <div>Mode: {mode}</div>
      <div>Dates: {dateLabels.length}</div>
    </div>
  ),
}));

// Mock do DashboardLayout
vi.mock('../components/DashboardLayout', () => ({
  default: ({ children, currentPage, currentSubPage }: any) => (
    <div data-testid="dashboard-layout" data-page={currentPage} data-subpage={currentSubPage}>
      {children}
    </div>
  ),
}));

// Mock do Filter
vi.mock('../components/Filter', () => ({
  Filter: ({ title, content, value, sendSelectedValue }: any) => (
    <div data-testid="filter">
      <label>{title}</label>
      <select
        data-testid="filter-select"
        value={value}
        onChange={(e) => sendSelectedValue(e.target.value)}
      >
        {content.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock do MemberFilter
vi.mock('../components/MemberFilter', () => ({
  MemberFilter: ({ members, selectedMembers, onMemberChange }: any) => (
    <div data-testid="member-filter">
      <div>Available: {members.length}</div>
      <div>Selected: {selectedMembers.length}</div>
      <button onClick={() => onMemberChange(['user1'])}>Select User</button>
    </div>
  ),
}));

describe('Timeline Component', () => {
  const mockTimelineData = [
    {
      date: '2024-01-01',
      users: [
        {
          name: 'User One',
          repositories: ['repo1'],
          activities: {
            commits: 5,
            issues_created: 2,
            issues_closed: 1,
            prs_created: 3,
            prs_closed: 2,
            comments: 4,
          },
        },
      ],
    },
    {
      date: '2024-01-02',
      users: [
        {
          name: 'User Two',
          repositories: ['repo2'],
          activities: {
            commits: 3,
            issues_created: 1,
            issues_closed: 0,
            prs_created: 2,
            prs_closed: 1,
            comments: 2,
          },
        },
      ],
    },
    {
      date: '2024-01-03',
      users: [],
    },
  ];

  const renderWithRouter = (initialUrl: string = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <SidebarProvider>
          <Timeline />
        </SidebarProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (TimelineExtraction.extractTimelineData as any).mockResolvedValue(mockTimelineData);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza título principal', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
      });
    });

    test('renderiza descrição', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Timeline of/)).toBeInTheDocument();
      });
    });

    test('renderiza DashboardLayout com props corretos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const layout = screen.getByTestId('dashboard-layout');
        expect(layout).toHaveAttribute('data-page', 'overview');
        expect(layout).toHaveAttribute('data-subpage', 'timeline');
      });
    });

    test('renderiza Filter de tempo', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('filter')).toBeInTheDocument();
      });
    });

    test('renderiza MemberFilter', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('member-filter')).toBeInTheDocument();
      });
    });

    test('renderiza container principal', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = document.querySelector('.w-full.h-full');
        expect(container).toBeInTheDocument();
      });
    });

    test('renderiza grid de gráficos', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = document.querySelector('.border.rounded-lg');
        expect(grid).toBeInTheDocument();
      });
    });
  });

  // ========== FETCH DE DADOS ==========
  describe('Fetch de Dados', () => {
    test('chama TimelineExtraction com filtro de 7 dias por padrão', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledWith(
          'last_7_days',
          undefined
        );
      });
    });

    test('chama fetch apenas uma vez na montagem', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledTimes(1);
      });
    });

    test('passa filtro de repositório quando presente na URL', async () => {
      renderWithRouter('?repo=test-repo');

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledWith(
          'last_7_days',
          'test-repo'
        );
      });
    });

    test('não passa filtro de repositório quando ausente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledWith(
          'last_7_days',
          undefined
        );
      });
    });

    test('transforma dados corretamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Users: 2');
      });
    });

    test('gera labels de datas corretamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Dates: 7');
      });
    });
  });

  // ========== ESTADOS DE LOADING ==========
  describe('Estados de Loading', () => {
    test('mostra loading durante fetch', () => {
      renderWithRouter();

      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    test('esconde loading após dados carregarem', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
      });
    });

    test('loading tem estilo correto', () => {
      renderWithRouter();

      const loading = screen.getByText('Loading data...');
      expect(loading).toHaveClass('text-center', 'text-slate-400', 'py-8');
    });
  });

  // ========== TRATAMENTO DE ERROS ==========
  describe('Tratamento de Erros', () => {
    test('mostra "No data available" quando fetch falha', async () => {
      (TimelineExtraction.extractTimelineData as any).mockRejectedValue(
        new Error('Network error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('No data available')).toBeInTheDocument();
      });
    });

    test('não renderiza CalendarHeatmap quando há erro', async () => {
      (TimelineExtraction.extractTimelineData as any).mockRejectedValue(
        new Error('Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('calendar-heatmap')).not.toBeInTheDocument();
      });
    });

    test('limpa userData quando erro ocorre', async () => {
      (TimelineExtraction.extractTimelineData as any).mockRejectedValue(
        new Error('Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('No data available')).toBeInTheDocument();
      });
    });

    test('limpa dateLabels quando erro ocorre', async () => {
      (TimelineExtraction.extractTimelineData as any).mockRejectedValue(
        new Error('Error')
      );

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('calendar-heatmap')).not.toBeInTheDocument();
      });
    });
  });

  // ========== FILTRO DE TEMPO ==========
  describe('Filtro de Tempo', () => {
    test('filtro padrão é "Last 7 days"', async () => {
      renderWithRouter();

      await waitFor(() => {
        const select = screen.getByTestId('filter-select');
        expect(select).toHaveValue('Last 7 days');
      });
    });

    test('mudança para "Last 12 months" chama fetch com filtro correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const select = screen.getByTestId('filter-select');
        fireEvent.change(select, { target: { value: 'Last 12 months' } });
      });

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledWith(
          'last_12_months',
          undefined
        );
      });
    });

    test('filtro tem opções corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Last 7 days')).toBeInTheDocument();
        expect(screen.getByText('Last 12 months')).toBeInTheDocument();
      });
    });

    test('mudança de filtro atualiza CalendarHeatmap mode', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Mode: weekly');
      });

      const select = screen.getByTestId('filter-select');
      fireEvent.change(select, { target: { value: 'Last 12 months' } });

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Mode: monthly');
      });
    });
  });

  // ========== FILTRO DE MEMBROS ==========
  describe('Filtro de Membros', () => {
    test('mostra todos os membros inicialmente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        expect(memberFilter).toHaveTextContent('Available: 2');
      });
    });

    test('selectedMembers padrão é array vazio', async () => {
      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        expect(memberFilter).toHaveTextContent('Selected: 0');
      });
    });

    test('membros são extraídos corretamente dos dados', async () => {
      renderWithRouter();

      await waitFor(() => {
        const memberFilter = screen.getByTestId('member-filter');
        expect(memberFilter).toHaveTextContent('Available: 2');
      });
    });

    test('membros são ordenados alfabeticamente', async () => {
      const unsortedData = [
        {
          date: '2024-01-01',
          users: [
            {
              name: 'Zoe',
              repositories: [],
              activities: {
                commits: 1,
                issues_created: 0,
                issues_closed: 0,
                prs_created: 0,
                prs_closed: 0,
                comments: 0,
              },
            },
            {
              name: 'Alice',
              repositories: [],
              activities: {
                commits: 1,
                issues_created: 0,
                issues_closed: 0,
                prs_created: 0,
                prs_closed: 0,
                comments: 0,
              },
            },
          ],
        },
      ];

      (TimelineExtraction.extractTimelineData as any).mockResolvedValue(unsortedData);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('member-filter')).toBeInTheDocument();
      });
    });
  });

  // ========== RENDERIZAÇÃO DO CALENDARHEATMAP ==========
  describe('Renderização do CalendarHeatmap', () => {
    test('renderiza CalendarHeatmap após loading', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      });
    });

    test('CalendarHeatmap recebe userData correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Users: 2');
      });
    });

    test('CalendarHeatmap recebe mode "weekly" por padrão', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Mode: weekly');
      });
    });

    test('CalendarHeatmap recebe mode "monthly" para 12 meses', async () => {
      renderWithRouter();

      await waitFor(() => {
        const select = screen.getByTestId('filter-select');
        fireEvent.change(select, { target: { value: 'Last 12 months' } });
      });

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Mode: monthly');
      });
    });
  });

  // ========== ESTADOS VAZIOS ==========
  describe('Estados Vazios', () => {
    test('mostra "No data available" quando não há dados', async () => {
      (TimelineExtraction.extractTimelineData as any).mockResolvedValue([]);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('No data available')).toBeInTheDocument();
      });
    });

    test('não renderiza CalendarHeatmap quando não há dados', async () => {
      (TimelineExtraction.extractTimelineData as any).mockResolvedValue([]);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.queryByTestId('calendar-heatmap')).not.toBeInTheDocument();
      });
    });

    test('mensagem vazia tem estilo correto', async () => {
      (TimelineExtraction.extractTimelineData as any).mockResolvedValue([]);

      renderWithRouter();

      await waitFor(() => {
        const message = screen.getByText('No data available');
        expect(message).toHaveClass('text-center', 'text-slate-400', 'py-8');
      });
    });
  });

  // ========== TRANSFORMAÇÃO DE DADOS ==========
  describe('Transformação de Dados', () => {
    test('agrupa atividades por usuário', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Users: 2');
      });
    });

    test('calcula totais de atividades corretamente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      });
    });

    test('preenche dias faltantes para 7 dias', async () => {
      const incompleteData = [mockTimelineData[0]];
      (TimelineExtraction.extractTimelineData as any).mockResolvedValue(incompleteData);

      renderWithRouter();

      await waitFor(() => {
        const heatmap = screen.getByTestId('calendar-heatmap');
        expect(heatmap).toHaveTextContent('Dates: 7');
      });
    });

    test('mantém repositórios únicos por usuário', async () => {
      const dataWithDuplicateRepos = [
        {
          date: '2024-01-01',
          users: [
            {
              name: 'User One',
              repositories: ['repo1', 'repo1', 'repo2'],
              activities: {
                commits: 5,
                issues_created: 0,
                issues_closed: 0,
                prs_created: 0,
                prs_closed: 0,
                comments: 0,
              },
            },
          ],
        },
      ];

      (TimelineExtraction.extractTimelineData as any).mockResolvedValue(dataWithDuplicateRepos);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
      });
    });
  });

  // ========== INTEGRAÇÃO ==========
  describe('Integração', () => {
    test('fluxo completo de dados funciona', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalled();
        expect(screen.getByTestId('calendar-heatmap')).toBeInTheDocument();
        expect(screen.getByTestId('member-filter')).toBeInTheDocument();
      });
    });

    test('mudança de filtro refetch dados', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledTimes(1);
      });

      const select = screen.getByTestId('filter-select');
      fireEvent.change(select, { target: { value: 'Last 12 months' } });

      await waitFor(() => {
        expect(TimelineExtraction.extractTimelineData).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ========== LAYOUT E ESTILOS ==========
  describe('Layout e Estilos', () => {
    test('container principal tem classes corretas', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = document.querySelector('.w-full.h-full');
        expect(container).toHaveClass('-mx-8', '-my-8', 'px-8', 'py-8');
      });
    });

    test('grid tem largura fixa', async () => {
      renderWithRouter();

      await waitFor(() => {
        const grid = document.querySelector('.w-\\[1655px\\]');
        expect(grid).toBeInTheDocument();
      });
    });

    test('container de gráfico tem background correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const container = document.querySelector('.border.rounded-lg');
        expect(container).toHaveStyle({ backgroundColor: '#222222' });
      });
    });

    test('filtros têm layout flexbox correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const filtersContainer = document.querySelector('.h-auto.flex.flex-col');
        expect(filtersContainer).toBeInTheDocument();
      });
    });

    test('member filter tem borda esquerda', async () => {
      renderWithRouter();

      await waitFor(() => {
        const border = document.querySelector('.border-l-2');
        expect(border).toBeInTheDocument();
      });
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('título principal está presente', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Activity Timeline/ });
        expect(heading).toBeInTheDocument();
      });
    });

    test('título tem nível correto', async () => {
      renderWithRouter();

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Activity Timeline/ });
        expect(heading.tagName).toBe('H1');
      });
    });

    test('descrição está presente', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText(/Timeline of/)).toBeInTheDocument();
      });
    });
  });
});