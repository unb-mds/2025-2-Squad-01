import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage Component', () => {
  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza título principal', () => {
      renderWithRouter();
      
      expect(screen.getByText(/Do overview/)).toBeInTheDocument();
      expect(screen.getByText(/ao detalhe/)).toBeInTheDocument();
      expect(screen.getByText(/em um clique/)).toBeInTheDocument();
    });

    test('renderiza subtítulo', () => {
      renderWithRouter();
      
      expect(screen.getByText(/Veja commits e colaboração por repositório ou organização/)).toBeInTheDocument();
    });

    test('renderiza texto descritivo', () => {
      renderWithRouter();
      
      expect(screen.getByText(/Selecione repositórios específicos ou visualize dados agregados da organização/)).toBeInTheDocument();
    });

    test('renderiza botão de call-to-action', () => {
      renderWithRouter();
      
      expect(screen.getByText('Ver Métricas')).toBeInTheDocument();
    });

    test('renderiza visualização SVG', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // ========== NAVEGAÇÃO ==========
  describe('Navegação', () => {
    test('botão Ver Métricas é um link', () => {
      renderWithRouter();
      
      const link = screen.getByText('Ver Métricas').closest('a');
      expect(link).toBeInTheDocument();
    });

    test('link aponta para /overview/timeline', () => {
      renderWithRouter();
      
      const link = screen.getByText('Ver Métricas').closest('a');
      expect(link).toHaveAttribute('href', '/overview/timeline');
    });

    test('link tem classe botao-principal', () => {
      renderWithRouter();
      
      const link = screen.getByText('Ver Métricas');
      expect(link).toHaveClass('botao-principal');
    });

    test('container do botão tem animação de hover', () => {
      renderWithRouter();
      
      const container = screen.getByText('Ver Métricas').closest('.hover\\:scale-105');
      expect(container).toBeInTheDocument();
    });
  });

  // ========== ESTRUTURA DO SVG ==========
  describe('Estrutura do SVG', () => {
    test('SVG tem dimensões corretas', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '540');
      expect(svg).toHaveAttribute('height', '320');
    });

    test('SVG tem viewBox correto', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 540 320');
    });

    test('SVG tem classes de animação', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('animate-fade-in-delayed-2');
    });

    test('SVG tem classe de hover', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('hover:scale-105');
    });

    test('SVG tem background rect', () => {
      renderWithRouter();
      
      const backgroundRect = document.querySelector('rect[width="540"][height="320"]');
      expect(backgroundRect).toBeInTheDocument();
    });
  });

  // ========== GRADIENTES ==========
  describe('Gradientes do SVG', () => {
    test('define gradient1', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient1');
      expect(gradient).toBeInTheDocument();
    });

    test('define gradient2', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient2');
      expect(gradient).toBeInTheDocument();
    });

    test('define gradient3', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient3');
      expect(gradient).toBeInTheDocument();
    });

    test('define gradient4', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient4');
      expect(gradient).toBeInTheDocument();
    });

    test('define gradient5', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient5');
      expect(gradient).toBeInTheDocument();
    });

    test('gradient1 tem stops corretos', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient1');
      const stops = gradient?.querySelectorAll('stop');
      expect(stops?.length).toBe(2);
    });

    test('gradient2 para background tem stops corretos', () => {
      renderWithRouter();
      
      const gradient = document.querySelector('#gradient2');
      const stops = gradient?.querySelectorAll('stop');
      expect(stops?.length).toBe(2);
    });
  });

  // ========== BARRAS DO GRÁFICO ==========
  describe('Barras do Gráfico', () => {
    test('renderiza 5 barras base', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('g[transform="translate(75,30)"] rect');
      expect(bars.length).toBe(5);
    });

    test('renderiza 5 barras com gradiente', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('g[transform="translate(40,30)"] rect[fill^="url(#gradient"]');
      expect(bars.length).toBeGreaterThanOrEqual(5);
    });

    test('primeira barra tem altura correta', () => {
      renderWithRouter();
      
      const bar = document.querySelector('g[transform="translate(75,30)"] rect[x="0"]');
      expect(bar).toHaveAttribute('height', '115');
    });

    test('segunda barra tem altura correta', () => {
      renderWithRouter();
      
      const bar = document.querySelector('g[transform="translate(75,30)"] rect[x="100"]');
      expect(bar).toHaveAttribute('height', '150');
    });

    test('terceira barra (mais alta) tem altura correta', () => {
      renderWithRouter();
      
      const bar = document.querySelector('g[transform="translate(75,30)"] rect[x="200"]');
      expect(bar).toHaveAttribute('height', '290');
    });

    test('barras têm largura uniforme', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('g[transform="translate(75,30)"] rect');
      bars.forEach(bar => {
        expect(bar).toHaveAttribute('width', '70');
      });
    });

    test('barras têm border radius', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('g[transform="translate(75,30)"] rect');
      bars.forEach(bar => {
        expect(bar).toHaveAttribute('rx', '6');
      });
    });

    test('barras têm delays de animação diferentes', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('g[transform="translate(75,30)"] rect');
      const delays = ['0ms', '120ms', '240ms', '360ms', '480ms'];
      
      bars.forEach((bar, index) => {
        const style = (bar as HTMLElement).style.animationDelay;
        expect(style).toBe(delays[index]);
      });
    });
  });

  // ========== LINHAS HORIZONTAIS ==========
  describe('Linhas Horizontais', () => {
    test('renderiza 6 linhas horizontais', () => {
      renderWithRouter();
      
      const lines = document.querySelectorAll('g[mask="url(#barMask)"] line');
      expect(lines.length).toBe(6);
    });

    test('linhas têm stroke correto', () => {
      renderWithRouter();
      
      const lines = document.querySelectorAll('g[mask="url(#barMask)"] line');
      lines.forEach(line => {
        expect(line).toHaveAttribute('stroke', '#64748b');
      });
    });

    test('linhas têm opacidades decrescentes', () => {
      renderWithRouter();
      
      const lines = document.querySelectorAll('g[mask="url(#barMask)"] line');
      const opacities = ['0.25', '0.22', '0.18', '0.13', '0.08', '0.04'];
      
      lines.forEach((line, index) => {
        expect(line).toHaveAttribute('opacity', opacities[index]);
      });
    });

    test('linhas estão posicionadas uniformemente', () => {
      renderWithRouter();
      
      const lines = document.querySelectorAll('g[mask="url(#barMask)"] line');
      const yPositions = ['50', '100', '150', '200', '250', '300'];
      
      lines.forEach((line, index) => {
        expect(line).toHaveAttribute('y1', yPositions[index]);
        expect(line).toHaveAttribute('y2', yPositions[index]);
      });
    });
  });

  // ========== MÁSCARA ==========
  describe('Máscara do Gráfico', () => {
    test('define máscara barMask', () => {
      renderWithRouter();
      
      const mask = document.querySelector('#barMask');
      expect(mask).toBeInTheDocument();
    });

    test('máscara tem retângulo branco base', () => {
      renderWithRouter();
      
      const whiteRect = document.querySelector('#barMask rect[fill="white"]');
      expect(whiteRect).toBeInTheDocument();
    });

    test('máscara tem 5 retângulos pretos (cutouts)', () => {
      renderWithRouter();
      
      const blackRects = document.querySelectorAll('#barMask rect[fill="black"]');
      expect(blackRects.length).toBe(5);
    });

    test('linhas aplicam máscara', () => {
      renderWithRouter();
      
      const maskedGroup = document.querySelector('g[mask="url(#barMask)"]');
      expect(maskedGroup).toBeInTheDocument();
    });
  });

  // ========== LINHA SOBREPOSTA ==========
  describe('Linha Sobreposta', () => {
    test('renderiza polyline', () => {
      renderWithRouter();
      
      const polyline = document.querySelector('polyline');
      expect(polyline).toBeInTheDocument();
    });

    test('polyline tem pontos corretos', () => {
      renderWithRouter();
      
      const polyline = document.querySelector('polyline');
      expect(polyline).toHaveAttribute('points', '35,205 135,115 235,35 335,185 435,265');
    });

    test('polyline tem cor branca', () => {
      renderWithRouter();
      
      const polyline = document.querySelector('polyline');
      expect(polyline).toHaveAttribute('stroke', '#ffffffff');
    });

    test('polyline não tem preenchimento', () => {
      renderWithRouter();
      
      const polyline = document.querySelector('polyline');
      expect(polyline).toHaveAttribute('fill', 'none');
    });

    test('renderiza 5 círculos na linha', () => {
      renderWithRouter();
      
      const circles = document.querySelectorAll('g[transform="translate(40,30)"] circle');
      expect(circles.length).toBe(5);
    });

    test('círculos têm raio correto', () => {
      renderWithRouter();
      
      const circles = document.querySelectorAll('g[transform="translate(40,30)"] circle');
      circles.forEach(circle => {
        expect(circle).toHaveAttribute('r', '5');
      });
    });

    test('círculos têm cor branca', () => {
      renderWithRouter();
      
      const circles = document.querySelectorAll('g[transform="translate(40,30)"] circle');
      circles.forEach(circle => {
        const fill = circle.getAttribute('fill');
        expect(fill).toContain('#ffffff');
      });
    });

    test('círculos estão nas posições corretas', () => {
      renderWithRouter();
      
      const circles = document.querySelectorAll('g[transform="translate(40,30)"] circle');
      const positions = [
        { cx: '35', cy: '205' },
        { cx: '135', cy: '115' },
        { cx: '235', cy: '35' },
        { cx: '335', cy: '185' },
        { cx: '435', cy: '265' },
      ];
      
      circles.forEach((circle, index) => {
        expect(circle).toHaveAttribute('cx', positions[index].cx);
        expect(circle).toHaveAttribute('cy', positions[index].cy);
      });
    });
  });

  // ========== LAYOUT E ESTILOS ==========
  describe('Layout e Estilos', () => {
    test('container principal tem background correto', () => {
      renderWithRouter();
      
      const main = document.querySelector('.min-h-screen');
      expect(main).toHaveStyle({ backgroundColor: '#181818' });
    });

    test('container principal tem classes corretas', () => {
      renderWithRouter();
      
      const main = document.querySelector('.min-h-screen');
      expect(main).toHaveClass('text-white', 'relative', 'overflow-hidden');
    });

    test('wrapper interno tem max-width', () => {
      renderWithRouter();
      
      const wrapper = document.querySelector('.max-w-6xl');
      expect(wrapper).toBeInTheDocument();
    });

    test('usa grid layout', () => {
      renderWithRouter();
      
      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
    });

    test('título principal tem tamanho correto', () => {
      renderWithRouter();
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveClass('text-7xl', 'font-bold');
    });

    test('subtítulo tem tamanho correto', () => {
      renderWithRouter();
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveClass('text-2xl', 'font-normal');
    });

    test('texto descritivo tem opacidade', () => {
      renderWithRouter();
      
      const description = screen.getByText(/Selecione repositórios específicos/);
      expect(description).toHaveClass('text-white/60');
    });

    test('container do SVG tem classes de centralização', () => {
      renderWithRouter();
      
      const svgContainer = document.querySelector('.grafico-container');
      expect(svgContainer).toHaveClass('flex', 'items-start', 'justify-center');
    });
  });

  // ========== ANIMAÇÕES ==========
  describe('Animações', () => {
    test('título principal tem animação fade-in', () => {
      renderWithRouter();
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveClass('animate-fade-in');
    });

    test('subtítulo tem animação delayed', () => {
      renderWithRouter();
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveClass('animate-fade-in-delayed');
    });

    test('seção de botões tem animação delayed-2', () => {
      renderWithRouter();
      
      const buttonSection = screen.getByText('Ver Métricas').closest('.animate-fade-in-delayed-2');
      expect(buttonSection).toBeInTheDocument();
    });

    test('SVG tem animação delayed-2', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('animate-fade-in-delayed-2');
    });

    test('barras têm classe de animação delayed-3', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('rect.animate-fade-in-delayed-3');
      expect(bars.length).toBeGreaterThan(0);
    });

    test('polyline tem classe de animação', () => {
      renderWithRouter();
      
      const polyline = document.querySelector('polyline');
      expect(polyline).toHaveClass('animate-fade-in-delayed-3');
    });

    test('círculos da linha têm classe de animação', () => {
      renderWithRouter();
      
      const circles = document.querySelectorAll('circle.animate-fade-in-delayed-3');
      expect(circles.length).toBe(5);
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('tem heading h1', () => {
      renderWithRouter();
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    test('tem heading h2', () => {
      renderWithRouter();
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
    });

    test('link é acessível por teclado', () => {
      renderWithRouter();
      
      const link = screen.getByText('Ver Métricas').closest('a');
      expect(link).toHaveAttribute('href');
    });

    test('SVG tem namespace correto', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    test('texto é legível (contraste adequado)', () => {
      renderWithRouter();
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveClass('text-gray-200');
    });
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('grid muda para 2 colunas em telas grandes', () => {
      renderWithRouter();
      
      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('lg:grid-cols-2');
    });

    test('botões podem empilhar em mobile', () => {
      renderWithRouter();
      
      const buttonContainer = screen.getByText('Ver Métricas').closest('.flex');
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    test('padding responsivo no wrapper', () => {
      renderWithRouter();
      
      const wrapper = document.querySelector('.px-6');
      expect(wrapper).toHaveClass('py-16');
    });

    test('container do SVG ajusta em mobile', () => {
      renderWithRouter();
      
      const svgContainer = document.querySelector('.grafico-container');
      expect(svgContainer).toHaveClass('mt-0');
    });
  });

  // ========== TRANSIÇÕES ==========
  describe('Transições', () => {
    test('container do botão tem transição de transform', () => {
      renderWithRouter();
      
      const container = screen.getByText('Ver Métricas').closest('.transition-transform');
      expect(container).toHaveClass('duration-200');
    });

    test('SVG tem transição de transform', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('transition-transform', 'duration-300');
    });

    test('hover aumenta escala do botão', () => {
      renderWithRouter();
      
      const container = screen.getByText('Ver Métricas').closest('.hover\\:scale-105');
      expect(container).toBeInTheDocument();
    });

    test('hover aumenta escala do SVG', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg.hover\\:scale-105');
      expect(svg).toBeInTheDocument();
    });
  });

  // ========== ELEMENTOS SVG ESPECÍFICOS ==========
  describe('Elementos SVG Específicos', () => {
    test('background rect usa gradient2', () => {
      renderWithRouter();
      
      const bgRect = document.querySelector('rect[fill="url(#gradient2)"]');
      expect(bgRect).toBeInTheDocument();
    });

    test('barras usam barGradientUniform', () => {
      renderWithRouter();
      
      const bars = document.querySelectorAll('rect[fill="url(#barGradientUniform)"]');
      expect(bars.length).toBe(5);
    });

    test('SVG tem border radius', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('rounded-md');
    });

    test('SVG tem z-index relativo', () => {
      renderWithRouter();
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveClass('relative', 'z-10');
    });

    test('grupos têm transforms corretos', () => {
      renderWithRouter();
      
      const group1 = document.querySelector('g[transform="translate(75,30)"]');
      const group2 = document.querySelector('g[transform="translate(40,30)"]');
      
      expect(group1).toBeInTheDocument();
      expect(group2).toBeInTheDocument();
    });
  });

  // ========== CONTEÚDO DE TEXTO ==========
  describe('Conteúdo de Texto', () => {
    test('texto principal contém palavras-chave', () => {
      renderWithRouter();
      
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
      expect(screen.getByText(/detalhe/i)).toBeInTheDocument();
      expect(screen.getByText(/clique/i)).toBeInTheDocument();
    });

    test('descrição menciona commits', () => {
      renderWithRouter();
      
      expect(screen.getByText(/commits/i)).toBeInTheDocument();
    });

    test('descrição menciona colaboração', () => {
      renderWithRouter();
      
      expect(screen.getByText(/colaboração/i)).toBeInTheDocument();
    });

    test('texto contém múltiplas menções a repositório', () => {
      renderWithRouter();
      
      const mentions = screen.getAllByText(/repositório/i);
      expect(mentions.length).toBeGreaterThanOrEqual(2);
    });

    test('texto contém múltiplas menções a organização', () => {
      renderWithRouter();
      
      const mentions = screen.getAllByText(/organização/i);
      expect(mentions.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ========== ESTRUTURA GERAL ==========
  describe('Estrutura Geral', () => {
    test('tem duas colunas principais', () => {
      renderWithRouter();
      
      const columns = document.querySelectorAll('.grid > div');
      expect(columns.length).toBe(2);
    });

    test('coluna esquerda contém texto', () => {
      renderWithRouter();
      
      const leftColumn = document.querySelector('.grid > div:first-child');
      expect(leftColumn?.textContent).toContain('Do overview');
    });

    test('coluna direita contém SVG', () => {
      renderWithRouter();
      
      const rightColumn = document.querySelector('.grid > div:last-child');
      const svg = rightColumn?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    test('página tem opacidade total', () => {
      renderWithRouter();
      
      const wrapper = document.querySelector('.opacity-100');
      expect(wrapper).toBeInTheDocument();
    });

    test('container principal é relativo', () => {
      renderWithRouter();
      
      const main = document.querySelector('.relative');
      expect(main).toBeInTheDocument();
    });
  });
});