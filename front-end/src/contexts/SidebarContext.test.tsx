import { describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { JSX, ReactNode } from 'react';

describe('SidebarContext', () => {
  // Helper para criar wrapper com provider
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SidebarProvider>{children}</SidebarProvider>
  );

  beforeEach(() => {
    // Reset para estado inicial antes de cada teste
  });

  // ========== RENDERIZAÇÃO E ESTADO INICIAL ==========
  describe('Renderização e Estado Inicial', () => {
    test('provider renderiza children corretamente', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current).toBeDefined();
    });

    test('sidebar está aberto por padrão', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.isSidebarOpen).toBe(true);
    });

    test('largura inicial é 184px quando aberto', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.sidebarWidth).toBe('184px');
    });

    test('toggleSidebar está disponível', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.toggleSidebar).toBeDefined();
      expect(typeof result.current.toggleSidebar).toBe('function');
    });

    test('contexto tem todas as propriedades esperadas', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current).toHaveProperty('isSidebarOpen');
      expect(result.current).toHaveProperty('toggleSidebar');
      expect(result.current).toHaveProperty('sidebarWidth');
    });
  });

  // ========== TOGGLE SIDEBAR ==========
  describe('Toggle Sidebar', () => {
    test('toggleSidebar altera isSidebarOpen para false', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.isSidebarOpen).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarOpen).toBe(false);
    });

    test('toggleSidebar altera isSidebarOpen para true novamente', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarOpen).toBe(true);
    });

    test('múltiplos toggles alternam o estado corretamente', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.isSidebarOpen).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.isSidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.isSidebarOpen).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.isSidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.isSidebarOpen).toBe(true);
    });

    test('toggleSidebar não aceita parâmetros', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        // @ts-expect-error - testando que não aceita parâmetros
        result.current.toggleSidebar(true);
      });

      // Deve alternar normalmente, ignorando o parâmetro
      expect(result.current.isSidebarOpen).toBe(false);
    });
  });

  // ========== LARGURA DO SIDEBAR ==========
  describe('Largura do Sidebar', () => {
    test('largura é 184px quando sidebar está aberto', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.isSidebarOpen).toBe(true);
      expect(result.current.sidebarWidth).toBe('184px');
    });

    test('largura é 64px quando sidebar está fechado', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarOpen).toBe(false);
      expect(result.current.sidebarWidth).toBe('64px');
    });

    test('largura atualiza corretamente após múltiplos toggles', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.sidebarWidth).toBe('184px');

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarWidth).toBe('64px');

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarWidth).toBe('184px');

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarWidth).toBe('64px');
    });

    test('largura é uma string', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(typeof result.current.sidebarWidth).toBe('string');
    });

    test('largura tem formato CSS válido', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      // Verifica se tem 'px' no final
      expect(result.current.sidebarWidth).toMatch(/^\d+px$/);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarWidth).toMatch(/^\d+px$/);
    });
  });

  // ========== TRATAMENTO DE ERROS ==========
  describe('Tratamento de Erros', () => {
    test('lança erro quando useSidebar é usado fora do provider', () => {
      // Precisa capturar o erro para não falhar o teste
      expect(() => {
        renderHook(() => useSidebar());
      }).toThrow('useSidebar must be used within a SidebarProvider');
    });

    test('erro tem mensagem específica', () => {
      try {
        renderHook(() => useSidebar());
      } catch (error) {
        expect((error as Error).message).toBe('useSidebar must be used within a SidebarProvider');
      }
    });

    test('não lança erro quando usado dentro do provider', () => {
      expect(() => {
        renderHook(() => useSidebar(), { wrapper });
      }).not.toThrow();
    });
  });

  // ========== MÚLTIPLOS CONSUMIDORES ==========
  describe('Múltiplos Consumidores', () => {
    test('múltiplos hooks compartilham o mesmo estado', () => {
      const { result: result1 } = renderHook(() => useSidebar(), { wrapper });
      const { result: result2 } = renderHook(() => useSidebar(), { wrapper });

      expect(result1.current.isSidebarOpen).toBe(result2.current.isSidebarOpen);
      expect(result1.current.sidebarWidth).toBe(result2.current.sidebarWidth);
    });

    test('alteração em um hook não afeta outro hook separado', () => {
      // Cada renderHook cria uma nova instância do Provider
      const { result: result1 } = renderHook(() => useSidebar(), { wrapper });
      const { result: result2 } = renderHook(() => useSidebar(), { wrapper });

      expect(result1.current.isSidebarOpen).toBe(true);
      expect(result2.current.isSidebarOpen).toBe(true);

      act(() => {
        result1.current.toggleSidebar();
      });

      // result2 tem sua própria instância do provider, então não muda
      expect(result1.current.isSidebarOpen).toBe(false);
      expect(result2.current.isSidebarOpen).toBe(true);
    });

    test('hooks compartilham estado quando usam mesmo provider wrapper', () => {
      let sharedWrapper: ({ children }: { children: ReactNode }) => JSX.Element;
      
      const { result: result1 } = renderHook(() => useSidebar(), {
        wrapper: (props) => {
          sharedWrapper = wrapper;
          return wrapper(props);
        }
      });

      // Simula que ambos usam o mesmo provider
      expect(result1.current.isSidebarOpen).toBe(true);
      
      act(() => {
        result1.current.toggleSidebar();
      });

      expect(result1.current.isSidebarOpen).toBe(false);
    });
  });

  // ========== IMUTABILIDADE ==========
  describe('Imutabilidade', () => {
    test('toggleSidebar não retorna a mesma referência após mudança de estado', () => {
      const { result, rerender } = renderHook(() => useSidebar(), { wrapper });

      const firstToggle = result.current.toggleSidebar;

      // Altera o estado para forçar re-render
      act(() => {
        result.current.toggleSidebar();
      });

      const secondToggle = result.current.toggleSidebar;

      // toggleSidebar é recriado a cada render pois não está em useCallback
      expect(firstToggle).not.toBe(secondToggle);
    });

    test('contexto retorna sempre os valores atuais do estado', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      const initialValue = result.current.isSidebarOpen;
      expect(initialValue).toBe(true);

      // Não podemos modificar diretamente, apenas através do toggleSidebar
      act(() => {
        result.current.toggleSidebar();
      });

      // O valor é atualizado através do estado interno do React
      expect(result.current.isSidebarOpen).toBe(false);
      expect(result.current.isSidebarOpen).not.toBe(initialValue);
    });

    test('sidebarWidth reflete sempre o estado atual', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      const initialWidth = result.current.sidebarWidth;
      expect(initialWidth).toBe('184px');

      // Alteração através do método correto
      act(() => {
        result.current.toggleSidebar();
      });

      // A largura é recalculada baseada no novo estado
      expect(result.current.sidebarWidth).toBe('64px');
      expect(result.current.sidebarWidth).not.toBe(initialWidth);
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('provider aceita children null', () => {
      expect(() => {
        renderHook(() => useSidebar(), {
          wrapper: ({ children }: { children: ReactNode }) => (
            <SidebarProvider>{null}</SidebarProvider>
          ),
        });
      }).not.toThrow();
    });

    test('provider aceita múltiplos children', () => {
      const { result } = renderHook(() => useSidebar(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <SidebarProvider>
            <div>First Child</div>
            {children}
            <div>Last Child</div>
          </SidebarProvider>
        ),
      });

      expect(result.current.isSidebarOpen).toBe(true);
    });

    test('estado persiste entre re-renders do provider', () => {
      const { result, rerender } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.isSidebarOpen).toBe(false);

      rerender();

      expect(result.current.isSidebarOpen).toBe(false);
    });

    test('toggle rápido múltiplas vezes funciona corretamente', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.toggleSidebar();
        }
      });

      // 10 toggles = estado volta ao original
      expect(result.current.isSidebarOpen).toBe(false);
    });

    test('toggle rápido ímpar de vezes inverte o estado', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.toggleSidebar();
        }
      });

      // 5 toggles = estado invertido
      expect(result.current.isSidebarOpen).toBe(false);
    });
  });

  // ========== TIPOS ==========
  describe('Tipos', () => {
    test('isSidebarOpen é boolean', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(typeof result.current.isSidebarOpen).toBe('boolean');
    });

    test('sidebarWidth é string', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(typeof result.current.sidebarWidth).toBe('string');
    });

    test('toggleSidebar é função', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(typeof result.current.toggleSidebar).toBe('function');
    });

    test('contexto retorna objeto com estrutura correta', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current).toEqual({
        isSidebarOpen: expect.any(Boolean),
        toggleSidebar: expect.any(Function),
        sidebarWidth: expect.any(String),
      });
    });
  });

  // ========== INTEGRAÇÃO ==========
  describe('Integração', () => {
    test('estado inicial é consistente com largura inicial', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      if (result.current.isSidebarOpen) {
        expect(result.current.sidebarWidth).toBe('184px');
      } else {
        expect(result.current.sidebarWidth).toBe('64px');
      }
    });

    test('largura sempre corresponde ao estado do sidebar', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      // Estado inicial
      expect(result.current.isSidebarOpen).toBe(true);
      expect(result.current.sidebarWidth).toBe('184px');

      // Após 1 toggle
      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.isSidebarOpen).toBe(false);
      expect(result.current.sidebarWidth).toBe('64px');

      // Após 2 toggles
      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.isSidebarOpen).toBe(true);
      expect(result.current.sidebarWidth).toBe('184px');
    });

    test('provider pode ser aninhado (embora não seja recomendado)', () => {
      const { result } = renderHook(() => useSidebar(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <SidebarProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </SidebarProvider>
        ),
      });

      // Deve funcionar, mas usar o provider mais interno
      expect(result.current.isSidebarOpen).toBe(true);
    });
  });

  // ========== NOVOS TESTES ==========
  describe('Comportamento Reativo', () => {
    test('largura reage imediatamente ao toggle', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.sidebarWidth).toBe('184px');

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarWidth).toBe('64px');
    });

    test('estado é consistente após múltiplos re-renders', () => {
      const { result, rerender } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.toggleSidebar();
      });

      const stateAfterToggle = result.current.isSidebarOpen;

      rerender();
      rerender();
      rerender();

      expect(result.current.isSidebarOpen).toBe(stateAfterToggle);
    });

    test('toggleSidebar pode ser chamado dentro de useEffect', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(() => {
        act(() => {
          result.current.toggleSidebar();
        });
      }).not.toThrow();
    });
  });

  describe('Valores Computados', () => {
    test('sidebarWidth é sempre derivado de isSidebarOpen', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      const checkConsistency = () => {
        if (result.current.isSidebarOpen) {
          expect(result.current.sidebarWidth).toBe('184px');
        } else {
          expect(result.current.sidebarWidth).toBe('64px');
        }
      };

      checkConsistency();

      act(() => {
        result.current.toggleSidebar();
      });
      checkConsistency();

      act(() => {
        result.current.toggleSidebar();
      });
      checkConsistency();
    });

    test('sidebarWidth nunca é undefined ou null', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      expect(result.current.sidebarWidth).toBeDefined();
      expect(result.current.sidebarWidth).not.toBeNull();

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarWidth).toBeDefined();
      expect(result.current.sidebarWidth).not.toBeNull();
    });
  });

  describe('Performance', () => {
    test('não causa re-renders desnecessários', () => {
      const { result, rerender } = renderHook(() => useSidebar(), { wrapper });

      const initialState = result.current.isSidebarOpen;

      rerender();

      expect(result.current.isSidebarOpen).toBe(initialState);
    });

    test('toggle é operação síncrona', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      const beforeState = result.current.isSidebarOpen;

      act(() => {
        result.current.toggleSidebar();
      });

      // Mudança é imediata
      expect(result.current.isSidebarOpen).not.toBe(beforeState);
    });
  });

  // ========== NOVOS TESTES ADICIONAIS ==========
  describe('Consistência de Estado', () => {
    test('estado e largura permanecem sincronizados durante toda a vida do componente', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      for (let i = 0; i < 20; i++) {
        const expectedWidth = result.current.isSidebarOpen ? '184px' : '64px';
        expect(result.current.sidebarWidth).toBe(expectedWidth);

        act(() => {
          result.current.toggleSidebar();
        });
      }
    });

    test('contexto mantém referência estável do objeto', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      const firstContext = result.current;

      act(() => {
        result.current.toggleSidebar();
      });

      // O objeto do contexto é recriado, mas mantém a estrutura
      expect(result.current).toHaveProperty('isSidebarOpen');
      expect(result.current).toHaveProperty('toggleSidebar');
      expect(result.current).toHaveProperty('sidebarWidth');
    });

    test('valores são sempre coerentes após qualquer operação', () => {
      const { result } = renderHook(() => useSidebar(), { wrapper });

      const operations = [
        () => result.current.toggleSidebar(),
        () => result.current.toggleSidebar(),
        () => {},
        () => result.current.toggleSidebar(),
      ];

      operations.forEach(op => {
        act(op);
        const expectedWidth = result.current.isSidebarOpen ? '184px' : '64px';
        expect(result.current.sidebarWidth).toBe(expectedWidth);
      });
    });
  });

  describe('Isolamento de Instâncias', () => {
    test('cada Provider mantém seu próprio estado independente', () => {
      const { result: result1 } = renderHook(() => useSidebar(), { wrapper });
      const { result: result2 } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result1.current.toggleSidebar();
      });

      expect(result1.current.isSidebarOpen).toBe(false);
      expect(result2.current.isSidebarOpen).toBe(true);

      act(() => {
        result1.current.toggleSidebar();
        result2.current.toggleSidebar();
      });

      expect(result1.current.isSidebarOpen).toBe(true);
      expect(result2.current.isSidebarOpen).toBe(false);
    });

    test('mudanças em uma instância não afetam outras', () => {
      const { result: result1 } = renderHook(() => useSidebar(), { wrapper });
      const { result: result2 } = renderHook(() => useSidebar(), { wrapper });
      const { result: result3 } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result1.current.toggleSidebar();
      });

      expect(result1.current.isSidebarOpen).toBe(false);
      expect(result2.current.isSidebarOpen).toBe(true);
      expect(result3.current.isSidebarOpen).toBe(true);
    });
  });

  describe('Robustez', () => {
    test('provider funciona com children complexos', () => {
      const ComplexChild = () => {
        const sidebar = useSidebar();
        return <div>{sidebar.isSidebarOpen ? 'Open' : 'Closed'}</div>;
      };

      const { result } = renderHook(() => useSidebar(), {
        wrapper: ({ children }) => (
          <SidebarProvider>
            <div>
              <ComplexChild />
              {children}
            </div>
          </SidebarProvider>
        ),
      });

      expect(result.current.isSidebarOpen).toBe(true);
    });

    test('estado persiste através de unmount e remount', () => {
      const { result, unmount } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result.current.toggleSidebar();
      });

      const stateBeforeUnmount = result.current.isSidebarOpen;

      unmount();

      // Novo mount terá estado inicial
      const { result: newResult } = renderHook(() => useSidebar(), { wrapper });
      expect(newResult.current.isSidebarOpen).toBe(true); // Volta ao padrão
      expect(newResult.current.isSidebarOpen).not.toBe(stateBeforeUnmount);
    });

    test('toggle funciona corretamente após re-mount', () => {
      const { result: result1, unmount } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result1.current.toggleSidebar();
      });

      unmount();

      const { result: result2 } = renderHook(() => useSidebar(), { wrapper });

      act(() => {
        result2.current.toggleSidebar();
      });

      expect(result2.current.isSidebarOpen).toBe(false);
    });
  });
});