# Exportação de PDF nas Páginas de Activities

Este documento descreve como usar a funcionalidade de exportação de PDF integrada nas páginas de análise de atividades do dashboard.

## 📋 Páginas com Exportação PDF

A funcionalidade de exportação PDF está disponível nas seguintes páginas:

### 1. **Commits Analysis** (`/repos/commits`)
- Exporta análise de commits do repositório
- Inclui timeline de commits e distribuição por contribuidor
- Métricas de conteúdo de commits

### 2. **Issues Analysis** (`/repos/issues`)
- Exporta análise de issues do repositório
- Inclui timeline de issues e distribuição por contribuidor
- Análise de IA sobre issues

### 3. **Pull Requests Analysis** (`/repos/pullrequests`)
- Exporta análise de pull requests
- Inclui timeline de PRs e distribuição por contribuidor
- Análise de IA sobre PRs

### 4. **Collaboration Map** (`/overview/collaboration`)
- Exporta análise de colaboração entre membros
- Inclui rede de colaboração
- Dados de heatmap de atividades

## 🎯 Como Usar

### Passo 1: Selecione o Repositório
Antes de exportar, certifique-se de ter selecionado o repositório desejado no filtro da sidebar.

### Passo 2: Clique em "Export PDF"
Cada página de atividades possui um botão vermelho "Export PDF" no canto superior direito do header.

### Passo 3: Configure a Exportação
No modal que se abre, você pode:

#### **Período de Análise**
- **Data Início**: Selecione a data inicial do período
- **Data Fim**: Selecione a data final do período
- Por padrão, exporta dados dos últimos 30 dias

#### **Seções do Relatório**
Marque as seções que deseja incluir no PDF:

- ✅ **Overview**: Informações gerais do repositório
- ✅ **Members**: Estatísticas de membros
- ✅ **Commits**: Análise de commits
- ✅ **Issues**: Análise de issues
- ✅ **Pull Requests**: Análise de PRs
- ✅ **Collaboration**: Análise de colaboração

> **Dica**: Desmarque seções para criar relatórios mais focados e rápidos.

### Passo 4: Gerar PDF
Clique em "Generate PDF" e aguarde o processamento. O arquivo será baixado automaticamente.

## 📊 Conteúdo do Relatório

### Página de Capa
- Nome do repositório
- Período de análise
- Data de geração
- Logo e branding

### Seção Overview
- **Cards de estatísticas**:
  - Total de commits
  - Total de issues
  - Total de pull requests
  - Número de colaboradores
- **Informações do repositório**:
  - Descrição
  - Data de criação
  - Linguagem principal
  - Licença

### Seção Members
**Tabela de Estatísticas por Membro**:
| Membro | Commits | Issues | PRs | Total |
|--------|---------|--------|-----|-------|
| Nome   | 50      | 10     | 8   | 68    |

### Seção Commits
- **Resumo**: Total de commits no período
- **Tabela de commits**:
  - Data/Hora
  - Autor
  - Mensagem (resumida)
  - SHA (hash curto)

### Seção Issues
- **Resumo**: Total de issues no período
- **Tabela de issues**:
  - Número
  - Título
  - Autor
  - Estado (Open/Closed)
  - Data de criação

### Seção Pull Requests
- **Resumo**: Total de PRs no período
- **Tabela de PRs**:
  - Número
  - Título
  - Autor
  - Estado (Open/Merged/Closed)
  - Data de criação

### Seção Collaboration
- **Estatísticas de colaboração**
- **Métricas de interação entre membros**

## 🎨 Formatação do PDF

