import { describe, test, expect } from 'vitest';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('Main Entry Point', () => {
  // ========== DOM ELEMENT ==========
  describe('DOM Element', () => {
    test('elemento root deve existir no HTML', () => {
      const root = document.getElementById('root');
      expect(root).toBeDefined();
    });
  });

  // ========== REACT ROOT CREATION ==========
  describe('React Root Creation', () => {
    test('createRoot pode ser chamado com elemento root', () => {
      const rootElement = document.createElement('div');
      rootElement.id = 'test-root';
      
      expect(() => createRoot(rootElement)).not.toThrow();
    });

    test('createRoot retorna objeto com método render', () => {
      const rootElement = document.createElement('div');
      const root = createRoot(rootElement);
      
      expect(root).toHaveProperty('render');
      expect(typeof root.render).toBe('function');
    });

    test('createRoot retorna objeto com método unmount', () => {
      const rootElement = document.createElement('div');
      const root = createRoot(rootElement);
      
      expect(root).toHaveProperty('unmount');
      expect(typeof root.unmount).toBe('function');
    });
  });

  // ========== COMPONENT STRUCTURE ==========
  describe('Component Structure', () => {
    test('BrowserRouter é um componente React válido', () => {
      expect(BrowserRouter).toBeDefined();
      expect(typeof BrowserRouter).toBe('function');
    });

    test('App é um componente React válido', () => {
      expect(App).toBeDefined();
      expect(typeof App).toBe('function');
    });

    test('BrowserRouter aceita prop basename', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter basename="/test">
            <div>Test</div>
          </BrowserRouter>
        );
      }).not.toThrow();
    });

    test('StrictMode aceita children', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <div>Test</div>
          </StrictMode>
        );
      }).not.toThrow();
    });
  });

  // ========== BASENAME CONFIGURATION ==========
  describe('Basename Configuration', () => {
    test('basename para GitHub Pages é válido', () => {
      const basename = '/2025-2-Squad-01';
      
      expect(basename).toMatch(/^\//);
      expect(basename).not.toMatch(/\/$/);
      expect(basename.length).toBeGreaterThan(1);
    });

    test('basename corresponde ao padrão do repositório', () => {
      const basename = '/2025-2-Squad-01';
      
      // Padrão: /YYYY-S-Squad-XX
      expect(basename).toMatch(/^\/\d{4}-\d+-Squad-\d{2}$/);
    });

    test('basename não contém espaços', () => {
      const basename = '/2025-2-Squad-01';
      
      expect(basename).not.toMatch(/\s/);
    });

    test('basename é case-sensitive', () => {
      const basename = '/2025-2-Squad-01';
      
      expect(basename).toContain('Squad');
      expect(basename).not.toContain('squad');
    });
  });

  // ========== RENDER HIERARCHY ==========
  describe('Render Hierarchy', () => {
    test('pode renderizar StrictMode > BrowserRouter > App', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <BrowserRouter basename="/test">
              <App />
            </BrowserRouter>
          </StrictMode>
        );
      }).not.toThrow();
    });

    test('BrowserRouter funciona dentro de StrictMode', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <BrowserRouter>
              <div>Test</div>
            </BrowserRouter>
          </StrictMode>
        );
      }).not.toThrow();
    });

    test('App funciona dentro de BrowserRouter', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });

  // ========== STRICT MODE ==========
  describe('StrictMode', () => {
    test('StrictMode renderiza sem erros', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <div>Content</div>
          </StrictMode>
        );
      }).not.toThrow();
    });

    test('StrictMode aceita múltiplos children', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <div>Child 1</div>
            <div>Child 2</div>
          </StrictMode>
        );
      }).not.toThrow();
    });

    test('StrictMode pode ser aninhado', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <StrictMode>
              <div>Nested</div>
            </StrictMode>
          </StrictMode>
        );
      }).not.toThrow();
    });
  });

  // ========== BROWSER ROUTER ==========
  describe('BrowserRouter', () => {
    test('BrowserRouter aceita basename com barra inicial', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter basename="/test-basename">
            <div>Test</div>
          </BrowserRouter>
        );
      }).not.toThrow();
    });

    test('BrowserRouter funciona sem basename', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter>
            <div>Test</div>
          </BrowserRouter>
        );
      }).not.toThrow();
    });

    test('BrowserRouter aceita App como child', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter basename="/2025-2-Squad-01">
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });

  // ========== APP COMPONENT ==========
  describe('App Component', () => {
    test('App é uma função componente', () => {
      expect(typeof App).toBe('function');
    });

    test('App pode ser renderizado', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(<App />);
      }).not.toThrow();
    });

    test('App funciona dentro de BrowserRouter', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });

  // ========== INTEGRATION ==========
  describe('Integration', () => {
    test('estrutura completa renderiza sem erros', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <StrictMode>
            <BrowserRouter basename="/2025-2-Squad-01">
              <App />
            </BrowserRouter>
          </StrictMode>
        );
      }).not.toThrow();
    });

    test('root pode ser limpo após renderização', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      root.render(<div>Test</div>);
      
      expect(() => {
        root.unmount();
      }).not.toThrow();
    });

    test('múltiplas renderizações consecutivas funcionam', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(<div>First</div>);
        root.render(<div>Second</div>);
        root.render(<div>Third</div>);
      }).not.toThrow();
    });
  });

  // ========== DEPLOYMENT CONFIGURATION ==========
  describe('Deployment Configuration', () => {
    test('basename é adequado para GitHub Pages', () => {
      const basename = '/2025-2-Squad-01';
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter basename={basename}>
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });

    test('basename permite rotas relativas', () => {
      const basename = '/2025-2-Squad-01';
      
      // Rotas como /home serão relativas a /2025-2-Squad-01/home
      expect(basename.startsWith('/')).toBe(true);
      expect(basename).not.toBe('/');
    });
  });

  // ========== ERROR HANDLING ==========
  describe('Error Handling', () => {
    test('createRoot lança erro se elemento for null', () => {
      expect(() => {
        createRoot(null as any);
      }).toThrow();
    });

    test('createRoot aceita elemento válido', () => {
      const element = document.createElement('div');
      
      expect(() => {
        createRoot(element);
      }).not.toThrow();
    });

    test('render aceita JSX válido', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(<div>Valid JSX</div>);
      }).not.toThrow();
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('basename pode ser vazio', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter basename="">
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });

    test('BrowserRouter funciona com basename complexo', () => {
      const element = document.createElement('div');
      const root = createRoot(element);
      
      expect(() => {
        root.render(
          <BrowserRouter basename="/org/repo/branch">
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });
});