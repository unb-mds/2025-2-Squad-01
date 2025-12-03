import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';
import { SidebarProvider } from '../contexts/SidebarContext';

// Mock do DashboardLayout
vi.mock('../components/DashboardLayout', () => ({
  default: ({ children, currentPage }: any) => (
    <div data-testid="dashboard-layout" data-page={currentPage}>
      {children}
    </div>
  ),
}));

describe('NotFound Component', () => {
  const renderWithRouter = (initialPath: string = '/unknown-path') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <SidebarProvider>
          <NotFound />
        </SidebarProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza o componente', () => {
      renderWithRouter();
      
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    test('renderiza DashboardLayout', () => {
      renderWithRouter();
      
      const layout = screen.getByTestId('dashboard-layout');
      expect(layout).toBeInTheDocument();
    });

    test('DashboardLayout tem currentPage correto', () => {
      renderWithRouter();
      
      const layout = screen.getByTestId('dashboard-layout');
      expect(layout).toHaveAttribute('data-page', 'repos');
    });

    test('renderiza emoji de construção', () => {
      renderWithRouter();
      
      expect(screen.getByText('🚧')).toBeInTheDocument();
    });

    test('renderiza título principal', () => {
      renderWithRouter();
      
      const heading = screen.getByRole('heading', { name: /Page Not Found/i });
      expect(heading).toBeInTheDocument();
    });

    test('renderiza mensagem descritiva', () => {
      renderWithRouter();
      
      expect(screen.getByText(/is not available yet/i)).toBeInTheDocument();
    });

    test('renderiza mensagem sobre desenvolvimento', () => {
      renderWithRouter();
      
      expect(screen.getByText(/This feature is under development/i)).toBeInTheDocument();
    });

    test('renderiza dois botões de navegação', () => {
      renderWithRouter();
      
      expect(screen.getByText('View Commits')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });
  });

  // ========== PATHNAME DINÂMICO ==========
  describe('Pathname Dinâmico', () => {
    test('mostra pathname atual na mensagem', () => {
      renderWithRouter('/unknown-path');
      
      expect(screen.getByText('/unknown-path')).toBeInTheDocument();
    });

    test('mostra pathname diferente', () => {
      renderWithRouter('/some/nested/route');
      
      expect(screen.getByText('/some/nested/route')).toBeInTheDocument();
    });

    test('pathname tem estilo de código', () => {
      renderWithRouter('/test-path');
      
      const pathname = screen.getByText('/test-path');
      expect(pathname).toHaveClass('text-blue-400', 'font-mono');
    });

    test('pathname está dentro da mensagem', () => {
      renderWithRouter('/my-route');
      
      const message = screen.getByText(/The page/);
      const pathname = screen.getByText('/my-route');
      
      expect(message.parentElement).toContainElement(pathname);
    });

    test('pathname com caracteres especiais', () => {
      renderWithRouter('/path-with-123_special');
      
      expect(screen.getByText('/path-with-123_special')).toBeInTheDocument();
    });
  });

  // ========== LINKS DE NAVEGAÇÃO ==========
  describe('Links de Navegação', () => {
    test('link View Commits aponta para /repos/commits', () => {
      renderWithRouter();
      
      const link = screen.getByText('View Commits').closest('a');
      expect(link).toHaveAttribute('href', '/repos/commits');
    });

    test('link Go Home aponta para /', () => {
      renderWithRouter();
      
      const link = screen.getByText('Go Home').closest('a');
      expect(link).toHaveAttribute('href', '/');
    });

    test('View Commits é um Link do react-router', () => {
      renderWithRouter();
      
      const link = screen.getByText('View Commits').closest('a');
      expect(link).toBeInTheDocument();
    });

    test('Go Home é um Link do react-router', () => {
      renderWithRouter();
      
      const link = screen.getByText('Go Home').closest('a');
      expect(link).toBeInTheDocument();
    });
  });

  // ========== ESTILOS DOS BOTÕES ==========
  describe('Estilos dos Botões', () => {
    test('View Commits tem background azul', () => {
      renderWithRouter();
      
      const button = screen.getByText('View Commits');
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    test('Go Home tem background slate', () => {
      renderWithRouter();
      
      const button = screen.getByText('Go Home');
      expect(button).toHaveClass('bg-slate-700', 'hover:bg-slate-600');
    });

    test('ambos botões têm texto branco', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('text-white');
      expect(goHome).toHaveClass('text-white');
    });

    test('ambos botões têm border radius', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('rounded-lg');
      expect(goHome).toHaveClass('rounded-lg');
    });

    test('ambos botões têm padding consistente', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('px-6', 'py-3');
      expect(goHome).toHaveClass('px-6', 'py-3');
    });

    test('ambos botões têm transição', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('transition-colors');
      expect(goHome).toHaveClass('transition-colors');
    });

    test('ambos botões têm font-medium', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('font-medium');
      expect(goHome).toHaveClass('font-medium');
    });
  });

  // ========== LAYOUT E ESTRUTURA ==========
  describe('Layout e Estrutura', () => {
    test('container principal tem min-height', () => {
      renderWithRouter();
      
      const container = screen.getByText('Page Not Found').closest('.min-h-\\[60vh\\]');
      expect(container).toBeInTheDocument();
    });

    test('container principal está centralizado', () => {
      renderWithRouter();
      
      const container = screen.getByText('Page Not Found').closest('.flex');
      expect(container).toHaveClass('items-center', 'justify-center');
    });

    test('conteúdo tem max-width', () => {
      renderWithRouter();
      
      const content = screen.getByText('Page Not Found').closest('.max-w-md');
      expect(content).toBeInTheDocument();
    });

    test('conteúdo está centralizado', () => {
      renderWithRouter();
      
      const content = screen.getByText('Page Not Found').closest('.text-center');
      expect(content).toBeInTheDocument();
    });

    test('emoji tem margem bottom', () => {
      renderWithRouter();
      
      const emojiContainer = screen.getByText('🚧').parentElement;
      expect(emojiContainer).toHaveClass('mb-8');
    });

    test('emoji tem tamanho grande', () => {
      renderWithRouter();
      
      const emoji = screen.getByText('🚧');
      expect(emoji).toHaveClass('text-8xl');
    });
  });

  // ========== TIPOGRAFIA ==========
  describe('Tipografia', () => {
    test('título tem tamanho correto', () => {
      renderWithRouter();
      
      const heading = screen.getByRole('heading', { name: /Page Not Found/i });
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-white');
    });

    test('título tem margem bottom', () => {
      renderWithRouter();
      
      const heading = screen.getByRole('heading', { name: /Page Not Found/i });
      expect(heading).toHaveClass('mb-4');
    });

    test('mensagem principal tem estilo correto', () => {
      renderWithRouter();
      
      const message = screen.getByText(/The page/);
      expect(message).toHaveClass('text-slate-400', 'text-lg', 'mb-2');
    });

    test('mensagem de desenvolvimento tem estilo correto', () => {
      renderWithRouter();
      
      const devMessage = screen.getByText(/This feature is under development/);
      expect(devMessage).toHaveClass('text-slate-500', 'text-sm', 'mb-8');
    });
  });

  // ========== CONTAINER DE BOTÕES ==========
  describe('Container de Botões', () => {
    test('botões estão em flex container', () => {
      renderWithRouter();
      
      const buttonContainer = screen.getByText('View Commits').closest('.flex');
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    test('botões têm gap entre eles', () => {
      renderWithRouter();
      
      const buttonContainer = screen.getByText('View Commits').closest('.gap-4');
      expect(buttonContainer).toBeInTheDocument();
    });

    test('botões estão centralizados', () => {
      renderWithRouter();
      
      const buttonContainer = screen.getByText('View Commits').closest('.justify-center');
      expect(buttonContainer).toBeInTheDocument();
    });

    test('container de botões muda layout em mobile', () => {
      renderWithRouter();
      
      const buttonContainer = screen.getByText('View Commits').parentElement;
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  // ========== MENSAGENS ==========
  describe('Mensagens', () => {
    test('mensagem menciona "not available yet"', () => {
      renderWithRouter();
      
      expect(screen.getByText(/is not available yet/)).toBeInTheDocument();
    });

    test('mensagem menciona "under development"', () => {
      renderWithRouter();
      
      expect(screen.getByText(/under development/)).toBeInTheDocument();
    });

    test('mensagem menciona "future release"', () => {
      renderWithRouter();
      
      expect(screen.getByText(/future release/)).toBeInTheDocument();
    });

    test('mensagem principal está antes da secundária', () => {
      renderWithRouter();
      
      const messages = screen.getAllByText(/is not available yet|under development/);
      expect(messages.length).toBe(2);
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('tem heading principal', () => {
      renderWithRouter();
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    test('links são navegáveis por teclado', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits').closest('a');
      const goHome = screen.getByText('Go Home').closest('a');
      
      expect(viewCommits).toHaveAttribute('href');
      expect(goHome).toHaveAttribute('href');
    });

    test('texto é legível (contraste adequado)', () => {
      renderWithRouter();
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-white');
    });

    test('pathname destaca-se visualmente', () => {
      renderWithRouter('/test');
      
      const pathname = screen.getByText('/test');
      expect(pathname).toHaveClass('text-blue-400');
    });
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('botões empilham em mobile', () => {
      renderWithRouter();
      
      const container = screen.getByText('View Commits').parentElement;
      expect(container).toHaveClass('flex-col');
    });

    test('botões ficam lado a lado em sm+', () => {
      renderWithRouter();
      
      const container = screen.getByText('View Commits').parentElement;
      expect(container).toHaveClass('sm:flex-row');
    });

    test('conteúdo tem max-width para legibilidade', () => {
      renderWithRouter();
      
      const content = screen.getByText('Page Not Found').closest('.max-w-md');
      expect(content).toBeInTheDocument();
    });
  });

  // ========== INTEGRAÇÃO COM ROUTER ==========
  describe('Integração com Router', () => {
    test('usa useLocation corretamente', () => {
      renderWithRouter('/custom/path');
      
      expect(screen.getByText('/custom/path')).toBeInTheDocument();
    });

    test('Link componentes são do react-router-dom', () => {
      renderWithRouter();
      
      const viewCommitsLink = screen.getByText('View Commits').closest('a');
      const goHomeLink = screen.getByText('Go Home').closest('a');
      
      expect(viewCommitsLink?.getAttribute('href')).toBe('/repos/commits');
      expect(goHomeLink?.getAttribute('href')).toBe('/');
    });
  });

  // ========== CASOS EXTREMOS ==========
  describe('Casos Extremos', () => {
    test('pathname com barra final', () => {
      renderWithRouter('/path/with/trailing/');
      
      expect(screen.getByText('/path/with/trailing/')).toBeInTheDocument();
    });

    test('pathname raiz', () => {
      renderWithRouter('/');
      
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    test('pathname muito longo', () => {
      const longPath = '/very/long/path/with/many/segments/to/test/rendering';
      renderWithRouter(longPath);
      
      expect(screen.getByText(longPath)).toBeInTheDocument();
    });
  });

  // ========== CONTEÚDO VISUAL ==========
  describe('Conteúdo Visual', () => {
    test('emoji de construção está visível', () => {
      renderWithRouter();
      
      const emoji = screen.getByText('🚧');
      expect(emoji).toBeVisible();
    });

    test('todas as mensagens estão visíveis', () => {
      renderWithRouter();
      
      expect(screen.getByText('Page Not Found')).toBeVisible();
      expect(screen.getByText(/is not available yet/)).toBeVisible();
      expect(screen.getByText(/under development/)).toBeVisible();
    });

    test('ambos botões estão visíveis', () => {
      renderWithRouter();
      
      expect(screen.getByText('View Commits')).toBeVisible();
      expect(screen.getByText('Go Home')).toBeVisible();
    });
  });

  // ========== HIERARQUIA VISUAL ==========
  describe('Hierarquia Visual', () => {
    test('mensagens estão ordenadas corretamente', () => {
      renderWithRouter();
      
      const mainMessage = screen.getByText(/is not available yet/);
      const devMessage = screen.getByText(/under development/);
      
      expect(mainMessage.compareDocumentPosition(devMessage)).toBe(4); // DOCUMENT_POSITION_FOLLOWING
    });

    test('botões aparecem por último', () => {
      renderWithRouter();
      
      const devMessage = screen.getByText(/under development/);
      const button = screen.getByText('View Commits');
      
      expect(devMessage.compareDocumentPosition(button)).toBe(4); // DOCUMENT_POSITION_FOLLOWING
    });
  });

  // ========== ESPAÇAMENTOS ==========
  describe('Espaçamentos', () => {
    test('emoji tem espaçamento adequado', () => {
      renderWithRouter();
      
      const emojiContainer = screen.getByText('🚧').parentElement;
      expect(emojiContainer).toHaveClass('mb-8');
    });

    test('título tem espaçamento bottom', () => {
      renderWithRouter();
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('mb-4');
    });

    test('mensagem principal tem espaçamento pequeno', () => {
      renderWithRouter();
      
      const message = screen.getByText(/is not available yet/);
      expect(message).toHaveClass('mb-2');
    });

    test('mensagem de dev tem espaçamento maior', () => {
      renderWithRouter();
      
      const devMessage = screen.getByText(/under development/);
      expect(devMessage).toHaveClass('mb-8');
    });

    test('botões têm gap entre si', () => {
      renderWithRouter();
      
      const container = screen.getByText('View Commits').parentElement;
      expect(container).toHaveClass('gap-4');
    });
  });

  // ========== CONSISTÊNCIA DE DESIGN ==========
  describe('Consistência de Design', () => {
    test('usa cores do tema slate para textos secundários', () => {
      renderWithRouter();
      
      const mainMessage = screen.getByText(/is not available yet/);
      const devMessage = screen.getByText(/under development/);
      
      expect(mainMessage).toHaveClass('text-slate-400');
      expect(devMessage).toHaveClass('text-slate-500');
    });

    test('usa cor azul para destaque (pathname)', () => {
      renderWithRouter('/test');
      
      const pathname = screen.getByText('/test');
      expect(pathname).toHaveClass('text-blue-400');
    });

    test('botões usam cores consistentes com o tema', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('bg-blue-600');
      expect(goHome).toHaveClass('bg-slate-700');
    });
  });

  // ========== ESTADOS INTERATIVOS ==========
  describe('Estados Interativos', () => {
    test('View Commits tem estado hover', () => {
      renderWithRouter();
      
      const button = screen.getByText('View Commits');
      expect(button).toHaveClass('hover:bg-blue-700');
    });

    test('Go Home tem estado hover', () => {
      renderWithRouter();
      
      const button = screen.getByText('Go Home');
      expect(button).toHaveClass('hover:bg-slate-600');
    });

    test('botões têm transição suave', () => {
      renderWithRouter();
      
      const viewCommits = screen.getByText('View Commits');
      const goHome = screen.getByText('Go Home');
      
      expect(viewCommits).toHaveClass('transition-colors');
      expect(goHome).toHaveClass('transition-colors');
    });
  });
});