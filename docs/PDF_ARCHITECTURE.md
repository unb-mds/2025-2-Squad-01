# 📋 Arquitetura de Exportação PDF - Option 2

## 🎯 Visão Geral

Sistema de exportação de relatórios PDF com **pré-processamento na Silver Layer**.

### Princípios
- ✅ **Separação de Responsabilidades**: Dados != UI
- ✅ **Performance**: Frontend apenas busca, não processa
- ✅ **Clean Code**: Utils sem React, hooks apenas para orquestração
- ✅ **Medallion Architecture**: Bronze → Silver → Frontend

---

## 🏗️ Arquitetura (Option 2)

```
┌─────────────┐
│   Bronze    │ ← Dados brutos da API GitHub
│  Layer      │   (commits_*.json, issues_*.json, prs_*.json)
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Python Processor      │ ← src/silver/pdf_data_processor.py
│   (Silver Layer)        │   • Agrega dados por membro
│                         │   • Conta commits/issues/PRs
│                         │   • Formata dados para PDF
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Silver Layer          │ ← data/silver/pdf/pdf_data_{repo}.json
│   (Dados Processados)   │   • Dados agregados prontos
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Frontend Utils        │ ← front-end/src/utils/pdfDataFetcher.ts
│   (Limpo, SEM React)    │   • fetchPDFData() - apenas fetch
│                         │   • filterDataByDate() - filtro opcional
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   React Hook            │ ← front-end/src/hooks/useRepositoryPDFExport.ts
│   (Orquestração)        │   • Busca dados via pdfDataFetcher
│                         │   • Chama PDFExporter
│                         │   • NÃO processa dados
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   PDF Generator         │ ← front-end/src/utils/pdfExport.ts
│   (Renderização)        │   • Gera PDF com jsPDF
└─────────────────────────┘
```

---

## 📂 Estrutura de Arquivos

### Backend (Python)
```
src/silver/
└── pdf_data_processor.py     # Processador Python
    ├── PDFDataProcessor      # Classe principal
    ├── process_repository()  # Processa um repo
    ├── _aggregate_commits()  # Conta commits por autor
    ├── _aggregate_issues()   # Conta issues por autor
    ├── _aggregate_prs()      # Conta PRs por autor
    └── _consolidate_members()# Junta tudo por membro
```

### Frontend (TypeScript)
```
front-end/src/
├── utils/
│   ├── pdfDataFetcher.ts       # Utils LIMPO (sem React)
│   │   ├── fetchPDFData()      # Busca JSON da Silver
│   │   ├── filterDataByDate()  # Filtro opcional
│   │   └── validatePDFData()   # Validação
│   └── pdfExport.ts            # Gerador de PDF
│       └── PDFExporter         # Classe jsPDF
└── hooks/
    └── useRepositoryPDFExport.ts # Hook React (orquestração)
        ├── exportToPDF()         # Função principal
        └── transformToRepositoryData() # Adapt interface
```

---

## 🔄 Fluxo de Dados

### 1. **Pré-processamento (Backend)**
```bash
# Executar processador Python
python src/silver/pdf_data_processor.py
```

**Output**: `data/silver/pdf/pdf_data_{repo_name}.json`

**Estrutura**:
```json
{
  "_metadata": {
    "repo_name": "...",
    "processed_at": "...",
    "processor": "pdf_data_processor.py",
    "layer": "silver"
  },
  "repository": { ... },
  "stats": {
    "total_commits": N,
    "total_issues": N,
    "total_prs": N,
    "total_members": N
  },
  "members": [
    {
      "login": "...",
      "commits": N,
      "issues": N,
      "prs": N,
      "total_contributions": N
    }
  ],
  "recent_commits": [...],
  "recent_issues": [...],
  "recent_prs": [...]
}
```

