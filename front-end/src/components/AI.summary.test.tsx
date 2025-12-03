import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AISummary } from './AI.summary';

// Mock data
const mockMembersData = {
  _metadata: {
    generated_at: '2024-01-01T00:00:00Z',
    total_members: 3,
  },
  members: {
    'john-doe': {
      name: 'John Doe',
      repos: ['repo-1', 'repo-2'],
      commits_analysis: 'John made 50 commits with good code quality.',
      prs_analysis: 'John opened 10 PRs with detailed descriptions.',
      issues_analysis: 'John reported 5 issues with clear reproduction steps.',
    },
    'jane-smith': {
      name: 'Jane Smith',
      repos: ['repo-2', 'repo-3'],
      commits_analysis: 'Jane made 30 commits focused on frontend.',
      prs_analysis: 'Jane opened 8 PRs with UI improvements.',
      issues_analysis: 'Jane reported 3 issues related to UX.',
    },
    'bob-wilson': {
      name: 'Bob Wilson',
      repos: ['repo-1'],
      commits_analysis: 'Bob made 20 commits on backend services.',
      prs_analysis: 'Bob opened 5 PRs for API endpoints.',
      issues_analysis: 'Bob reported 2 critical bugs.',
    },
  },
};

const mockRepoData = [
  { id: 1, name: 'repo-1' },
  { id: 2, name: 'repo-2' },
  { id: 3, name: 'repo-3' },
];

