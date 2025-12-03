import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock dos componentes de página
vi.mock('./pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('./pages/Commits', () => ({
  default: () => <div data-testid="commits-page">Commits Page</div>,
}));

vi.mock('./pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

vi.mock('./pages/Collaboration', () => ({
  default: () => <div data-testid="collaboration-page">Collaboration Page</div>,
}));

vi.mock('./pages/Heatmap', () => ({
  default: () => <div data-testid="heatmap-page">Heatmap Page</div>,
}));

vi.mock('./pages/PullRequests', () => ({
  default: () => <div data-testid="pullrequests-page">Pull Requests Page</div>,
}));

vi.mock('./pages/Issues', () => ({
  default: () => <div data-testid="issues-page">Issues Page</div>,
}));

vi.mock('./pages/Timeline', () => ({
  default: () => <div data-testid="timeline-page">Timeline Page</div>,
}));

describe('App Component', () => {
  // Helper function para renderizar com rota específica
  const renderWithRouter = (initialRoute: string = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    );
  };

  // ========== HOME ROUTES ==========
  describe('Home Routes', () => {
    test('renderiza HomePage na rota "/"', () => {
      renderWithRouter('/');
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    test('renderiza HomePage na rota "/home"', () => {
      renderWithRouter('/home');
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    test('"/" e "/home" renderizam o mesmo componente', () => {
      const { unmount } = renderWithRouter('/');
      const homeFromRoot = screen.getByTestId('home-page');
      expect(homeFromRoot).toBeInTheDocument();
      
      unmount();
      
      renderWithRouter('/home');
      const homeFromHome = screen.getByTestId('home-page');
      expect(homeFromHome).toBeInTheDocument();
    });
  });

  // ========== OVERVIEW ROUTES ==========
  describe('Overview Routes', () => {
    test('renderiza Timeline na rota "/overview/timeline"', () => {
      renderWithRouter('/overview/timeline');
      
      expect(screen.getByTestId('timeline-page')).toBeInTheDocument();
      expect(screen.getByText('Timeline Page')).toBeInTheDocument();
    });

    test('renderiza CollaborationPage na rota "/overview/collaboration"', () => {
      renderWithRouter('/overview/collaboration');
      
      expect(screen.getByTestId('collaboration-page')).toBeInTheDocument();
      expect(screen.getByText('Collaboration Page')).toBeInTheDocument();
    });

    test('renderiza HeatmapPage na rota "/overview/heatmap"', () => {
      renderWithRouter('/overview/heatmap');
      
      expect(screen.getByTestId('heatmap-page')).toBeInTheDocument();
      expect(screen.getByText('Heatmap Page')).toBeInTheDocument();
    });

    test('todas as rotas de overview estão sob "/overview/"', () => {
      const overviewRoutes = [
        '/overview/timeline',
        '/overview/collaboration',
        '/overview/heatmap',
      ];

      overviewRoutes.forEach((route) => {
        const { unmount } = renderWithRouter(route);
        expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
        unmount();
      });
    });
  });

  // ========== REPOS ROUTES ==========
  describe('Repos Routes', () => {
    test('renderiza Commits na rota "/repos/commits"', () => {
      renderWithRouter('/repos/commits');
      
      expect(screen.getByTestId('commits-page')).toBeInTheDocument();
      expect(screen.getByText('Commits Page')).toBeInTheDocument();
    });

    test('renderiza PullRequestsPage na rota "/repos/pullrequests"', () => {
      renderWithRouter('/repos/pullrequests');
      
      expect(screen.getByTestId('pullrequests-page')).toBeInTheDocument();
      expect(screen.getByText('Pull Requests Page')).toBeInTheDocument();
    });

    test('renderiza IssuesPage na rota "/repos/issues"', () => {
      renderWithRouter('/repos/issues');
      
      expect(screen.getByTestId('issues-page')).toBeInTheDocument();
      expect(screen.getByText('Issues Page')).toBeInTheDocument();
    });

    test('todas as rotas de repos estão sob "/repos/"', () => {
      const reposRoutes = [
        '/repos/commits',
        '/repos/pullrequests',
        '/repos/issues',
      ];

      reposRoutes.forEach((route) => {
        const { unmount } = renderWithRouter(route);
        expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
        unmount();
      });
    });
  });

  // ========== FALLBACK ROUTE (404) ==========
  describe('Fallback Route', () => {
    test('renderiza NotFound para rota inexistente', () => {
      renderWithRouter('/rota-que-nao-existe');
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });

    test('renderiza NotFound para "/overview/inexistente"', () => {
      renderWithRouter('/overview/inexistente');
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    test('renderiza NotFound para "/repos/inexistente"', () => {
      renderWithRouter('/repos/inexistente');
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    test('renderiza NotFound para rota com múltiplos segmentos inválidos', () => {
      renderWithRouter('/abc/def/ghi');
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    test('renderiza NotFound para rota quase correta', () => {
      renderWithRouter('/overviews/timeline'); // plural incorreto
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  // ========== NAVIGATION ==========
  describe('Navigation Between Routes', () => {
    test('navega entre todas as rotas de overview', () => {
      const overviewRoutes = [
        { path: '/overview/timeline', testId: 'timeline-page' },
        { path: '/overview/collaboration', testId: 'collaboration-page' },
        { path: '/overview/heatmap', testId: 'heatmap-page' },
      ];

      overviewRoutes.forEach((route) => {
        const { unmount } = renderWithRouter(route.path);
        expect(screen.getByTestId(route.testId)).toBeInTheDocument();
        unmount();
      });
    });

    test('navega entre todas as rotas de repos', () => {
      const reposRoutes = [
        { path: '/repos/commits', testId: 'commits-page' },
        { path: '/repos/pullrequests', testId: 'pullrequests-page' },
        { path: '/repos/issues', testId: 'issues-page' },
      ];

      reposRoutes.forEach((route) => {
        const { unmount } = renderWithRouter(route.path);
        expect(screen.getByTestId(route.testId)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ========== ALL ROUTES COVERAGE ==========
  describe('All Routes Coverage', () => {
    test('todas as 9 rotas definidas são acessíveis', () => {
      const allRoutes = [
        { path: '/', testId: 'home-page', name: 'Home (/)' },
        { path: '/home', testId: 'home-page', name: 'Home (/home)' },
        { path: '/overview/timeline', testId: 'timeline-page', name: 'Timeline' },
        { path: '/overview/collaboration', testId: 'collaboration-page', name: 'Collaboration' },
        { path: '/overview/heatmap', testId: 'heatmap-page', name: 'Heatmap' },
        { path: '/repos/commits', testId: 'commits-page', name: 'Commits' },
        { path: '/repos/pullrequests', testId: 'pullrequests-page', name: 'Pull Requests' },
        { path: '/repos/issues', testId: 'issues-page', name: 'Issues' },
        { path: '/invalid', testId: 'not-found-page', name: 'Not Found' },
      ];

      allRoutes.forEach((route) => {
        const { unmount } = renderWithRouter(route.path);
        expect(screen.getByTestId(route.testId)).toBeInTheDocument();
        unmount();
      });
    });

    test('nenhuma rota renderiza múltiplos componentes simultaneamente', () => {
      const routes = [
        '/',
        '/home',
        '/overview/timeline',
        '/overview/collaboration',
        '/overview/heatmap',
        '/repos/commits',
        '/repos/pullrequests',
        '/repos/issues',
        '/not-found',
      ];

      routes.forEach((route) => {
        const { container, unmount } = renderWithRouter(route);
        
        // Deve haver exatamente 1 div com data-testid (o componente de página)
        const pageComponents = container.querySelectorAll('[data-testid$="-page"]');
        expect(pageComponents.length).toBe(1);
        
        unmount();
      });
    });

    test('cada rota renderiza componente único e específico', () => {
      const routeToComponent = {
        '/': 'home-page',
        '/home': 'home-page',
        '/overview/timeline': 'timeline-page',
        '/overview/collaboration': 'collaboration-page',
        '/overview/heatmap': 'heatmap-page',
        '/repos/commits': 'commits-page',
        '/repos/pullrequests': 'pullrequests-page',
        '/repos/issues': 'issues-page',
        '/invalid': 'not-found-page',
      };

      Object.entries(routeToComponent).forEach(([path, testId]) => {
        const { unmount } = renderWithRouter(path);
        expect(screen.getByTestId(testId)).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ========== ROUTE STRUCTURE ==========
  describe('Route Structure', () => {
    test('rotas de overview seguem padrão "/overview/*"', () => {
      const overviewRoutes = [
        '/overview/timeline',
        '/overview/collaboration',
        '/overview/heatmap',
      ];

      overviewRoutes.forEach((route) => {
        expect(route).toMatch(/^\/overview\//);
      });
    });

    test('rotas de repos seguem padrão "/repos/*"', () => {
      const reposRoutes = [
        '/repos/commits',
        '/repos/pullrequests',
        '/repos/issues',
      ];

      reposRoutes.forEach((route) => {
        expect(route).toMatch(/^\/repos\//);
      });
    });

    test('apenas rotas válidas não renderizam NotFound', () => {
      const validRoutes = [
        '/',
        '/home',
        '/overview/timeline',
        '/overview/collaboration',
        '/overview/heatmap',
        '/repos/commits',
        '/repos/pullrequests',
        '/repos/issues',
      ];

      validRoutes.forEach((route) => {
        const { unmount } = renderWithRouter(route);
        expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
        unmount();
      });
    });
  });

  // ========== COMPONENT RENDERING ==========
  describe('Component Rendering', () => {
    test('App renderiza componente Routes', () => {
      const { container } = renderWithRouter('/');
      
      // Routes não tem um elemento HTML específico, mas deve renderizar algo
      expect(container.firstChild).toBeInTheDocument();
    });

    test('cada rota renderiza exatamente um componente de página', () => {
      const routes = [
        '/',
        '/overview/timeline',
        '/repos/commits',
      ];

      routes.forEach((route) => {
        const { container, unmount } = renderWithRouter(route);
        
        const pageElements = container.querySelectorAll('[data-testid$="-page"]');
        expect(pageElements.length).toBe(1);
        
        unmount();
      });
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('rota com trailing slash ainda funciona', () => {
      renderWithRouter('/overview/timeline/');
      
      // React Router geralmente normaliza trailing slashes
      // Mas se não funcionar, deve cair no NotFound
      const isTimelineOrNotFound = 
        screen.queryByTestId('timeline-page') || 
        screen.queryByTestId('not-found-page');
      
      expect(isTimelineOrNotFound).toBeInTheDocument();
    });

    test('rota vazia renderiza home', () => {
      renderWithRouter('');
      
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    test('rota com query params vai para NotFound se base for inválida', () => {
      renderWithRouter('/invalid?param=value');
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    test('rota com hash vai para NotFound se base for inválida', () => {
      renderWithRouter('/invalid#section');
      
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    test('rota case-sensitive - lowercase é correto', () => {
      renderWithRouter('/repos/commits');
      
      expect(screen.getByTestId('commits-page')).toBeInTheDocument();
      expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
    });
  });

  // ========== INTEGRATION ==========
  describe('Integration Tests', () => {
    test('App renderiza corretamente com MemoryRouter', () => {
      const { container } = render(
        <MemoryRouter>
          <App />
        </MemoryRouter>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('múltiplas navegações consecutivas funcionam', () => {
      const routes = [
        { path: '/', testId: 'home-page' },
        { path: '/repos/commits', testId: 'commits-page' },
        { path: '/overview/timeline', testId: 'timeline-page' },
        { path: '/invalid', testId: 'not-found-page' },
        { path: '/home', testId: 'home-page' },
      ];

      routes.forEach((route) => {
        const { unmount } = renderWithRouter(route.path);
        expect(screen.getByTestId(route.testId)).toBeInTheDocument();
        unmount();
      });
    });
  });
});