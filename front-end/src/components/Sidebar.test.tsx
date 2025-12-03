import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarProvider } from '../contexts/SidebarContext';

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper para renderizar com contexto
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SidebarProvider>{ui}</SidebarProvider>
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza o sidebar corretamente', () => {
      renderWithRouter(<Sidebar />);

      expect(screen.getByText('CoOps')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('renderiza o logo/ícone principal', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const brandIcon = container.querySelector('.text-xl');
      expect(brandIcon).toHaveTextContent('📊');
    });

    test('renderiza todos os itens de menu', () => {
      renderWithRouter(<Sidebar />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();
    });

    test('renderiza botão de home', () => {
      renderWithRouter(<Sidebar />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('renderiza botão de toggle', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toBeInTheDocument();
    });

    test('sidebar está aberto por padrão', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('w-46');
    });

    test('renderiza ícones dos itens de menu', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      const activitiesButton = screen.getByText('Activities').closest('button');

      expect(overviewButton).toContainHTML('📊');
      expect(activitiesButton).toContainHTML('💻');
    });
  });

  // ========== NAVEGAÇÃO ==========
  describe('Navegação', () => {
    test('navega para overview/timeline ao clicar em Overview', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      fireEvent.click(overviewButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/overview/timeline');
    });

    test('navega para repos/commits ao clicar em Activities', () => {
      renderWithRouter(<Sidebar />);

      const activitiesButton = screen.getByText('Activities').closest('button');
      fireEvent.click(activitiesButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/repos/commits');
    });

    test('navega para home ao clicar em Home', () => {
      renderWithRouter(<Sidebar />);

      const homeButton = screen.getByText('Home').closest('button');
      fireEvent.click(homeButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('múltiplos cliques navegam corretamente', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      const activitiesButton = screen.getByText('Activities').closest('button');

      fireEvent.click(overviewButton!);
      fireEvent.click(activitiesButton!);
      fireEvent.click(overviewButton!);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/overview/timeline');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/repos/commits');
      expect(mockNavigate).toHaveBeenNthCalledWith(3, '/overview/timeline');
    });
  });

  // ========== ESTADOS ATIVOS ==========
  describe('Estados Ativos', () => {
    test('marca overview como ativo', () => {
      renderWithRouter(<Sidebar currentPage="overview" />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveClass('text-blue-300');
      expect(overviewButton).toHaveClass('border-blue-500');
    });

    test('marca repos como ativo', () => {
      renderWithRouter(<Sidebar currentPage="repos" />);

      const activitiesButton = screen.getByText('Activities').closest('button');
      expect(activitiesButton).toHaveClass('text-blue-300');
      expect(activitiesButton).toHaveClass('border-blue-500');
    });

    test('nenhum item ativo quando currentPage não corresponde', () => {
      renderWithRouter(<Sidebar currentPage="unknown" />);

      const overviewButton = screen.getByText('Overview').closest('button');
      const activitiesButton = screen.getByText('Activities').closest('button');

      expect(overviewButton).not.toHaveClass('text-blue-300');
      expect(activitiesButton).not.toHaveClass('text-blue-300');
    });

    test('botão ativo tem background azul', () => {
      renderWithRouter(<Sidebar currentPage="overview" />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      });
    });

    test('botões inativos não têm classes de ativo', () => {
      renderWithRouter(<Sidebar currentPage="overview" />);

      const activitiesButton = screen.getByText('Activities').closest('button');
      expect(activitiesButton).not.toHaveClass('text-blue-300');
      expect(activitiesButton).not.toHaveClass('border-blue-500');
    });

    test('botão ativo tem border azul quando sidebar aberto', () => {
      renderWithRouter(<Sidebar currentPage="overview" />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveClass('border-l-2');
      expect(overviewButton).toHaveClass('border-blue-500');
    });
  });

  // ========== TOGGLE SIDEBAR ==========
  describe('Toggle Sidebar', () => {
    test('colapsa sidebar ao clicar no botão de toggle', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const aside = container.querySelector('aside');

      expect(aside).toHaveClass('w-46');

      fireEvent.click(toggleButton);

      expect(aside).toHaveClass('w-16');
    });

    test('expande sidebar ao clicar novamente no toggle', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const aside = container.querySelector('aside');

      fireEvent.click(toggleButton);
      expect(aside).toHaveClass('w-16');

      fireEvent.click(toggleButton);
      expect(aside).toHaveClass('w-46');
    });

    test('oculta textos quando sidebar está colapsado', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');

      expect(screen.getByText('CoOps')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(screen.queryByText('CoOps')).not.toBeInTheDocument();
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
      expect(screen.queryByText('Activities')).not.toBeInTheDocument();
    });

    test('mantém ícones visíveis quando colapsado', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);

      const brandIcon = container.querySelector('.text-xl');
      expect(brandIcon).toBeInTheDocument();
      expect(brandIcon).toHaveTextContent('📊');
    });

    test('muda label do botão toggle ao colapsar', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toHaveAttribute('title', 'Collapse');

      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-label', 'Expand sidebar');
      expect(toggleButton).toHaveAttribute('title', 'Expand');
    });

    test('ícone de seta rotaciona ao colapsar', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const svg = toggleButton.querySelector('svg');

      expect(svg).not.toHaveClass('rotate-180');

      fireEvent.click(toggleButton);

      expect(svg).toHaveClass('rotate-180');
    });

    test('botões se ajustam ao tamanho colapsado', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const overviewButton = screen.getByText('Overview').closest('button');

      expect(overviewButton).toHaveClass('justify-start');

      fireEvent.click(toggleButton);

      expect(overviewButton).toHaveClass('justify-center');
    });

    test('múltiplos toggles funcionam corretamente', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const aside = container.querySelector('aside');

      expect(aside).toHaveClass('w-46');

      fireEvent.click(toggleButton);
      expect(aside).toHaveClass('w-16');

      fireEvent.click(toggleButton);
      expect(aside).toHaveClass('w-46');

      fireEvent.click(toggleButton);
      expect(aside).toHaveClass('w-16');
    });
  });

  // ========== INTERAÇÕES DE HOVER ==========
  describe('Interações de Hover', () => {
    test('botão inativo muda cor ao passar mouse', () => {
      renderWithRouter(<Sidebar currentPage="overview" />);

      const activitiesButton = screen.getByText('Activities').closest('button')!;

      fireEvent.mouseEnter(activitiesButton);
      expect(activitiesButton).toHaveStyle({
        backgroundColor: '#333333',
      });

      fireEvent.mouseLeave(activitiesButton);
      expect(activitiesButton).toBeInTheDocument();
    });

    test('botão ativo muda tom ao passar mouse', () => {
      renderWithRouter(<Sidebar currentPage="overview" />);

      const overviewButton = screen.getByText('Overview').closest('button')!;

      fireEvent.mouseEnter(overviewButton);
      expect(overviewButton).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
      });

      fireEvent.mouseLeave(overviewButton);
      expect(overviewButton).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      });
    });

    test('botão home muda cor ao passar mouse', () => {
      renderWithRouter(<Sidebar />);

      const homeButton = screen.getByText('Home').closest('button')!;

      fireEvent.mouseEnter(homeButton);
      expect(homeButton).toHaveStyle({
        backgroundColor: '#333333',
      });

      fireEvent.mouseLeave(homeButton);
      expect(homeButton).toBeInTheDocument();
    });

    test('botão toggle muda cor ao passar mouse', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');

      fireEvent.mouseEnter(toggleButton);
      expect(toggleButton).toHaveStyle({
        backgroundColor: '#444444',
      });

      fireEvent.mouseLeave(toggleButton);
      expect(toggleButton).toHaveStyle({
        backgroundColor: '#333333',
      });
    });

    test('todos os botões de menu respondem ao hover', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button')!;
      const activitiesButton = screen.getByText('Activities').closest('button')!;

      fireEvent.mouseEnter(overviewButton);
      expect(overviewButton).toHaveStyle({
        backgroundColor: expect.any(String),
      });

      fireEvent.mouseEnter(activitiesButton);
      expect(activitiesButton).toHaveStyle({
        backgroundColor: expect.any(String),
      });
    });
  });

  // ========== ESTILIZAÇÃO ==========
  describe('Estilização', () => {
    test('tem background correto', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveStyle({
        backgroundColor: '#222222',
      });
    });

    test('tem border-right correto', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveStyle({
        borderRightColor: '#333333',
      });
    });

    test('footer tem border-top correto', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const footer = container.querySelector('.border-t-2');
      expect(footer).toHaveStyle({
        borderTopColor: '#333333',
      });
    });

    test('botão toggle tem background correto', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toHaveStyle({
        backgroundColor: '#333333',
      });
    });

    test('sidebar tem transição suave', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('transition-all');
      expect(aside).toHaveClass('duration-300');
      expect(aside).toHaveClass('ease-in-out');
    });

    test('sidebar tem altura completa', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('h-screen');
    });

    test('sidebar está posicionado fixo', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('fixed');
      expect(aside).toHaveClass('left-0');
      expect(aside).toHaveClass('top-0');
    });
  });

  // ========== TEXTO E TIPOGRAFIA ==========
  describe('Texto e Tipografia', () => {
    test('título tem tamanho e peso corretos', () => {
      renderWithRouter(<Sidebar />);

      const title = screen.getByText('CoOps');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-white');
    });

    test('labels dos botões têm tamanho correto', () => {
      renderWithRouter(<Sidebar />);

      const overviewLabel = screen.getByText('Overview');
      const activitiesLabel = screen.getByText('Activities');

      expect(overviewLabel).toHaveClass('text-sm');
      expect(activitiesLabel).toHaveClass('text-sm');
    });

    test('botão home tem cor de texto correta', () => {
      renderWithRouter(<Sidebar />);

      const homeButton = screen.getByText('Home').closest('button');
      expect(homeButton).toHaveClass('text-slate-400');
      expect(homeButton).toHaveClass('hover:text-white');
    });

    test('ícone do toggle tem cor correta', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const svg = toggleButton.querySelector('svg');

      expect(svg).toHaveClass('text-slate-300');
    });
  });

  // ========== LAYOUT ==========
  describe('Layout', () => {
    test('brand header tem altura e alinhamento corretos', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const header = container.querySelector('.h-18');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('gap-3');
    });

    test('nav tem espaçamento correto', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('p-1');
      expect(nav).toHaveClass('space-y-1');
      expect(nav).toHaveClass('flex-1');
    });

    test('footer tem padding correto', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const footer = container.querySelector('.border-t-2');
      expect(footer).toHaveClass('p-3');
      expect(footer).toHaveClass('space-y-2');
    });

    test('botões têm width full', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveClass('w-full');
    });

    test('botões têm padding correto', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveClass('px-3');
      expect(overviewButton).toHaveClass('py-2');
    });

    test('botão toggle tem tamanho correto', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toHaveClass('w-10');
      expect(toggleButton).toHaveClass('h-10');
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('todos os botões são clicáveis', () => {
      renderWithRouter(<Sidebar />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });

    test('botões têm texto visível quando expandido', () => {
      renderWithRouter(<Sidebar />);

      expect(screen.getByText('Overview')).toBeVisible();
      expect(screen.getByText('Activities')).toBeVisible();
      expect(screen.getByText('Home')).toBeVisible();
    });

    test('botão toggle tem aria-label', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    test('botão toggle tem title', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toHaveAttribute('title');
    });

    test('ícones são visíveis independente do estado do sidebar', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');

      // Sidebar expandido
      let brandIcon = container.querySelector('.text-xl');
      expect(brandIcon).toBeVisible();

      // Sidebar colapsado
      fireEvent.click(toggleButton);
      brandIcon = container.querySelector('.text-xl');
      expect(brandIcon).toBeVisible();
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('renderiza sem currentPage', () => {
      renderWithRouter(<Sidebar />);

      expect(screen.getByText('CoOps')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    test('renderiza com currentPage undefined', () => {
      renderWithRouter(<Sidebar currentPage={undefined} />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).not.toHaveClass('text-blue-300');
    });

    test('renderiza com currentPage vazio', () => {
      renderWithRouter(<Sidebar currentPage="" />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).not.toHaveClass('text-blue-300');
    });

    test('cliques rápidos no toggle funcionam corretamente', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const aside = container.querySelector('aside');

      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);

      expect(aside).toHaveClass('w-46');
    });

    test('cliques em diferentes botões de navegação', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      const activitiesButton = screen.getByText('Activities').closest('button');
      const homeButton = screen.getByText('Home').closest('button');

      fireEvent.click(overviewButton!);
      fireEvent.click(activitiesButton!);
      fireEvent.click(homeButton!);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    test('navegação funciona quando sidebar está colapsado', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);

      // Quando colapsado, não há texto "Overview", então pegamos pelo ícone
      const buttons = container.querySelectorAll('nav button');
      const overviewButton = buttons[0] as HTMLButtonElement;

      fireEvent.click(overviewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/overview/timeline');
    });
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('sidebar tem largura correta quando expandido', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('w-46');
    });

    test('sidebar tem largura correta quando colapsado', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('w-16');
    });

    test('nav tem overflow correto', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('overflow-y-auto');
    });
  });

  // ========== INTEGRAÇÃO COM CONTEXTO ==========
  describe('Integração com Contexto', () => {
    test('usa contexto do sidebar corretamente', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('w-46');
    });

    test('atualiza contexto ao clicar no toggle', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const aside = container.querySelector('aside');

      expect(aside).toHaveClass('w-46');

      fireEvent.click(toggleButton);

      expect(aside).toHaveClass('w-16');
    });
  });

  // ========== ANIMAÇÕES E TRANSIÇÕES ==========
  describe('Animações e Transições', () => {
    test('ícone de toggle tem transição', () => {
      renderWithRouter(<Sidebar />);

      const toggleButton = screen.getByLabelText('Collapse sidebar');
      const svg = toggleButton.querySelector('svg');

      expect(svg).toHaveClass('transition-transform');
    });

    test('botões têm transição de cores', () => {
      renderWithRouter(<Sidebar />);

      const overviewButton = screen.getByText('Overview').closest('button');
      expect(overviewButton).toHaveClass('transition-colors');
    });

    test('sidebar tem classes de transição', () => {
      const { container } = renderWithRouter(<Sidebar />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('transition-all');
      expect(aside).toHaveClass('duration-300');
      expect(aside).toHaveClass('ease-in-out');
    });
  });
});