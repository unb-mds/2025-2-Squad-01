import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DocumentacaoPage from './Documentacao';

describe('DocumentacaoPage Component', () => {
  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <DocumentacaoPage />
      </BrowserRouter>
    );
  };

  // ========== RENDERIZAÇÃO BÁSICA ==========
  describe('Renderização Básica', () => {
    test('renderiza o título principal', () => {
      renderWithRouter();
      expect(screen.getByText('CoOps – Métricas GitHub')).toBeInTheDocument();
    });

    test('renderiza a descrição do projeto', () => {
      renderWithRouter();
      expect(screen.getByText(/Visualização, análise e explicação de métricas/)).toBeInTheDocument();
    });

    test('renderiza o link de voltar ao início', () => {
      renderWithRouter();
      const backLink = screen.getByText('← Voltar ao início');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });

    test('renderiza o botão final de explorar métricas', () => {
      renderWithRouter();
      const exploreButton = screen.getByText('🚀 Explorar Métricas →');
      expect(exploreButton).toBeInTheDocument();
      expect(exploreButton.closest('a')).toHaveAttribute('href', '/commits');
    });

    test('renderiza com classes CSS corretas no container principal', () => {
      renderWithRouter();
      const container = screen.getByText('CoOps – Métricas GitHub').closest('.doc-page');
      expect(container).toHaveClass('min-h-screen', 'bg-black', 'text-white');
    });
  });

  // ========== NAVEGAÇÃO ==========
  describe('Navegação', () => {
    test('renderiza todos os links de navegação', () => {
      renderWithRouter();
      const introducaoElements = screen.getAllByText('Introdução');
      expect(introducaoElements.length).toBeGreaterThanOrEqual(1);
      
      const equipeElements = screen.getAllByText('Equipe');
      expect(equipeElements.length).toBeGreaterThanOrEqual(1);
      
      expect(screen.getByText('Tecnologias')).toBeInTheDocument();
      expect(screen.getByText('Arquitetura')).toBeInTheDocument();
      expect(screen.getByText('Requisitos')).toBeInTheDocument();
      expect(screen.getByText('User Stories')).toBeInTheDocument();
      expect(screen.getByText('Protótipos')).toBeInTheDocument();
      expect(screen.getByText('Documentos')).toBeInTheDocument();
    });
  });

  // ========== SEÇÃO INTRODUÇÃO ==========
  describe('Seção Introdução', () => {
    test('renderiza conteúdo da introdução', () => {
      renderWithRouter();
      expect(screen.getByText(/O projeto CoOps foi desenvolvido/)).toBeInTheDocument();
      expect(screen.getByText(/Métodos de Desenvolvimento de Software/)).toBeInTheDocument();
    });

    test('seção introdução tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('intro');
      expect(section).toBeInTheDocument();
    });
  });

  // ========== SEÇÃO EQUIPE ==========
  describe('Seção Equipe', () => {
    test('renderiza informações do Scrum Master', () => {
      renderWithRouter();
      expect(screen.getByText('Scrum Master:')).toBeInTheDocument();
      expect(screen.getByText('Pedro Druck')).toBeInTheDocument();
    });

    test('renderiza informações do Product Owner', () => {
      renderWithRouter();
      expect(screen.getByText('Product Owner (PO):')).toBeInTheDocument();
      expect(screen.getByText('Marcos Antonio')).toBeInTheDocument();
    });

    test('renderiza time de desenvolvimento', () => {
      renderWithRouter();
      expect(screen.getByText('Time de Desenvolvimento:')).toBeInTheDocument();
      expect(screen.getByText(/Gustavo, Pedro Rocha, Carlos, Heitor/)).toBeInTheDocument();
    });

    test('seção equipe tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('team');
      expect(section).toBeInTheDocument();
    });

    test('renderiza indicadores coloridos para cada papel', () => {
      renderWithRouter();
      const teamSection = document.getElementById('team');
      const colorDots = teamSection?.querySelectorAll('.w-3.h-3.rounded-full');
      expect(colorDots?.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ========== SEÇÃO TECNOLOGIAS ==========
  describe('Seção Tecnologias', () => {
    test('renderiza seção de tecnologias', () => {
      renderWithRouter();
      expect(screen.getByText('Tecnologias Utilizadas')).toBeInTheDocument();
    });

    test('renderiza card de Python', () => {
      renderWithRouter();
      expect(screen.getByText('🐍 Python')).toBeInTheDocument();
      expect(screen.getByText('Extração de dados via API GitHub')).toBeInTheDocument();
    });

    test('renderiza card de GitHub Actions', () => {
      renderWithRouter();
      expect(screen.getByText('⚡ GitHub Actions')).toBeInTheDocument();
      expect(screen.getByText('Automação de workflows')).toBeInTheDocument();
    });

    test('renderiza card de HTML5 & CSS3', () => {
      renderWithRouter();
      expect(screen.getByText('🎨 HTML5 & CSS3')).toBeInTheDocument();
      expect(screen.getByText('Frontend e documentação (GitHub Pages)')).toBeInTheDocument();
    });

    test('renderiza card de Markdown', () => {
      renderWithRouter();
      expect(screen.getByText('📝 Markdown')).toBeInTheDocument();
      expect(screen.getByText('Documentação estruturada')).toBeInTheDocument();
    });

    test('renderiza card de Figma', () => {
      renderWithRouter();
      expect(screen.getByText('🎨 Figma')).toBeInTheDocument();
      expect(screen.getByText('Protótipos e design')).toBeInTheDocument();
    });

    test('renderiza card de React/Next.js', () => {
      renderWithRouter();
      expect(screen.getByText('⚛️ React/Next.js')).toBeInTheDocument();
      expect(screen.getByText('Interface moderna e responsiva')).toBeInTheDocument();
    });

    test('seção tecnologias tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('tech');
      expect(section).toBeInTheDocument();
    });

    test('cards de tecnologia têm grid layout', () => {
      renderWithRouter();
      const techSection = document.getElementById('tech');
      const grid = techSection?.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  // ========== SEÇÃO ARQUITETURA ==========
  describe('Seção Arquitetura', () => {
    test('renderiza seção de arquitetura', () => {
      renderWithRouter();
      expect(screen.getByText('Arquitetura do Projeto')).toBeInTheDocument();
    });

    test('renderiza descrição da arquitetura', () => {
      renderWithRouter();
      expect(screen.getByText(/arquitetura orientada a serviços/)).toBeInTheDocument();
    });

    test('renderiza card Coletor de Métricas', () => {
      renderWithRouter();
      expect(screen.getByText('📊 Coletor de Métricas')).toBeInTheDocument();
      expect(screen.getByText(/Scripts Python que extraem dados/)).toBeInTheDocument();
    });

    test('renderiza card Workflows', () => {
      renderWithRouter();
      expect(screen.getByText('🔄 Workflows')).toBeInTheDocument();
      expect(screen.getByText(/GitHub Actions para orquestrar/)).toBeInTheDocument();
    });

    test('renderiza card Frontend', () => {
      renderWithRouter();
      expect(screen.getByText('🌐 Frontend')).toBeInTheDocument();
      expect(screen.getByText(/GitHub Pages para visualização/)).toBeInTheDocument();
    });

    test('seção arquitetura tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('arch');
      expect(section).toBeInTheDocument();
    });
  });

  // ========== SEÇÃO USER STORIES ==========
  describe('Seção User Stories', () => {
    test('renderiza seção de User Stories', () => {
      renderWithRouter();
      expect(screen.getByText('📖 User Stories')).toBeInTheDocument();
    });

    test('renderiza título do Story Map', () => {
      renderWithRouter();
      expect(screen.getByText('Story Map Interativo')).toBeInTheDocument();
    });

    test('renderiza descrição do Story Map', () => {
      renderWithRouter();
      expect(screen.getByText(/Explore o mapeamento completo das histórias/)).toBeInTheDocument();
    });

    test('renderiza iframe do Figma para User Stories', () => {
      renderWithRouter();
      const storiesSection = document.getElementById('stories');
      const iframe = storiesSection?.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.getAttribute('src')).toContain('figma.com');
    });

    test('renderiza link para abrir no Figma', () => {
      renderWithRouter();
      const storiesSection = document.getElementById('stories');
      const figmaLink = storiesSection?.querySelector('a[href*="figma.com"]');
      expect(figmaLink).toHaveTextContent('Abrir no Figma →');
    });

    test('seção User Stories tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('stories');
      expect(section).toBeInTheDocument();
    });

    test('link do Figma abre em nova aba', () => {
      renderWithRouter();
      const storiesSection = document.getElementById('stories');
      const figmaLink = storiesSection?.querySelector('a[href*="figma.com"]');
      expect(figmaLink).toHaveAttribute('target', '_blank');
      expect(figmaLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // ========== SEÇÃO PROTÓTIPOS ==========
  describe('Seção Protótipos', () => {
    test('renderiza seção de protótipos', () => {
      renderWithRouter();
      expect(screen.getByText('🎨 Protótipo de Alta Fidelidade')).toBeInTheDocument();
    });

    test('renderiza título do protótipo', () => {
      renderWithRouter();
      expect(screen.getByText('Protótipo Interativo')).toBeInTheDocument();
    });

    test('renderiza descrição do protótipo', () => {
      renderWithRouter();
      expect(screen.getByText(/Explore o protótipo de alta fidelidade/)).toBeInTheDocument();
    });

    test('renderiza iframe do Figma para protótipo', () => {
      renderWithRouter();
      const prototypeSection = document.getElementById('prototypes');
      const iframe = prototypeSection?.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe?.getAttribute('src')).toContain('figma.com/embed');
    });

    test('seção protótipos tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('prototypes');
      expect(section).toBeInTheDocument();
    });

    test('iframe do protótipo permite fullscreen', () => {
      renderWithRouter();
      const prototypeSection = document.getElementById('prototypes');
      const iframe = prototypeSection?.querySelector('iframe');
      expect(iframe).toHaveAttribute('allowFullScreen');
    });
  });

  // ========== SEÇÃO DOCUMENTOS ==========
  describe('Seção Documentos', () => {
    test('renderiza seção de documentos', () => {
      renderWithRouter();
      expect(screen.getByText('📚 Documentos')).toBeInTheDocument();
    });

    test('renderiza título da documentação técnica', () => {
      renderWithRouter();
      expect(screen.getByText('Documentação Técnica')).toBeInTheDocument();
    });

    test('renderiza link para documentação da API', () => {
      renderWithRouter();
      const apiLink = screen.getByText('🔌 API').closest('a');
      expect(apiLink).toHaveAttribute('href');
      expect(apiLink?.getAttribute('href')).toContain('api.html');
    });

    test('renderiza link para documentação de Arquitetura', () => {
      renderWithRouter();
      const archLink = screen.getByText('📐 Arquitetura').closest('a');
      expect(archLink).toHaveAttribute('href');
      expect(archLink?.getAttribute('href')).toContain('arquitetura.html');
    });

    test('renderiza link para Atas', () => {
      renderWithRouter();
      const atasLink = screen.getByText('📝 Atas').closest('a');
      expect(atasLink).toHaveAttribute('href');
      expect(atasLink?.getAttribute('href')).toContain('atas.html');
    });

    test('renderiza link para documentação de Backend', () => {
      renderWithRouter();
      const backendLink = screen.getByText('⚙️ Backend').closest('a');
      expect(backendLink).toHaveAttribute('href');
      expect(backendLink?.getAttribute('href')).toContain('backend.html');
    });

    test('renderiza link para Benchmarking', () => {
      renderWithRouter();
      const benchLink = screen.getByText('📊 Benchmarking').closest('a');
      expect(benchLink).toHaveAttribute('href');
      expect(benchLink?.getAttribute('href')).toContain('benchmarking.html');
    });

    test('renderiza link para Levantamento', () => {
      renderWithRouter();
      const levLink = screen.getByText('🔍 Levantamento').closest('a');
      expect(levLink).toHaveAttribute('href');
      expect(levLink?.getAttribute('href')).toContain('levantamento-inicial.html');
    });

    test('renderiza link para documentação de Frontend', () => {
      renderWithRouter();
      const frontLink = screen.getByText('🎨 Frontend').closest('a');
      expect(frontLink).toHaveAttribute('href');
      expect(frontLink?.getAttribute('href')).toContain('frontend.html');
    });

    test('todos os links de documentos abrem em nova aba', () => {
      renderWithRouter();
      const docsSection = document.getElementById('docs');
      const links = docsSection?.querySelectorAll('a.tech-card');
      
      links?.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    test('seção documentos tem ID correto', () => {
      renderWithRouter();
      const section = document.getElementById('docs');
      expect(section).toBeInTheDocument();
    });

    test('grid de documentos tem layout correto', () => {
      renderWithRouter();
      const docsSection = document.getElementById('docs');
      const grid = docsSection?.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  // ========== EFEITOS VISUAIS ==========
  describe('Efeitos Visuais', () => {
    test('renderiza elementos de fundo decorativos', () => {
      renderWithRouter();
      const container = screen.getByText('CoOps – Métricas GitHub').closest('.doc-page');
      const backgrounds = container?.querySelectorAll('.absolute');
      expect(backgrounds?.length).toBeGreaterThan(0);
    });

    test('renderiza gradiente de fundo', () => {
      renderWithRouter();
      const container = screen.getByText('CoOps – Métricas GitHub').closest('.doc-page');
      const gradient = container?.querySelector('.bg-gradient-to-br');
      expect(gradient).toBeInTheDocument();
    });

    test('renderiza círculos decorativos', () => {
      renderWithRouter();
      const container = screen.getByText('CoOps – Métricas GitHub').closest('.doc-page');
      const circles = container?.querySelectorAll('.rounded-full.blur-3xl');
      expect(circles?.length).toBeGreaterThanOrEqual(2);
    });

    test('renderiza padrão de pontos no fundo', () => {
      renderWithRouter();
      const container = screen.getByText('CoOps – Métricas GitHub').closest('.doc-page');
      const pattern = container?.querySelector('[style*="radial-gradient"]');
      expect(pattern).toBeInTheDocument();
    });
  });

  // ========== LAYOUT E ESTRUTURA ==========
  describe('Layout e Estrutura', () => {
    test('container principal tem largura máxima correta', () => {
      renderWithRouter();
      const mainContainer = screen.getByText('CoOps – Métricas GitHub').parentElement?.parentElement;
      expect(mainContainer).toHaveClass('max-w-5xl', 'mx-auto');
    });

    test('título principal tem fonte Didot', () => {
      renderWithRouter();
      const title = screen.getByText('CoOps – Métricas GitHub');
      expect(title).toHaveClass('font-didot');
    });

    test('título principal tem cor azul', () => {
      renderWithRouter();
      const title = screen.getByText('CoOps – Métricas GitHub');
      expect(title).toHaveClass('text-blue-600');
    });

    test('header tem centralização', () => {
      renderWithRouter();
      const header = screen.getByText('CoOps – Métricas GitHub').parentElement;
      expect(header).toHaveClass('text-center');
    });
  });

  // ========== RESPONSIVIDADE ==========
  describe('Responsividade', () => {
    test('grid de tecnologias é responsivo', () => {
      renderWithRouter();
      const techSection = document.getElementById('tech');
      const grid = techSection?.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });

    test('grid da arquitetura é responsivo', () => {
      renderWithRouter();
      const archSection = document.getElementById('arch');
      const grid = archSection?.querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    test('padding do container principal é responsivo', () => {
      renderWithRouter();
      const mainContainer = screen.getByText('CoOps – Métricas GitHub').parentElement?.parentElement;
      expect(mainContainer).toHaveClass('px-6', 'py-16');
    });
  });

  // ========== ACESSIBILIDADE ==========
  describe('Acessibilidade', () => {
    test('título principal é um heading h1', () => {
      renderWithRouter();
      const title = screen.getByText('CoOps – Métricas GitHub');
      expect(title.tagName).toBe('H1');
    });

    test('subtítulos são headings h3', () => {
      renderWithRouter();
      expect(screen.getByText('Story Map Interativo').tagName).toBe('H3');
      expect(screen.getByText('Protótipo Interativo').tagName).toBe('H3');
      expect(screen.getByText('Documentação Técnica').tagName).toBe('H3');
    });

    test('links externos têm rel noopener noreferrer', () => {
      renderWithRouter();
      const externalLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('target') === '_blank'
      );
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    test('iframes têm allowFullScreen', () => {
      renderWithRouter();
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        expect(iframe).toHaveAttribute('allowFullScreen');
      });
    });
  });

  // ========== CONTEÚDO E TEXTOS ==========
  describe('Conteúdo e Textos', () => {
    test('descrição menciona UnB', () => {
      renderWithRouter();
      expect(screen.getByText(/UnB/)).toBeInTheDocument();
    });

    test('descrição menciona MDS', () => {
      renderWithRouter();
      expect(screen.getByText(/Métodos de Desenvolvimento de Software/)).toBeInTheDocument();
    });

    test('descrição menciona Engenharia de Software', () => {
      renderWithRouter();
      expect(screen.getByText(/Engenharia de Software/)).toBeInTheDocument();
    });

    test('menciona análise de colaboração', () => {
      renderWithRouter();
      expect(screen.getByText(/análise da colaboração/)).toBeInTheDocument();
    });

    test('menciona métricas claras e visuais', () => {
      renderWithRouter();
      expect(screen.getByText(/métricas claras, visuais e interpretadas/)).toBeInTheDocument();
    });
  });

  // ========== CLASSES CSS ESPECÍFICAS ==========
  describe('Classes CSS Específicas', () => {
    test('link de voltar tem classe link-voltar', () => {
      renderWithRouter();
      const backLink = screen.getByText('← Voltar ao início');
      expect(backLink).toHaveClass('link-voltar');
    });

    test('cards de conteúdo têm classe doc-card', () => {
      renderWithRouter();
      const docCards = document.querySelectorAll('.doc-card');
      expect(docCards.length).toBeGreaterThan(0);
    });

    test('cards de tecnologia têm classe tech-card', () => {
      renderWithRouter();
      const techCards = document.querySelectorAll('.tech-card');
      expect(techCards.length).toBeGreaterThan(0);
    });

    test('cards de arquitetura têm classe arch-card', () => {
      renderWithRouter();
      const archCards = document.querySelectorAll('.arch-card');
      expect(archCards.length).toBeGreaterThanOrEqual(3);
    });

    test('botão final tem classe botao-final', () => {
      renderWithRouter();
      const button = screen.getByText('🚀 Explorar Métricas →');
      expect(button).toHaveClass('botao-final');
    });

    test('containers de embed do Figma têm classe correta', () => {
      renderWithRouter();
      const embedContainers = document.querySelectorAll('.figma-embed-container');
      expect(embedContainers.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ========== INTEGRAÇÃO DE SEÇÕES ==========
  describe('Integração de Seções', () => {
    test('todas as seções principais estão presentes', () => {
      renderWithRouter();
      const sections = ['intro', 'team', 'tech', 'arch', 'stories', 'prototypes', 'docs'];
      sections.forEach(id => {
        const section = document.getElementById(id);
        expect(section).toBeInTheDocument();
      });
    });

    test('ordem das seções está correta', () => {
      renderWithRouter();
      const allSections = Array.from(document.querySelectorAll('section[id]'));
      const ids = allSections.map(section => section.getAttribute('id'));
      
      expect(ids.indexOf('intro')).toBeLessThan(ids.indexOf('team'));
      expect(ids.indexOf('team')).toBeLessThan(ids.indexOf('tech'));
      expect(ids.indexOf('tech')).toBeLessThan(ids.indexOf('arch'));
    });

    test('cada seção tem pelo menos um card ou conteúdo', () => {
      renderWithRouter();
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        const hasContent = section.querySelector('.doc-card, .tech-card, .arch-card');
        expect(hasContent).toBeTruthy();
      });
    });
  });
});