### Cores e Estilo
- **Tema escuro** com fundo cinza escuro (#1a1a1a)
- **Cabeçalhos** em texto branco
- **Cards** com fundo cinza claro (#2d2d2d)
- **Tabelas** com linhas alternadas para melhor legibilidade
- **Bordas arredondadas** para elementos visuais

### Paginação
- **Numeração automática** de páginas
- **Header**: Nome do repositório e período
- **Footer**: Número da página e data de geração
- **Quebras de página automáticas** quando necessário

### Tabelas
- **Cabeçalhos**: Fundo azul (#3b82f6) com texto branco
- **Linhas alternadas**: Cinza claro/escuro para facilitar leitura
- **Auto-dimensionamento**: Ajusta largura das colunas automaticamente
- **Quebra de linha**: Texto longo é quebrado em múltiplas linhas

## ⚙️ Configurações Avançadas

### Filtros Aplicados
O PDF respeita os filtros aplicados na página:
- **Filtro de membros**: Exporta apenas dados dos membros selecionados
- **Filtro de tempo**: Usa o período configurado no modal
- **Filtro de repositório**: Exporta dados do repositório atual

### Dados Bronze Layer
Os dados são buscados da camada bronze:
```
/data/bronze/
  ├── commits_<repo>.json
  ├── issues_<repo>.json
  ├── prs_<repo>.json
  └── repo_<repo>.json
```

### Performance
- **Processamento**: ~2-5 segundos para repositórios médios
- **Tamanho**: PDFs típicos variam de 200KB a 2MB
- **Limite**: Recomendado até 1000 atividades por seção

## 🔧 Troubleshooting

### PDF não é gerado
- **Verifique** se há dados no período selecionado
- **Confirme** que o repositório possui atividades
- **Tente** reduzir o período de análise

### PDF muito grande
- **Desmarque** seções desnecessárias
- **Reduza** o período de análise
- **Filtre** por membros específicos

### Dados incompletos
- **Verifique** se os arquivos JSON da camada bronze existem
- **Confirme** que o processo de extração foi executado
- **Recarregue** a página e tente novamente

### Formatação incorreta
- **Atualize** as bibliotecas jsPDF e html2canvas
- **Limpe** o cache do navegador
- **Tente** em modo anônimo

## 🔗 Fonte de Dados

### Localização dos Arquivos
Os dados são buscados diretamente do GitHub (camada Bronze):

```
https://raw.githubusercontent.com/unb-mds/2025-2-Squad-01/main/data/bronze/
├── commits_<repoName>.json
├── issues_<repoName>.json
├── prs_<repoName>.json
└── repo_<repoName>.json
```

### Nomenclatura dos Repositórios
O nome do repositório usado na busca segue o padrão:
- Exemplo: `2025-2-Squad-01`
- Formato: `<ano>-<semestre>-<nome>`

**Importante**: O nome deve corresponder exatamente ao nome usado nos arquivos JSON da camada bronze.

### Verificação de Dados
Se algum arquivo não existir, o sistema:
1. Exibe um aviso no console (`console.warn`)
2. Continua a exportação com array vazio `[]`
3. Não interrompe o processo de geração do PDF

## 📝 Exemplos de Uso

### Relatório Completo
```
1. Selecione "All repositories" ou um repositório específico
2. Clique em "Export PDF"
3. Mantenha todas as seções marcadas
4. Defina período: últimos 90 dias
5. Clique em "Generate PDF"
```

### Relatório de Commits Apenas
```
1. Navegue para /repos/commits
2. Selecione o repositório
3. Clique em "Export PDF"
4. Marque apenas "Overview" e "Commits"
5. Gere o PDF
```

### Relatório de Membro Específico
```
1. Aplique filtro de membro na página
2. Clique em "Export PDF"
3. Configure período desejado
4. Todas as seções refletirão o filtro
5. Gere o PDF
```

## 🚀 Próximos Passos

Recursos planejados:
- [ ] Exportação de gráficos D3.js como imagens
- [ ] Templates personalizados de PDF
- [ ] Agendamento de relatórios periódicos
- [ ] Exportação em outros formatos (Excel, CSV)
- [ ] Comparação entre períodos

## 📞 Suporte

Para problemas ou sugestões:
1. Abra uma issue no repositório
2. Inclua screenshots do erro
3. Descreva os passos para reproduzir
4. Anexe o console do navegador (F12)

---

**Versão**: 1.0.0  
**Data**: Dezembro 2024  
**Mantenedores**: Equipe 2025-2-Squad-01
