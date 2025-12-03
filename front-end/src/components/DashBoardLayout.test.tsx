import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import type { ProcessedActivityResponse, RepoActivitySummary } from '../pages/Utils';

// Mock dos componentes filhos
vi.mock('./Sidebar', () => ({
  default: ({ currentPage, onNavigate }: any) => (
    <div data-testid="sidebar" data-current-page={currentPage}>
      Sidebar Mock
      {onNavigate && <button onClick={() => onNavigate('test')}>Navigate</button>}
    </div>
  ),
}));

vi.mock('./RepositoryToolbar', () => ({
  default: ({ currentRepo, currentPage, data, onNavigate }: any) => (
    <div 
      data-testid="repository-toolbar" 
      data-current-repo={currentRepo}
      data-current-page={currentPage}
    >
      Repository Toolbar Mock
      {data && <span>Has Data</span>}
      {onNavigate && <button onClick={() => onNavigate('repo-test')}>Navigate</button>}
    </div>
  ),
}));

vi.mock('./OverviewToolbar', () => ({
  default: ({ currentPage, data, onNavigate }: any) => (
    <div 
      data-testid="overview-toolbar"
      data-current-page={currentPage}
    >
      Overview Toolbar Mock
      {data && <span>Has Data</span>}
      {onNavigate && <button onClick={() => onNavigate('overview-test')}>Navigate</button>}
    </div>
  ),
}));

// Mock do SidebarContext
vi.mock('../contexts/SidebarContext', () => ({
  SidebarProvider: ({ children }: any) => <div data-testid="sidebar-provider">{children}</div>,
  useSidebar: () => ({
    sidebarWidth: '240px',
    isCollapsed: false,
    toggleSidebar: vi.fn(),
  }),
}));

