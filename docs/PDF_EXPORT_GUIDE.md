# 📄 Exportação de Relatórios em PDF

Funcionalidade completa para exportar dados de repositórios em formato PDF com gráficos, tabelas e estatísticas detalhadas.

## 🎯 Funcionalidades

- ✅ **Seleção de período**: Escolha data início e fim para filtrar dados
- ✅ **Seções personalizáveis**: Escolha quais seções incluir no relatório
- ✅ **Formatação profissional**: PDF com cores, tabelas e gráficos
- ✅ **Dados por membro**: Atividades individuais de cada contribuidor
- ✅ **Estatísticas gerais**: Overview do repositório
- ✅ **Histórico de commits**: Lista detalhada de commits
- ✅ **Issues e PRs**: Tabelas com issues e pull requests

## 📦 Dependências Instaladas

```bash
npm install jspdf html2canvas
```

## 🗂️ Estrutura de Arquivos Criados

```
front-end/
├── src/
│   ├── utils/
│   │   └── pdfExport.ts          # Utilitário principal para geração de PDF
│   ├── hooks/
│   │   └── useRepositoryPDFExport.ts  # Hook para buscar dados e exportar
│   └── components/
│       └── ExportPDFModal.tsx    # Modal de configuração de exportação
```

## 🚀 Como Usar

### 1. Adicionar botão em qualquer página

```tsx
import { useState } from 'react';
import { ExportPDFModal } from '../components/ExportPDFModal';
import { useRepositoryPDFExport } from '../hooks/useRepositoryPDFExport';

function RepositoryPage({ repoName }: { repoName: string }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportToPDF, isExporting } = useRepositoryPDFExport(repoName);

  return (
    <>
      {/* Botão de Export */}
      <button
        onClick={() => setShowExportModal(true)}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
      >
        📄 Export PDF
      </button>

      {/* Modal de Exportação */}
      <ExportPDFModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportToPDF}
        repoName={repoName}
      />
    </>
  );
}
```

### 2. Integração com páginas existentes

#### Overview Page (usando OverviewToolbar)

```tsx
import OverviewToolbar from '../components/OverviewToolbar';

function OverviewPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportToPDF } = useRepositoryPDFExport('2025-2-Squad-01');

  return (
    <>
      <OverviewToolbar
        currentPage="timeline"
        onExportPDF={() => setShowExportModal(true)}
      />
      
      <ExportPDFModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportToPDF}
        repoName="2025-2-Squad-01"
      />
    </>
  );
}
```

#### Repository Page

```tsx
function RepositoryPage() {
  const [searchParams] = useSearchParams();
  const repoName = searchParams.get('repo') || '';
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportToPDF } = useRepositoryPDFExport(repoName);

  return (
    <>
      <button onClick={() => setShowExportModal(true)}>
        Export PDF
      </button>
      
      <ExportPDFModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={exportToPDF}
        repoName={repoName}
      />
    </>
  );
}
```

## 📊 Estrutura do Relatório PDF

### Capa
- Nome do repositório
- Descrição
- Período selecionado
- Data de geração

### Visão Geral (se habilitada)
- Total de commits, issues, PRs
- Número de membros ativos
- Datas de criação e atualização

### Atividade dos Membros (se habilitada)
- Tabela com top 20 contribuidores
- Colunas: Membro, Commits, Issues, PRs, Total

### Commits (se habilitado)
- Lista dos últimos 15 commits
- Autor, mensagem, data, alterações

### Issues (se habilitado)
- Lista das últimas 15 issues
- Título, autor, status, data

### Pull Requests (se habilitado)
- Lista dos últimos 15 PRs
- Título, autor, status, data

## 🎨 Personalização

### Cores dos Cards de Estatísticas

```typescript
// Em pdfExport.ts, método addStatsRow()
const stats = [
  { label: 'Commits', value: 150, color: [52, 152, 219] },    // Azul
  { label: 'Issues', value: 45, color: [155, 89, 182] },     // Roxo
  { label: 'PRs', value: 30, color: [46, 204, 113] },        // Verde
  { label: 'Membros', value: 12, color: [241, 196, 15] }     // Amarelo
];
```

### Adicionar Nova Seção

1. Adicionar opção no modal:

```tsx
// Em ExportPDFModal.tsx
const [sections, setSections] = useState({
  // ... seções existentes
  newSection: true
});
```

2. Implementar geração no PDFExporter:

```typescript
// Em pdfExport.ts
if (options.includeSections.newSection) {
  this.addSubtitle('🎯 Nova Seção');
  // Adicionar conteúdo
}
```

## 📝 Exemplos de Uso Avançado

### Exportar com captura de gráficos

```typescript
const exporter = new PDFExporter();

// Capturar elemento HTML como imagem
await exporter.captureElementAsPDF('chart-container', 'Gráfico de Atividade');

// Continuar com o relatório
await exporter.generateRepositoryReport(data, options);
exporter.save('report');
```

### Filtrar dados antes de exportar

```typescript
const exportCustomData = async () => {
  const customOptions = {
    repoName: 'MyRepo',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    includeSections: {
      overview: true,
      members: true,
      commits: false,  // Não incluir commits
      issues: false,
      prs: false,
      collaboration: false
    }
  };
  
  await exportToPDF(customOptions);
};
```

## 🐛 Tratamento de Erros

```typescript
const { exportToPDF, isExporting, error } = useRepositoryPDFExport(repoName);

const handleExport = async () => {
  try {
    await exportToPDF(options);
    alert('PDF exportado com sucesso!');
  } catch (err) {
    console.error('Erro ao exportar:', err);
    alert('Falha ao gerar PDF. Verifique os dados.');
  }
};
```

## ✅ Checklist de Integração

- [ ] Instalar dependências (`jspdf`, `html2canvas`)
- [ ] Copiar arquivos utilitários
- [ ] Adicionar botão de export na página
- [ ] Importar e usar `ExportPDFModal`
- [ ] Importar e usar `useRepositoryPDFExport`
- [ ] Testar exportação com dados reais
- [ ] Verificar formatação do PDF gerado
- [ ] Ajustar cores e layout se necessário

## 🎯 Próximos Passos

1. **Adicionar gráficos visuais**: Integrar charts do D3.js no PDF
2. **Exportação em lote**: Exportar múltiplos repositórios de uma vez
3. **Templates customizáveis**: Permitir escolher diferentes layouts
4. **Agendamento**: Gerar relatórios automaticamente (via backend)
5. **Envio por email**: Compartilhar relatórios diretamente

## 📚 Referências

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
