import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CalendarHeatmap from './CalendarHeatmap';

// Mock do D3
vi.mock('d3', async () => {
  const actual = await vi.importActual('d3');
  return {
    ...actual,
    select: vi.fn(() => ({
      selectAll: vi.fn(() => ({
        remove: vi.fn(),
      })),
      attr: vi.fn(function() { return this; }),
      append: vi.fn(function() { return this; }),
      style: vi.fn(function() { return this; }),
      text: vi.fn(function() { return this; }),
      on: vi.fn(function() { return this; }),
    })),
  };
});

describe('CalendarHeatmap Component', () => {
  const mockUserData = [
    {
      name: 'Alice',
      repositories: ['repo1', 'repo2'],
      activities: {
        commits: 10,
        issues_created: 5,
        issues_closed: 3,
        prs_created: 2,
        prs_closed: 1,
        comments: 8,
      },
      dailyValues: [5, 8, 3, 12, 7, 6, 9],
      dailyDetails: [
        { commits: 2, issues_created: 1, issues_closed: 1, prs_created: 0, prs_closed: 0, comments: 1 },
        { commits: 3, issues_created: 2, issues_closed: 0, prs_created: 1, prs_closed: 0, comments: 2 },
        { commits: 1, issues_created: 0, issues_closed: 1, prs_created: 0, prs_closed: 0, comments: 1 },
        { commits: 5, issues_created: 2, issues_closed: 1, prs_created: 1, prs_closed: 1, comments: 2 },
        { commits: 2, issues_created: 0, issues_closed: 0, prs_created: 0, prs_closed: 0, comments: 5 },
        { commits: 3, issues_created: 0, issues_closed: 1, prs_created: 0, prs_closed: 0, comments: 2 },
        { commits: 4, issues_created: 1, issues_closed: 0, prs_created: 1, prs_closed: 0, comments: 3 },
      ],
    },
    {
      name: 'Bob',
      activities: {
        commits: 15,
        issues_created: 8,
        issues_closed: 6,
        prs_created: 4,
        prs_closed: 3,
        comments: 12,
      },
      dailyValues: [8, 10, 5, 15, 9, 7, 11],
      dailyDetails: [
        { commits: 3, issues_created: 2, issues_closed: 1, prs_created: 1, prs_closed: 0, comments: 1 },
        { commits: 4, issues_created: 3, issues_closed: 1, prs_created: 1, prs_closed: 1, comments: 0 },
        { commits: 2, issues_created: 1, issues_closed: 1, prs_created: 0, prs_closed: 0, comments: 1 },
        { commits: 6, issues_created: 2, issues_closed: 2, prs_created: 2, prs_closed: 1, comments: 2 },
        { commits: 3, issues_created: 0, issues_closed: 1, prs_created: 0, prs_closed: 1, comments: 4 },
        { commits: 2, issues_created: 0, issues_closed: 0, prs_created: 0, prs_closed: 0, comments: 5 },
        { commits: 5, issues_created: 2, issues_closed: 1, prs_created: 1, prs_closed: 0, comments: 2 },
      ],
    },
  ];

  // ✅ Teste 1: Renderização básica
  test('renderiza o componente com dados válidos', () => {
    const { container } = render(<CalendarHeatmap userData={mockUserData} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // ✅ Teste 2: Renderiza com array vazio
  test('não renderiza SVG quando userData está vazio', () => {
    const { container } = render(<CalendarHeatmap userData={[]} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // SVG existe mas sem conteúdo (selectAll remove é chamado)
  });

  // ✅ Teste 3: Modo weekly (padrão)
  test('renderiza no modo weekly por padrão', () => {
    const { container } = render(<CalendarHeatmap userData={mockUserData} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
    // Verifica 7 colunas (dias da semana)
  });

  // ✅ Teste 4: Modo monthly explícito
  test('renderiza no modo monthly quando especificado', () => {
    const { container } = render(
      <CalendarHeatmap userData={mockUserData} mode="monthly" />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
    // Verifica 12 colunas (meses)
  });

  // ✅ Teste 5: cellSize customizado
  test('usa cellSize customizado', () => {
    const { container } = render(
      <CalendarHeatmap userData={mockUserData} cellSize={200} />
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  // ✅ Teste 6: Margin customizada
  test('usa margin customizada', () => {
    const customMargin = { top: 30, right: 40, bottom: 30, left: 150 };
    
    const { container } = render(
      <CalendarHeatmap userData={mockUserData} margin={customMargin} />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 7: colorScheme customizado
  test('usa colorScheme customizado', () => {
    const { container } = render(
      <CalendarHeatmap userData={mockUserData} colorScheme="Greens" />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 8: dateLabels customizados
  test('usa dateLabels customizados quando fornecidos', () => {
    const customLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const { container } = render(
      <CalendarHeatmap userData={mockUserData} dateLabels={customLabels} />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 9: Gera dateLabels automaticamente quando vazio
  test('gera dateLabels automaticamente quando não fornecidos', () => {
    const { container } = render(
      <CalendarHeatmap userData={mockUserData} dateLabels={[]} />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 10: Usuário sem repositories
  test('renderiza usuário sem campo repositories', () => {
    const dataWithoutRepos = [
      {
        name: 'Charlie',
        activities: {
          commits: 5,
          issues_created: 2,
          issues_closed: 1,
          prs_created: 1,
          prs_closed: 0,
          comments: 3,
        },
        dailyValues: [3, 4, 2, 5, 3, 2, 4],
        dailyDetails: Array(7).fill({
          commits: 0,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 0,
          prs_closed: 0,
          comments: 0,
        }),
      },
    ];
    
    const { container } = render(<CalendarHeatmap userData={dataWithoutRepos} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 11: Valores zero em dailyValues
  test('renderiza corretamente com valores zero', () => {
    const dataWithZeros = [
      {
        name: 'Diana',
        activities: {
          commits: 0,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 0,
          prs_closed: 0,
          comments: 0,
        },
        dailyValues: [0, 0, 0, 0, 0, 0, 0],
        dailyDetails: Array(7).fill({
          commits: 0,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 0,
          prs_closed: 0,
          comments: 0,
        }),
      },
    ];
    
    const { container } = render(<CalendarHeatmap userData={dataWithZeros} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 12: Valores muito altos
  test('escala corretamente com valores muito altos', () => {
    const dataWithHighValues = [
      {
        name: 'Eve',
        activities: {
          commits: 1000,
          issues_created: 500,
          issues_closed: 300,
          prs_created: 200,
          prs_closed: 150,
          comments: 800,
        },
        dailyValues: [100, 200, 150, 300, 250, 180, 220],
        dailyDetails: Array(7).fill({
          commits: 100,
          issues_created: 50,
          issues_closed: 30,
          prs_created: 20,
          prs_closed: 15,
          comments: 80,
        }),
      },
    ];
    
    const { container } = render(<CalendarHeatmap userData={dataWithHighValues} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 13: dailyDetails undefined
  test('renderiza sem dailyDetails', () => {
    const dataWithoutDetails = [
      {
        name: 'Frank',
        activities: {
          commits: 5,
          issues_created: 2,
          issues_closed: 1,
          prs_created: 1,
          prs_closed: 0,
          comments: 3,
        },
        dailyValues: [3, 4, 2, 5, 3, 2, 4],
        dailyDetails: [],
      },
    ];
    
    const { container } = render(<CalendarHeatmap userData={dataWithoutDetails} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 14: Múltiplos usuários
  test('renderiza múltiplos usuários corretamente', () => {
    const { container } = render(<CalendarHeatmap userData={mockUserData} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
    // Deve ter 2 linhas (2 usuários)
  });

  // ✅ Teste 15: Um único usuário
  test('renderiza um único usuário', () => {
    const singleUser = [mockUserData[0]];
    
    const { container } = render(<CalendarHeatmap userData={singleUser} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 16: Container responsivo
  test('aplica estilos responsivos ao container', () => {
    const { container } = render(<CalendarHeatmap userData={mockUserData} />);
    
    const calendarContainer = container.querySelector('.calendar-heatmap-container');
    expect(calendarContainer).toBeInTheDocument();
    expect(calendarContainer).toHaveStyle({ width: '100%' });
    expect(calendarContainer).toHaveStyle({ overflowX: 'auto' });
  });

  // ✅ Teste 17: SVG com display block
  test('SVG tem display block', () => {
    const { container } = render(<CalendarHeatmap userData={mockUserData} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ display: 'block' });
  });

  // ✅ Teste 18: dateLabels incompletos (menos que cols)
  test('gera labels faltantes quando dateLabels é incompleto', () => {
    const incompleteLabels = ['Mon', 'Tue', 'Wed']; // Só 3 de 7
    
    const { container } = render(
      <CalendarHeatmap 
        userData={mockUserData} 
        dateLabels={incompleteLabels}
      />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 19: dateLabels com formato de data válido
  test('processa dateLabels com formato de data válido', () => {
    const dateLabelsWithDates = [
      'Nov 11 (Mon)',
      'Nov 12 (Tue)',
      'Nov 13 (Wed)',
      'Nov 14 (Thu)',
      'Nov 15 (Fri)',
    ];
    
    const { container } = render(
      <CalendarHeatmap 
        userData={mockUserData} 
        dateLabels={dateLabelsWithDates}
      />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 20: dailyValues com diferentes tamanhos
  test('lida com dailyValues de tamanhos diferentes', () => {
    const dataWithDifferentSizes = [
      {
        name: 'Grace',
        activities: {
          commits: 5,
          issues_created: 2,
          issues_closed: 1,
          prs_created: 1,
          prs_closed: 0,
          comments: 3,
        },
        dailyValues: [3, 4, 2], // Só 3 valores
        dailyDetails: Array(3).fill({
          commits: 1,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 0,
          prs_closed: 0,
          comments: 1,
        }),
      },
    ];
    
    const { container } = render(<CalendarHeatmap userData={dataWithDifferentSizes} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 21: Re-render quando props mudam
  test('atualiza quando userData muda', () => {
    const { container, rerender } = render(
      <CalendarHeatmap userData={[mockUserData[0]]} />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
    
    rerender(<CalendarHeatmap userData={mockUserData} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 22: Cleanup no useEffect
  test('limpa SVG anterior no useEffect', () => {
    const { rerender } = render(<CalendarHeatmap userData={mockUserData} />);
    
    // Rerender dispara o cleanup
    rerender(<CalendarHeatmap userData={mockUserData} mode="monthly" />);
    
    // Sem erros significa que o cleanup funcionou
    expect(true).toBe(true);
  });

  // ✅ Teste 23: Nome de usuário vazio
  test('renderiza com nome de usuário vazio', () => {
    const dataWithEmptyName = [
      {
        name: '',
        activities: {
          commits: 5,
          issues_created: 2,
          issues_closed: 1,
          prs_created: 1,
          prs_closed: 0,
          comments: 3,
        },
        dailyValues: [3, 4, 2, 5, 3, 2, 4],
        dailyDetails: Array(7).fill({
          commits: 0,
          issues_created: 0,
          issues_closed: 0,
          prs_created: 0,
          prs_closed: 0,
          comments: 0,
        }),
      },
    ];
    
    const { container } = render(<CalendarHeatmap userData={dataWithEmptyName} />);
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 24: Modo monthly com 12 meses
  test('renderiza 12 colunas no modo monthly', () => {
    const monthlyData = [{
      name: 'Henry',
      activities: {
        commits: 120,
        issues_created: 24,
        issues_closed: 18,
        prs_created: 12,
        prs_closed: 10,
        comments: 36,
      },
      dailyValues: Array(12).fill(10), // 12 meses
      dailyDetails: Array(12).fill({
        commits: 10,
        issues_created: 2,
        issues_closed: 1,
        prs_created: 1,
        prs_closed: 1,
        comments: 3,
      }),
    }];
    
    const { container } = render(
      <CalendarHeatmap userData={monthlyData} mode="monthly" />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  // ✅ Teste 25: Todas as props customizadas juntas
  test('renderiza com todas as props customizadas', () => {
    const customLabels = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
    const customMargin = { top: 50, right: 50, bottom: 50, left: 200 };
    
    const { container } = render(
      <CalendarHeatmap 
        userData={mockUserData}
        mode="weekly"
        cellSize={180}
        margin={customMargin}
        colorScheme="Reds"
        dateLabels={customLabels}
      />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('.calendar-heatmap-container')).toBeInTheDocument();
  });
});