describe('DashboardLayout Component', () => {
  // ✅ CORRIGIDO: Estrutura correta conforme ProcessedActivityResponse
  const mockData: ProcessedActivityResponse = {
    generatedAt: '2024-01-01T00:00:00Z',
    repoCount: 2,
    totalActivities: 29, // ✅ É um número, não objeto!
    repositories: [ // ✅ Array de RepoActivitySummary
      {
        id: 1,
        name: 'repo1',
        activities: [
          {
            date: '2024-01-01T10:00:00Z',
            type: 'commit',
            user: {
              login: 'user1',
              displayName: 'User One',
            },
            additions: 10,
            deletions: 5,
            totalLines: 100,
          },
          {
            date: '2024-01-02T14:00:00Z',
            type: 'commit',
            user: {
              login: 'user2',
              displayName: 'User Two',
            },
            additions: 20,
            deletions: 3,
            totalLines: 117,
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
            user: {
              login: 'user1',
              displayName: 'User One',
            },
            additions: 15,
            deletions: 8,
            totalLines: 124,
          },
        ],
      },
    ] as RepoActivitySummary[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ Teste 1: Renderização básica
  test('renderiza com children e elementos básicos', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });

  // ✅ Teste 2: CurrentPage = 'repos' mostra RepositoryToolbar
  test('mostra RepositoryToolbar quando currentPage é "repos"', () => {
    render(
      <DashboardLayout currentPage="repos">
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('repository-toolbar')).toBeInTheDocument();
    expect(screen.queryByTestId('overview-toolbar')).not.toBeInTheDocument();
  });

  // ✅ Teste 3: CurrentPage = 'overview' mostra OverviewToolbar
  test('mostra OverviewToolbar quando currentPage é "overview"', () => {
    render(
      <DashboardLayout currentPage="overview">
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('overview-toolbar')).toBeInTheDocument();
    expect(screen.queryByTestId('repository-toolbar')).not.toBeInTheDocument();
  });

  // ✅ Teste 4: CurrentPage diferente não mostra toolbars
  test('não mostra toolbars quando currentPage não é "repos" ou "overview"', () => {
    render(
      <DashboardLayout currentPage="settings">
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.queryByTestId('repository-toolbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('overview-toolbar')).not.toBeInTheDocument();
  });

  // ✅ Teste 5: onRepo prop explícito
  test('onRepo é sobrescrito quando currentPage="repos"', () => {
    render(
      <DashboardLayout currentPage="repos" onRepo={false}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('repository-toolbar')).toBeInTheDocument();
  });

  // ✅ Teste 6: onOverview prop explícito
  test('onOverview é sobrescrito quando currentPage="overview"', () => {
    render(
      <DashboardLayout currentPage="overview" onOverview={false}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId('overview-toolbar')).toBeInTheDocument();
  });

  // ✅ Teste 7: currentRepo prop
  test('passa currentRepo para RepositoryToolbar', () => {
    render(
      <DashboardLayout currentPage="repos" currentRepo="my-repo">
        <div>Content</div>
      </DashboardLayout>
    );

    const toolbar = screen.getByTestId('repository-toolbar');
    expect(toolbar).toHaveAttribute('data-current-repo', 'my-repo');
  });

  // ✅ Teste 8: currentRepo padrão
  test('usa valor padrão quando currentRepo não fornecido', () => {
    render(
      <DashboardLayout currentPage="repos">
        <div>Content</div>
      </DashboardLayout>
    );

    const toolbar = screen.getByTestId('repository-toolbar');
    expect(toolbar).toHaveAttribute('data-current-repo', 'No Repository Selected');
  });

  // ✅ Teste 9: currentSubPage prop
  test('passa currentSubPage para toolbars', () => {
    render(
      <DashboardLayout currentPage="repos" currentSubPage="activity">
        <div>Content</div>
      </DashboardLayout>
    );

    const toolbar = screen.getByTestId('repository-toolbar');
    expect(toolbar).toHaveAttribute('data-current-page', 'activity');
  });

  // ✅ Teste 10: data prop para RepositoryToolbar
  test('passa data para RepositoryToolbar', () => {
    render(
      <DashboardLayout currentPage="repos" data={mockData}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Has Data')).toBeInTheDocument();
  });

  // ✅ Teste 11: data prop para OverviewToolbar
  test('passa data para OverviewToolbar', () => {
    render(
      <DashboardLayout currentPage="overview" data={mockData}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Has Data')).toBeInTheDocument();
  });

  // ✅ Teste 12: data null
  test('funciona com data null', () => {
    render(
      <DashboardLayout currentPage="repos" data={null}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.queryByText('Has Data')).not.toBeInTheDocument();
  });

  // ✅ Teste 13-25: Resto dos testes...
  test('passa onNavigate para Sidebar', () => {
    const handleNavigate = vi.fn();
    render(<DashboardLayout onNavigate={handleNavigate}><div>Content</div></DashboardLayout>);
    expect(screen.getByTestId('sidebar').querySelector('button')).toBeInTheDocument();
  });

  test('passa onNavigate para RepositoryToolbar', () => {
    const handleNavigate = vi.fn();
    render(<DashboardLayout currentPage="repos" onNavigate={handleNavigate}><div>Content</div></DashboardLayout>);
    expect(screen.getByTestId('repository-toolbar').querySelector('button')).toBeInTheDocument();
  });

  test('passa onNavigate para OverviewToolbar', () => {
    const handleNavigate = vi.fn();
    render(<DashboardLayout currentPage="overview" onNavigate={handleNavigate}><div>Content</div></DashboardLayout>);
    expect(screen.getByTestId('overview-toolbar').querySelector('button')).toBeInTheDocument();
  });

  test('aplica classes CSS corretas no layout', () => {
    const { container } = render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const mainContainer = container.querySelector('.min-h-screen.flex');
    expect(mainContainer).toBeInTheDocument();
  });

  test('aplica estilo correto no main content', () => {
    const { container } = render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  test('aplica padding no container de conteúdo', () => {
    const { container } = render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const contentDiv = container.querySelector('main > div');
    expect(contentDiv).toHaveClass('w-full', 'p-8');
  });

  test('envolve layout com SidebarProvider', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
  });

  test('renderiza múltiplos children', () => {
    render(
      <DashboardLayout>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </DashboardLayout>
    );
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  test('funciona com currentPage undefined', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.queryByTestId('repository-toolbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('overview-toolbar')).not.toBeInTheDocument();
  });

  test('passa currentPage para Sidebar', () => {
    render(<DashboardLayout currentPage="dashboard"><div>Content</div></DashboardLayout>);
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-current-page', 'dashboard');
  });

  test('não mostra toolbars com outro currentPage', () => {
    render(<DashboardLayout currentPage="analytics"><div>Content</div></DashboardLayout>);
    expect(screen.queryByTestId('repository-toolbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('overview-toolbar')).not.toBeInTheDocument();
  });

  test('atualiza toolbars quando currentPage muda', () => {
    const { rerender } = render(<DashboardLayout currentPage="repos"><div>Content</div></DashboardLayout>);
    expect(screen.getByTestId('repository-toolbar')).toBeInTheDocument();
    
    rerender(<DashboardLayout currentPage="overview"><div>Content</div></DashboardLayout>);
    expect(screen.queryByTestId('repository-toolbar')).not.toBeInTheDocument();
    expect(screen.getByTestId('overview-toolbar')).toBeInTheDocument();
  });

  test('funciona com todas as props fornecidas', () => {
    const handleNavigate = vi.fn();
    render(
      <DashboardLayout
        currentPage="repos"
        currentSubPage="commits"
        onRepo={true}
        onOverview={false}
        currentRepo="test-repo"
        data={mockData}
        onNavigate={handleNavigate}
      >
        <div>Full Props Content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('Full Props Content')).toBeInTheDocument();
    expect(screen.getByTestId('repository-toolbar')).toBeInTheDocument();
    expect(screen.getByText('Has Data')).toBeInTheDocument();
  });
});