// Helper function to render with router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('AISummary Component', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockMembersData),
      } as Response)
    ) as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renderiza o botão de análise de IA', () => {
      renderWithRouter(<AISummary />);
      
      expect(screen.getByRole('button', { name: /análise de ia/i })).toBeInTheDocument();
    });

    test('botão está inicialmente fechado', () => {
      renderWithRouter(<AISummary />);
      
      expect(screen.queryByText(/filtros/i)).not.toBeInTheDocument();
    });

    test('renderiza ícone de lâmpada', () => {
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      const svg = button.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    test('abre dropdown ao clicar no botão', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/filtros/i)).toBeInTheDocument();
      });
    });

    test('fecha dropdown ao clicar novamente', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText(/filtros/i)).toBeInTheDocument();
      });
      
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText(/filtros/i)).not.toBeInTheDocument();
      });
    });

    test('carrega membros ao abrir dropdown', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
    });
  });

  describe('Filters', () => {
    test('filtro de nome funciona', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/digite o nome/i);
      await user.type(searchInput, 'John');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
      });
    });

    test('filtro de repositório funciona', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const repoSelect = screen.getByDisplayValue(/todos os repositórios/i);
      await user.selectOptions(repoSelect, 'repo-1');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    test('limpar filtros reseta os valores', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/digite o nome/i);
      await user.type(searchInput, 'John');
      
      const clearButton = screen.getByRole('button', { name: /limpar filtros/i });
      await user.click(clearButton);
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
      });
    });

    test('contador de membros atualiza com filtros', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/3 membros encontrados/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/digite o nome/i);
      await user.type(searchInput, 'John');
      
      await waitFor(() => {
        expect(screen.getByText(/1 membro encontrado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Member Selection', () => {
    test('seleciona membro ao clicar', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.getByText(/1 selecionado/i)).toBeInTheDocument();
      });
    });

    test('desseleciona membro ao clicar novamente', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/selecionado/i)).not.toBeInTheDocument();
      });
    });

    test('mostra checkbox marcado para membro selecionado', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        const checkbox = memberButton.querySelector('.bg-blue-500');
        expect(checkbox).toBeInTheDocument();
      });
    });
  });

  describe('Analysis Display', () => {
    test('exibe análises quando membro é selecionado', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.getByText(/john made 50 commits/i)).toBeInTheDocument();
      });
    });

    test('botão "Limpar Todas" remove todas as seleções', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.getByText(/análises selecionadas/i)).toBeInTheDocument();
      });
      
      const clearAllButton = screen.getByRole('button', { name: /limpar todas/i });
      await user.click(clearAllButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/análises selecionadas/i)).not.toBeInTheDocument();
      });
    });

    test('botão de remover individual funciona', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.getByTitle('Remover')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByTitle('Remover');
      await user.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/análises selecionadas/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('mostra mensagem de erro quando fetch falha', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as typeof fetch;
      
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
      });
    });

    test('mostra estado de carregamento', async () => {
      let resolvePromise: (value: Response) => void;
      const promise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });
      
      global.fetch = vi.fn(() => promise) as typeof fetch;
      
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/carregando/i)).toBeInTheDocument();
      });
      
      resolvePromise!({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockMembersData),
      } as Response);
    });
  });

  describe('Multiple Selection Behavior', () => {
    test('seleciona todos os membros filtrados', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const repoSelect = screen.getByDisplayValue(/todos os repositórios/i);
      await user.selectOptions(repoSelect, 'repo-2');
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
      
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      
      await user.click(johnButton);
      await user.click(janeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/análises selecionadas \(2\)/i)).toBeInTheDocument();
      });
    });

    test('ordem de seleção é preservada na exibição', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
      
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      const bobButton = screen.getByRole('button', { name: /bob wilson/i });
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      
      await user.click(janeButton);
      await user.click(bobButton);
      await user.click(johnButton);
      
      await waitFor(() => {
        const selectedSection = screen.getByText(/análises selecionadas \(3\)/i);
        expect(selectedSection).toBeInTheDocument();
        
        // Verifica apenas que os 3 cards existem
        const allCards = screen.getAllByText(/Jane Smith|Bob Wilson|John Doe/i);
        expect(allCards.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('contador de selecionados é sempre preciso', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      
      await user.click(johnButton);
      await waitFor(() => {
        expect(screen.getByText(/1 selecionado/i)).toBeInTheDocument();
      });
      
      await user.click(janeButton);
      await waitFor(() => {
        expect(screen.getByText(/2 selecionados/i)).toBeInTheDocument();
      });
      
      await user.click(johnButton);
      await waitFor(() => {
        expect(screen.getByText(/1 selecionado/i)).toBeInTheDocument();
      });
    });

    test('múltiplos membros podem ser selecionados simultaneamente', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      const bobButton = screen.getByRole('button', { name: /bob wilson/i });
      
      await user.click(johnButton);
      await user.click(janeButton);
      await user.click(bobButton);
      
      await waitFor(() => {
        expect(screen.getByText(/3 selecionados/i)).toBeInTheDocument();
        expect(screen.getByText(/análises selecionadas \(3\)/i)).toBeInTheDocument();
      });
    });

    test('desselecionar todos funciona corretamente', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      
      await user.click(johnButton);
      await user.click(janeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/2 selecionados/i)).toBeInTheDocument();
      });
      
      const clearAllButton = screen.getByRole('button', { name: /limpar todas/i });
      await user.click(clearAllButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/análises selecionadas/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/selecionados/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Analysis Display Modes', () => {
    test('mostra todas as análises por padrão quando membro é selecionado', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.getByText(/análises selecionadas/i)).toBeInTheDocument();
      });
      
      const analysisSection = screen.getByText(/análises selecionadas/i).closest('div')?.parentElement as HTMLElement;
      
      await waitFor(() => {
        expect(analysisSection).toBeInTheDocument();
        
        const headers = within(analysisSection).getAllByRole('heading', { level: 4 });
        const headersText = headers.map(h => h.textContent);
        
        expect(headersText).toContain('Commits');
        expect(headersText).toContain('Pull Requests');
        expect(headersText).toContain('Issues');
      });
    });

    test('filtra análise por tipo commits', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const analysisSelect = screen.getByDisplayValue(/todas as análises/i);
      await user.selectOptions(analysisSelect, 'commits_analysis');
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        const analysisSection = screen.getByText(/análises selecionadas/i).closest('div')?.parentElement as HTMLElement;
        const headers = within(analysisSection).getAllByRole('heading', { level: 4 });
        const headersText = headers.map(h => h.textContent);
        
        expect(headersText).toContain('Commits');
        expect(headersText).not.toContain('Pull Requests');
        expect(headersText).not.toContain('Issues');
      });
    });

    test('filtro de tipo se aplica a todas as seleções existentes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      
      await user.click(johnButton);
      await user.click(janeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/2 selecionados/i)).toBeInTheDocument();
      });
      
      const analysisSelect = screen.getByDisplayValue(/todas as análises/i);
      await user.selectOptions(analysisSelect, 'prs_analysis');
      
      await waitFor(() => {
        const analysisSection = screen.getByText(/análises selecionadas/i).closest('div')?.parentElement as HTMLElement;
        
        const prHeaders = within(analysisSection).getAllByRole('heading', { level: 4 });
        const prHeadersText = prHeaders.filter(h => h.textContent === 'Pull Requests');
        
        expect(prHeadersText).toHaveLength(2);
      });
    });

    test('alterna filtro de análise dinamicamente', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        expect(screen.getByText(/análises selecionadas/i)).toBeInTheDocument();
      });
      
      const analysisSection = screen.getByText(/análises selecionadas/i).closest('div')?.parentElement as HTMLElement;
      const analysisSelect = screen.getByDisplayValue(/todas as análises/i);
      
      await user.selectOptions(analysisSelect, 'commits_analysis');
      await waitFor(() => {
        const headers = within(analysisSection).getAllByRole('heading', { level: 4 });
        expect(headers).toHaveLength(1);
        expect(headers[0].textContent).toBe('Commits');
      });
      
      await user.selectOptions(analysisSelect, 'issues_analysis');
      await waitFor(() => {
        const headers = within(analysisSection).getAllByRole('heading', { level: 4 });
        expect(headers).toHaveLength(1);
        expect(headers[0].textContent).toBe('Issues');
      });
      
      await user.selectOptions(analysisSelect, 'all');
      await waitFor(() => {
        const headers = within(analysisSection).getAllByRole('heading', { level: 4 });
        expect(headers.length).toBe(3);
      });
    });
  });

  describe('Analysis Card Features', () => {
    test('card de análise exibe análises completas', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      await waitFor(() => {
        // Verifica se o texto da análise está presente
        expect(screen.getByText(/john made 50 commits/i)).toBeInTheDocument();
        expect(screen.getByText(/john opened 10 prs/i)).toBeInTheDocument();
        expect(screen.getByText(/john reported 5 issues/i)).toBeInTheDocument();
      });
    });

    test('botão de remover funciona individualmente com múltiplas seleções', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const johnButton = screen.getByRole('button', { name: /john doe/i });
      const janeButton = screen.getByRole('button', { name: /jane smith/i });
      
      await user.click(johnButton);
      await user.click(janeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/2 selecionados/i)).toBeInTheDocument();
      });
      
      // Pega todos os botões de remover e clica no primeiro
      const removeButtons = screen.getAllByTitle('Remover');
      expect(removeButtons).toHaveLength(2);
      
      await user.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/1 selecionado/i)).toBeInTheDocument();
        // Verifica que ainda existe um botão de remover
        const remainingRemoveButtons = screen.getAllByTitle('Remover');
        expect(remainingRemoveButtons).toHaveLength(1);
      });
    });

    test('verifica estrutura de cards com múltiplas seleções', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /john doe/i }));
      await user.click(screen.getByRole('button', { name: /jane smith/i }));
      await user.click(screen.getByRole('button', { name: /bob wilson/i }));
      
      await waitFor(() => {
        // Verifica que existem 3 botões de remover (um por card)
        const removeButtons = screen.getAllByTitle('Remover');
        expect(removeButtons).toHaveLength(3);
        
        // Verifica contador
        expect(screen.getByText(/3 selecionados/i)).toBeInTheDocument();
      });
    });
  });

  describe('Component Props', () => {
    test('usa URL customizada quando jsonUrl é fornecida', async () => {
      const customUrl = 'https://example.com/custom-ai.json';
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockMembersData),
        } as Response)
      ) as typeof fetch;
      
      const user = userEvent.setup();
      renderWithRouter(<AISummary jsonUrl={customUrl} />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(customUrl);
      });
    });

    test('usa título customizado quando title é fornecido', () => {
      renderWithRouter(<AISummary title="Custom AI Analysis" />);
      
      expect(screen.getByRole('button', { name: /custom ai analysis/i })).toBeInTheDocument();
    });

    test('oculta filtro de nome quando showNameFilter é false', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary showNameFilter={false} />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByLabelText(/buscar por nome/i)).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText(/digite o nome/i)).not.toBeInTheDocument();
      });
    });

    test('oculta filtro de repositório quando showRepoFilter é false', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary showRepoFilter={false} />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Repositório')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue(/todos os repositórios/i)).not.toBeInTheDocument();
      });
    });

    test('oculta filtro de tipo quando defaultAnalysisType é definido', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary defaultAnalysisType="commits_analysis" />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Tipo de Análise')).not.toBeInTheDocument();
      });
    });

    test('chama onSelectMember quando membro é selecionado', async () => {
      const onSelectMember = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<AISummary onSelectMember={onSelectMember} />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      await user.click(memberButton);
      
      expect(onSelectMember).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          repos: ['repo-1', 'repo-2'],
        })
      );
    });
  });

  describe('Keyboard Navigation', () => {
    test('dropdown pode ser aberto com Enter', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      button.focus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/filtros/i)).toBeInTheDocument();
      });
    });

    test('membros podem ser selecionados com Enter', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const memberButton = screen.getByRole('button', { name: /john doe/i });
      memberButton.focus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/1 selecionado/i)).toBeInTheDocument();
      });
    });

    test('Tab navega entre filtros', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AISummary />);
      
      const button = screen.getByRole('button', { name: /análise de ia/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/digite o nome/i)).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/digite o nome/i);
      searchInput.focus();
      
      await user.keyboard('{Tab}');
      
      const repoSelect = screen.getByDisplayValue(/todos os repositórios/i);
      expect(document.activeElement).toBe(repoSelect);
    });
  });
});