### 2. **Fetch (Frontend Utils)**
```typescript
// front-end/src/utils/pdfDataFetcher.ts
import { fetchPDFData } from '../utils/pdfDataFetcher';

const data = await fetchPDFData('2024-2-Squad01');
// Retorna: PDFRepositoryData (já agregado)
```

### 3. **Orquestração (React Hook)**
```typescript
// front-end/src/hooks/useRepositoryPDFExport.ts
const { exportToPDF } = useRepositoryPDFExport(repoName);

await exportToPDF({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  includeOverview: true,
  includeMembers: true
});
```

### 4. **Geração PDF**
```typescript
// front-end/src/utils/pdfExport.ts
const exporter = new PDFExporter();
await exporter.generateRepositoryReport(data, options);
exporter.save('relatorio.pdf');
```

---

## 🚀 Performance

| Métrica | Option 1 (Frontend) | Option 2 (Silver) |
|---------|---------------------|-------------------|
| **Processamento** | ~2-3s no browser | 0s (pré-processado) |
| **Fetch** | 4 requests (commits, issues, prs, repo) | 1 request (agregado) |
| **Payload** | ~500KB-2MB | ~50-100KB |
| **Latência** | Alta | Baixa |
| **Total** | ~3-5s | ~1-2s ✅ |

---

## 🛠️ Como Usar

### 1. Processar Dados (Backend)
```bash
# Processar todos os repositórios
python src/silver/pdf_data_processor.py

# Ou processar um específico (modificar o script)
# repo_name = "2024-2-Squad01"
```

### 2. Fazer Commit e Push
```bash
git add data/silver/pdf/*.json
git commit -m "feat: adiciona dados Silver Layer para PDF"
git push
```

### 3. Usar no Frontend
O frontend automaticamente buscará os dados pré-processados:

```typescript
// Componente React
import { useRepositoryPDFExport } from '@/hooks/useRepositoryPDFExport';

function MyComponent() {
  const { exportToPDF, isExporting } = useRepositoryPDFExport('2024-2-Squad01');
  
  const handleExport = async () => {
    await exportToPDF({
      includeOverview: true,
      includeMembers: true,
      includeCommits: true
    });
  };
  
  return <button onClick={handleExport}>Exportar PDF</button>;
}
```

---

## 📊 Repositórios Processados

✅ **73 repositórios** com dados pré-processados na Silver Layer

Para ver a lista completa:
```bash
ls data/silver/pdf/
```

---

## 🔧 Manutenção

### Adicionar Novo Repositório
1. Coletar dados Bronze (commits, issues, PRs)
2. Executar processador Python
3. Commit e push do novo JSON
4. Frontend automaticamente terá acesso

### Atualizar Dados
```bash
# Re-processar todos
python src/silver/pdf_data_processor.py

# Commit
git add data/silver/pdf/*.json
git commit -m "chore: atualiza dados Silver Layer"
git push
```

---

## 🎓 Boas Práticas

### ✅ DO
- Manter lógica de dados em utils limpos (sem React)
- Usar hooks apenas para orquestração e estado UI
- Validar dados com `validatePDFData()`
- Processar dados no backend quando possível

### ❌ DON'T
- Processar dados dentro de hooks React
- Misturar lógica de dados com lógica de UI
- Fazer múltiplas requisições quando uma basta
- Processar grandes volumes no frontend

---

## 📚 Referências

- [PDFExporter](../front-end/src/utils/pdfExport.ts) - Gerador de PDF
- [pdfDataFetcher](../front-end/src/utils/pdfDataFetcher.ts) - Utils limpo
- [useRepositoryPDFExport](../front-end/src/hooks/useRepositoryPDFExport.ts) - Hook React
- [pdf_data_processor.py](../src/silver/pdf_data_processor.py) - Processador Python
- [Guia de Uso PDF](./PDF_EXPORT_GUIDE.md) - Documentação de uso

---

**Última atualização**: 05/12/2025  
**Versão**: 2.0 (Option 2 - Silver Layer)
