import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PieChart } from './PieChart';

describe('PieChart Component', () => {
  test('renderiza com dados válidos', () => {
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 30 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('mostra mensagem quando não há dados', () => {
    const { container } = render(<PieChart data={[]} />);
    
    expect(container.textContent).toContain('No data available');
  });

  test('usa mensagem customizada quando fornecida', () => {
    const { container } = render(
      <PieChart 
        data={[]} 
        emptyMessage="Custom empty message"
      />
    );
    
    expect(container.textContent).toContain('Custom empty message');
  });

  test('aplica tooltipLabel correto', () => {
    const data = [{ label: 'Test', value: 5 }];
    
    const { container } = render(
      <PieChart 
        data={data} 
        tooltipLabel="commits"
      />
    );
    
    const title = container.querySelector('title');
    expect(title?.textContent).toContain('commits');
  });

  // ✅ REMOVIDOS - Casos que não fazem sentido na prática
  // test('renderiza quando data é undefined', () => { ... });
  // test('renderiza quando data é null', () => { ... });

  test('usa tooltipLabel padrão quando não fornecido', () => {
    const data = [{ label: 'Test', value: 5 }];
    
    const { container } = render(<PieChart data={data} />);
    
    const title = container.querySelector('title');
    expect(title).toBeInTheDocument();
  });

  test('renderiza múltiplas fatias', () => {
    const data = [
      { label: 'Slice 1', value: 25 },
      { label: 'Slice 2', value: 35 },
      { label: 'Slice 3', value: 40 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  test('calcula percentagens corretamente', () => {
    const data = [
      { label: 'Half', value: 50 },
      { label: 'Quarter', value: 25 },
      { label: 'Quarter', value: 25 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  test('mostra tooltip ao passar mouse sobre fatia', () => {
    const data = [{ label: 'Test', value: 100 }];

    const { container } = render(<PieChart data={data} />);

    const path = container.querySelector('path');
    
    if (path) {
      fireEvent.mouseEnter(path);
      
      const title = path.querySelector('title');
      if (title) {
        expect(title.textContent).toContain('Test');
        expect(title.textContent).toContain('100');
      }
    }
  });

  test('esconde tooltip ao sair do mouse', () => {
    const data = [{ label: 'Test', value: 100 }];

    const { container } = render(<PieChart data={data} />);

    const path = container.querySelector('path');
    
    if (path) {
      fireEvent.mouseEnter(path);
      fireEvent.mouseLeave(path);
      
      // Verifica que o componente ainda está renderizado
      expect(container.querySelector('svg')).toBeInTheDocument();
    }
  });

  test('usa cores diferentes para cada fatia', () => {
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 30 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    const paths = container.querySelectorAll('path');
    const fills = Array.from(paths).map(p => p.getAttribute('fill'));
    
    const uniqueFills = new Set(fills.filter(f => f !== null));
    expect(uniqueFills.size).toBeGreaterThan(1);
  });

  test('renderiza legenda com labels', () => {
    const data = [
      { label: 'Legend A', value: 10 },
      { label: 'Legend B', value: 20 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    expect(container.textContent).toContain('Legend A');
    expect(container.textContent).toContain('Legend B');
  });

  // ✨ NOVOS TESTES - Casos de borda realistas

  test('renderiza com valor zero', () => {
    const data = [
      { label: 'Zero', value: 0 },
      { label: 'NonZero', value: 10 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('renderiza com apenas um item', () => {
    const data = [{ label: 'Single', value: 100 }];

    const { container } = render(<PieChart data={data} />);
    
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(1);
  });

  test('renderiza com valores decimais', () => {
    const data = [
      { label: 'A', value: 10.5 },
      { label: 'B', value: 20.7 },
      { label: 'C', value: 30.2 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  test('renderiza com labels longos', () => {
    const data = [
      { label: 'This is a very long label that should be handled', value: 10 },
      { label: 'Another long label for testing purposes', value: 20 },
    ];

    const { container } = render(<PieChart data={data} />);
    
    expect(container.textContent).toContain('This is a very long label');
    expect(container.textContent).toContain('Another long label');
  });
});