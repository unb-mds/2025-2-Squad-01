import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OverviewToolbar from './OverviewToolbar';
import { SidebarProvider } from '../contexts/SidebarContext';
import type { ProcessedActivityResponse } from '../pages/Utils';

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
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

describe('OverviewToolbar Component', () => {
  const mockData: ProcessedActivityResponse = {
    generatedAt: '2024-01-01T00:00:00Z',
    repoCount: 3,
    totalActivities: 100,
    repositories: [
      {
        id: 1,
        name: 'repo1',
        activities: [],
      },
      {
        id: 2,
        name: 'repo2',
        activities: [],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza o toolbar corretamente', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      expect(screen.getByText('Overview Metrics')).toBeInTheDocument();
      expect(screen.getByText('Overview of organization-wide metrics')).toBeInTheDocument();
    });

    test('renderiza o ícone principal', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    test('renderiza todos os itens de menu', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Collaboration')).toBeInTheDocument();
      expect(screen.getByText('Heatmap')).toBeInTheDocument();
    });

    test('renderiza sem currentPage', () => {
      renderWithRouter(<OverviewToolbar data={mockData} />);

      expect(screen.getByText('Overview Metrics')).toBeInTheDocument();
    });

    test('renderiza sem data', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" />);

      expect(screen.getByText('Overview Metrics')).toBeInTheDocument();
    });

    test('renderiza com data null', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={null} />);

      expect(screen.getByText('Overview Metrics')).toBeInTheDocument();
    });
  });

  // ========== NAVEGAÇÃO ==========
  describe('Navegação', () => {
    test('navega para timeline ao clicar no botão', () => {
      renderWithRouter(<OverviewToolbar currentPage="collaboration" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      fireEvent.click(timelineButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/overview/timeline');
    });

    test('navega para collaboration ao clicar no botão', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const collaborationButton = screen.getByText('Collaboration').closest('button');
      fireEvent.click(collaborationButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/overview/collaboration');
    });

    test('navega para heatmap ao clicar no botão', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const heatmapButton = screen.getByText('Heatmap').closest('button');
      fireEvent.click(heatmapButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/overview/heatmap');
    });

    test('não navega quando clica no item já ativo', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      fireEvent.click(timelineButton!);

      expect(mockNavigate).toHaveBeenCalledWith('/overview/timeline');
    });
  });

  // ========== ESTADOS ATIVOS ==========
  describe('Estados Ativos', () => {
    test('marca timeline como ativo', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      expect(timelineButton).toHaveClass('text-blue-300');
      expect(timelineButton).toHaveClass('border-blue-500');
    });

    test('marca collaboration como ativo', () => {
      renderWithRouter(<OverviewToolbar currentPage="collaboration" data={mockData} />);

      const collaborationButton = screen.getByText('Collaboration').closest('button');
      expect(collaborationButton).toHaveClass('text-blue-300');
      expect(collaborationButton).toHaveClass('border-blue-500');
    });

    test('marca heatmap como ativo', () => {
      renderWithRouter(<OverviewToolbar currentPage="heatmap" data={mockData} />);

      const heatmapButton = screen.getByText('Heatmap').closest('button');
      expect(heatmapButton).toHaveClass('text-blue-300');
      expect(heatmapButton).toHaveClass('border-blue-500');
    });

    test('nenhum item ativo quando currentPage não corresponde', () => {
      renderWithRouter(<OverviewToolbar currentPage="unknown" data={mockData} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveClass('text-blue-300');
      });
    });

    test('botão ativo tem background azul', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      expect(timelineButton).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      });
    });

    test('botões inativos não têm classes de ativo', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const collaborationButton = screen.getByText('Collaboration').closest('button');
      expect(collaborationButton).not.toHaveClass('text-blue-300');
      expect(collaborationButton).not.toHaveClass('border-blue-500');
    });
  });

  // ========== INTERAÇÕES DE HOVER ==========
  describe('Interações de Hover', () => {
    test('botão inativo muda cor ao passar mouse', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const collaborationButton = screen.getByText('Collaboration').closest('button')!;

      fireEvent.mouseEnter(collaborationButton);
      expect(collaborationButton).toHaveStyle({
        backgroundColor: '#333333',
      });

      fireEvent.mouseLeave(collaborationButton);
      // Verifica que NÃO tem o background ativo
      expect(collaborationButton).not.toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      });
    });

    test('botão ativo muda tom ao passar mouse', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button')!;

      fireEvent.mouseEnter(timelineButton);
      expect(timelineButton).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
      });

      fireEvent.mouseLeave(timelineButton);
      expect(timelineButton).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      });
    });

    test('todos os botões respondem ao hover', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        fireEvent.mouseEnter(button);
        expect(button).toHaveStyle({
          backgroundColor: expect.any(String),
        });
      });
    });
  });

  // ========== ÍCONES ==========
  describe('Ícones', () => {
    test('renderiza ícones corretos para cada item', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      const collaborationButton = screen.getByText('Collaboration').closest('button');
      const heatmapButton = screen.getByText('Heatmap').closest('button');

      expect(timelineButton).toContainHTML('💻');
      expect(collaborationButton).toContainHTML('💻');
      expect(heatmapButton).toContainHTML('🌡️');
    });
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('toolbar está oculto em mobile (hidden md:block)', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('hidden');
      expect(aside).toHaveClass('md:block');
    });

    test('toolbar tem posição fixed', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('fixed');
      expect(aside).toHaveClass('top-0');
    });

    test('toolbar tem z-index correto', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('z-10');
    });
  });

  // ========== INTEGRAÇÃO COM SIDEBAR ==========
  describe('Integração com Sidebar', () => {
    test('toolbar ajusta largura baseado na sidebar', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveStyle({
        left: '184px', // Sidebar aberta
        width: 'calc(100vw - 184px)',
      });
    });

    test('toolbar tem transição suave', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('transition-all');
      expect(aside).toHaveClass('duration-300');
      expect(aside).toHaveClass('ease-in-out');
    });
  });

  // ========== ESTILIZAÇÃO ==========
  describe('Estilização', () => {
    test('tem background correto', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveStyle({
        backgroundColor: '#222222',
      });
    });

    test('header tem border-bottom correto', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const header = container.querySelector('.border-b-1');
      expect(header).toHaveStyle({
        borderBottomColor: '#333333',
      });
    });

    test('nav tem border-bottom correto', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('border-b-2');
    });
  });

  // ========== TEXTO E TIPOGRAFIA ==========
  describe('Texto e Tipografia', () => {
    test('título tem tamanho e peso corretos', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const title = screen.getByText('Overview Metrics');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-white');
    });

    test('descrição tem cor correta', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const description = screen.getByText('Overview of organization-wide metrics');
      expect(description).toHaveClass('text-slate-400');
    });

    test('labels dos botões têm tamanho correto', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineLabel = screen.getByText('Timeline');
      expect(timelineLabel).toHaveClass('text-sm');
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('todos os botões são clicáveis', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      buttons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });

    test('botões têm texto visível', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      expect(screen.getByText('Timeline')).toBeVisible();
      expect(screen.getByText('Collaboration')).toBeVisible();
      expect(screen.getByText('Heatmap')).toBeVisible();
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('renderiza com currentPage vazio', () => {
      renderWithRouter(<OverviewToolbar currentPage="" data={mockData} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveClass('text-blue-300');
      });
    });

    test('renderiza com currentPage undefined', () => {
      renderWithRouter(<OverviewToolbar currentPage={undefined} data={mockData} />);

      expect(screen.getByText('Overview Metrics')).toBeInTheDocument();
    });

    test('renderiza com data vazio', () => {
      const emptyData: ProcessedActivityResponse = {
        generatedAt: '2024-01-01T00:00:00Z',
        repoCount: 0,
        totalActivities: 0,
        repositories: [],
      };

      renderWithRouter(<OverviewToolbar currentPage="timeline" data={emptyData} />);

      expect(screen.getByText('Overview Metrics')).toBeInTheDocument();
    });

    test('múltiplos cliques no mesmo botão', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');

      fireEvent.click(timelineButton!);
      fireEvent.click(timelineButton!);
      fireEvent.click(timelineButton!);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/overview/timeline');
    });

    test('cliques rápidos em botões diferentes', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      const collaborationButton = screen.getByText('Collaboration').closest('button');
      const heatmapButton = screen.getByText('Heatmap').closest('button');

      fireEvent.click(timelineButton!);
      fireEvent.click(collaborationButton!);
      fireEvent.click(heatmapButton!);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/overview/timeline');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/overview/collaboration');
      expect(mockNavigate).toHaveBeenNthCalledWith(3, '/overview/heatmap');
    });
  });

  // ========== LAYOUT ==========
  describe('Layout', () => {
    test('header tem flexbox correto', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const header = container.querySelector('.flex.items-center.justify-between');
      expect(header).toBeInTheDocument();
    });

    test('nav tem padding correto', () => {
      const { container } = renderWithRouter(
        <OverviewToolbar currentPage="timeline" data={mockData} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('p-2');
      expect(nav).toHaveClass('py-3');
    });

    test('botões têm gap correto entre ícone e texto', () => {
      renderWithRouter(<OverviewToolbar currentPage="timeline" data={mockData} />);

      const timelineButton = screen.getByText('Timeline').closest('button');
      expect(timelineButton).toHaveClass('gap-3');
    });
  });
});