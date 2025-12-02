# 📊 Extração e Processamento de Dados

## Visão Geral

Este documento descreve detalhadamente o fluxo completo de extração, transformação e visualização de dados do projeto, desde a coleta bruta (Bronze) até a apresentação no frontend, incluindo todas as otimizações de performance implementadas (GraphQL/REST híbrido, rate limiting, caching).

---

## 🏗️ Arquitetura Medallion

O projeto utiliza a **Arquitetura Medallion** com três camadas:

```
GitHub API → Bronze (Raw) → Silver (Enriched) → Gold (Aggregated) → Frontend
```

### Camadas

- **🥉 Bronze**: Dados brutos extraídos diretamente da API do GitHub
- **🥈 Silver**: Dados processados, limpos e enriquecidos com análises
- **🥇 Gold**: Dados agregados e prontos para consumo pelo frontend

---

## 📥 Camada Bronze - Extração de Dados Brutos

### Componentes Principais

#### 1. GitHubAPIClient (`src/utils/github_api.py`)

Cliente centralizado para comunicação com a API do GitHub, implementando:

- **Rate limit handling**: Controle automático de limites de requisições
- **Cache**: Sistema de cache para evitar requisições duplicadas
- **Retry logic**: Tentativas automáticas com backoff exponencial
- **Circuit breaker**: Proteção contra falhas consecutivas

#### 2. Métodos de Extração

##### REST API
```python
def rest_repository_tree(self, owner: str, repo: str, branch: str = "main")
```
- Extração de estrutura de repositório via endpoint `/git/trees`
- **1 requisição por repositório** (com `recursive=1`)
- Suporte a até 100.000 arquivos por repositório

##### GraphQL API
```python
def graphql_commit_history(self, owner: str, repo: str, branch: str = "main")
```
- Extração de histórico de commits via GraphQL
- Paginação automática com cursor
- Redução significativa de consumo de rate limit

##### REST API Tradicional
```python
def get_commits(self, owner: str, repo: str, branch: str = "main")
```
- Método tradicional para commits
- Usado como fallback quando GraphQL falha

### Scripts de Extração Bronze

#### `src/bronze/repository_structure.py`
Extrai a estrutura completa de arquivos do repositório.

**Otimização Implementada (PR #101):**
- ✅ **100x mais rápido**: 3-4 horas → 30-40 segundos
- ✅ Migração de GraphQL iterativo para REST `recursive=1`
- ✅ Redução de 1.500 requisições → 73 requisições (1 por repo)
- ✅ Zero erros de secondary rate limit

**Processo:**
1. Conecta ao GitHub via REST API
2. Busca árvore completa com `recursive=1`
3. Extrai caminho, tipo e tamanho de cada arquivo
4. Salva JSON bruto em `data/bronze/repository_structure/`

**Exemplo de saída:**
```json
{
  "owner": "unb-mds",
  "repository": "2025-2-Squad-01",
  "branch": "main",
  "tree": [
    {
      "path": "src/bronze/commits.py",
      "type": "blob",
      "size": 5432
    }
  ],
  "extracted_at": "2025-12-02T10:30:00Z"
}
```

#### `src/bronze/commits.py`
Extrai histórico completo de commits do repositório.

**Otimização Implementada (PR #78 e #104):**
- ✅ GraphQL como método padrão
- ✅ Circuit breaker otimizado (1 falha → REST fallback)
- ✅ Timeout único de 30 segundos (fail-fast)
- ✅ Processamento paralelo REST com 5 workers
- ✅ Batches de 10 commits com delay de 0.3s

**Fluxo Híbrido GraphQL/REST:**

```
┌─────────────────────┐
│  Tentar GraphQL     │
│  (timeout: 30s)     │
└──────────┬──────────┘
           │
           ├─ Sucesso ──────────────────┐
           │                            │
           └─ Falha (502/timeout) ──────┤
                                        │
                                        ▼
                            ┌────────────────────┐
                            │  Fallback REST     │
                            │  (5 workers)       │
                            └────────────────────┘
```

**Processo GraphQL:**
1. Query única com paginação automática
2. Extrai: SHA, autor, data, mensagem, adições, remoções
3. Métricas de linhas sem requisições extras

**Processo REST (Fallback):**
1. ThreadPoolExecutor com 5 workers simultâneos
2. Processa commits em batches de 10
3. Delay de 0.3s entre batches
4. ~50% mais rápido que sequencial

**Exemplo de saída:**
```json
{
  "owner": "unb-mds",
  "repository": "2025-2-Squad-01",
  "commits": [
    {
      "sha": "abc123...",
      "author": "developer",
      "date": "2025-10-15T14:30:00Z",
      "message": "feat: add GraphQL support",
      "additions": 150,
      "deletions": 30
    }
  ],
  "total_commits": 450,
  "extracted_at": "2025-12-02T10:30:00Z"
}
```

#### `src/bronze/issues.py`
Extrai issues abertas e fechadas.

**Processo:**
1. Pagina através de todas as issues
2. Extrai: título, estado, labels, assignees, datas
3. Salva em `data/bronze/issues/`

#### `src/bronze/pull_requests.py`
Extrai pull requests com detalhes.

**Processo:**
1. Busca PRs (abertos/fechados/merged)
2. Extrai: título, estado, reviewers, mergeable, datas
3. Salva em `data/bronze/pull_requests/`

---

## 🔄 Camada Silver - Enriquecimento e Análise

### Scripts de Análise Silver

#### `src/silver/temporal_analysis.py`
Análise temporal de atividades do repositório.

**Métricas calculadas:**
- Commits por dia/semana/mês
- Frequência de contribuições
- Padrões temporais de atividade
- Linhas adicionadas/removidas por período

**Saída:** `data/silver/temporal_analysis/`

#### `src/silver/file_language_analysis.py`
Análise de linguagens e estrutura de arquivos.

**Processo:**
1. Lê estrutura Bronze
2. Detecta linguagem por extensão (90+ extensões suportadas)
3. Calcula distribuição de linguagens
4. Conta arquivos por tipo

**Categorias suportadas:**
- Linguagens de programação (Python, JavaScript, TypeScript, Java, etc.)
- Markup e estilos (HTML, CSS, Markdown)
- Configuração (JSON, YAML, TOML, INI, ENV)
- Imagens (PNG, JPEG, SVG, WebP, GIF)
- Fontes (TTF, OTF, WOFF, WOFF2)
- Mídia (MP4, MP3, WAV, AVI)
- Arquivos (ZIP, TAR, RAR, 7Z)
- Documentação (RST, LaTeX, PDF, TXT)
- Shell (Bash, Zsh, Fish, PowerShell)

**Saída:** `data/silver/file_language_analysis/`

```json
{
  "owner": "unb-mds",
  "repository": "2025-2-Squad-01",
  "languages": {
    "Python": {
      "count": 45,
      "total_size": 234567,
      "percentage": 45.5
    },
    "TypeScript": {
      "count": 38,
      "total_size": 189234,
      "percentage": 35.2
    }
  },
  "total_files": 156,
  "analyzed_at": "2025-12-02T10:35:00Z"
}
```

#### `src/silver/collaboration_analysis.py`
Análise de colaboração entre desenvolvedores.

**Métricas:**
- Rede de colaboração (quem trabalha com quem)
- Contribuições por desenvolvedor
- Heatmap de atividades
- Frequência de interações

**Saída:** `data/silver/collaboration_analysis/`

---

## 🏆 Camada Gold - Agregação Final

A camada Gold não possui scripts específicos atualmente. Os dados Silver são consumidos diretamente pelo frontend, que realiza agregações sob demanda.

**Agregações no Frontend:**
- Soma total de commits por repositório
- Cálculo de métricas agregadas
- Ordenação e filtragem de dados
- Visualizações interativas

---

## 🎨 Frontend - Visualização de Dados

### Arquitetura Frontend

```
React + TypeScript + Vite
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── hooks/              # Custom hooks para dados
│   ├── pages/              # Páginas principais
│   └── utils/              # Utilitários
```

### Fluxo de Dados no Frontend

#### 1. Custom Hooks

##### `useRepositories()` - Hook principal
```typescript
// Carrega lista de repositórios
const { repositories, loading, error } = useRepositories();
```

**Processo:**
1. Busca arquivos JSON da camada Silver
2. Parse e validação de dados
3. Estado de loading e erro
4. Cache em memória

##### `useRepoData(owner, repo)` - Dados específicos
```typescript
// Carrega dados de um repositório específico
const { commits, structure, issues, prs } = useRepoData(owner, repo);
```

**Processo:**
1. Carrega múltiplos arquivos Silver em paralelo
2. Combina dados de diferentes análises
3. Retorna objeto consolidado

#### 2. Componentes de Visualização

##### RepoFingerprint (Estrutura)
Visualização de estrutura de repositório.

**Fonte de dados:** `file_language_analysis` (Silver)

**Visualizações:**
- **Treemap**: Hierarquia de pastas e arquivos
- **CirclePack**: Distribuição circular de arquivos
- **Legenda de linguagens**: Cores por linguagem

**Interatividade:**
- Alternância entre modos de visualização
- Tooltip com informações detalhadas
- Zoom e pan (planejado)

##### CollaborationNetworkGraph
Grafo de rede de colaboração.

**Fonte de dados:** `collaboration_analysis` (Silver)

**Elementos:**
- **Nós**: Desenvolvedores (tamanho = contribuições)
- **Arestas**: Colaborações (espessura = frequência)
- **Cores**: Grupos de trabalho

##### ActivityHeatmap
Mapa de calor de atividades temporais.

**Fonte de dados:** `temporal_analysis` (Silver)

**Visualização:**
- Eixo X: Dias da semana
- Eixo Y: Horas do dia
- Cor: Intensidade de commits

##### Commits Timeline
Linha do tempo de commits.

**Fonte de dados:** `commits` (Bronze) + `temporal_analysis` (Silver)

**Métricas exibidas:**
- Total de commits
- Commits por período
- Linhas adicionadas/removidas
- Contribuidores ativos

#### 3. Páginas Principais

##### `/repos` - Lista de Repositórios
- Grid de cards com informações básicas
- Filtros por organização
- Ordenação por métricas

##### `/repos/[owner]/[repo]` - Detalhes do Repositório
- Métricas gerais (commits, PRs, issues)
- Visualização de estrutura (RepoFingerprint)
- Análises temporais

##### `/repos/collaboration` - Colaboração
- Dashboard centralizado
- Grafo de rede interativo
- Heatmap de atividades
- Métricas de engajamento

---

## ⚡ Otimizações Implementadas

### 1. Otimização de Estrutura (PR #101)

**Problema:**
- Extração levava 3-4 horas
- ~1.500 requisições GraphQL para 73 repositórios
- Erros frequentes de secondary rate limit (403)

**Solução:**
- ✅ Migração de GraphQL iterativo para REST `/git/trees` com `recursive=1`
- ✅ **100x mais rápido**: 3-4h → 30-40 segundos
- ✅ Redução para 73 requisições (1 por repositório)
- ✅ Zero erros de rate limit
- ✅ Suporte a até 100.000 arquivos por repo

**Impacto:**
- Pipeline completo executa em ~27 minutos (antes: horas)
- Extração de estrutura: ~30 segundos (antes: 4 horas)
- Complexidade reduzida: 150K linhas → 146 com otimização

### 2. Otimização GraphQL/REST Híbrido (PR #104)

**Problema:**
- GraphQL falhava ocasionalmente (502 Bad Gateway)
- Timeout muito longo causava travamentos
- Extração REST sequencial era lenta

**Solução:**

**GraphQL:**
- ✅ Timeout único de 30 segundos (fail-fast)
- ✅ Circuit breaker otimizado (1 falha → REST fallback)
- ✅ Fallback imediato em 502 Bad Gateway

**REST (Fallback):**
- ✅ ThreadPoolExecutor com 5 workers simultâneos
- ✅ Processamento em batches de 10 commits
- ✅ Delay de 0.3s entre batches para respeitar rate limit
- ✅ ~50% mais rápido que sequencial

**Impacto:**
- Extração de commits robusta e rápida
- Zero travamentos por timeout
- Fallback automático confiável
- Melhor utilização de rate limit

### 3. Expansão de Linguagens (PR #101)

**Antes:** 32 extensões suportadas  
**Depois:** 90+ extensões suportadas

**Novas categorias:**
- Imagens (PNG, JPEG, SVG, WebP, GIF, ICO, BMP)
- Fontes (TTF, OTF, WOFF, WOFF2, EOT)
- Mídia (MP4, MP3, WAV, AVI, MOV, FLV)
- Arquivos (ZIP, TAR, RAR, 7Z, GZ, BZ2)
- Configuração (TOML, INI, ENV, PROPERTIES)
- Documentação (RST, LaTeX, PDF, TXT, RTF)
- Shell (Fish, PowerShell, Zsh, CSH)

**Impacto:**
- Análise mais precisa de repositórios
- Melhor categorização de arquivos
- Visualizações mais completas

---

## 🔧 Configuração e Execução

### Variáveis de Ambiente

```bash
# .secrets
GITHUB_TOKEN=ghp_your_token_here
```

### Execução da Pipeline Bronze

```bash
# Extração completa
python src/bronze/commits.py
python src/bronze/repository_structure.py
python src/bronze/issues.py
python src/bronze/pull_requests.py
```

**Flags disponíveis:**
```bash
# Escolher método de commits
python src/bronze/commits.py --commits-method graphql  # (padrão)
python src/bronze/commits.py --commits-method rest     # (fallback)
```

### Execução da Pipeline Silver

```bash
python src/silver/temporal_analysis.py
python src/silver/file_language_analysis.py
python src/silver/collaboration_analysis.py
```

### GitHub Actions (Automação)

**Workflow Bronze Extract:**
```yaml
- Trigger: Manual ou scheduled
- Extrai: commits, estrutura, issues, PRs
- Método padrão: GraphQL (fallback REST automático)
- Frequência: Sob demanda
```

**Workflow Silver Transform:**
```yaml
- Trigger: Após Bronze Extract
- Processa: análises temporais, linguagens, colaboração
- Salva: Dados enriquecidos em data/silver/
```

---

## 📊 Métricas de Performance

### Pipeline Bronze
- **Commits (GraphQL):** ~10-20 segundos por repo
- **Commits (REST Paralelo):** ~15-30 segundos por repo
- **Estrutura (REST recursive):** ~30 segundos para 73 repos
- **Issues:** ~5-10 segundos por repo
- **Pull Requests:** ~5-10 segundos por repo

### Pipeline Silver
- **Temporal Analysis:** ~2-5 segundos por repo
- **File Language Analysis:** ~1-2 segundos por repo
- **Collaboration Analysis:** ~3-8 segundos por repo

### Pipeline Completa
- **Bronze + Silver:** ~27 minutos para 73 repositórios
- **Antes das otimizações:** Várias horas

---

## 🚀 Fluxo Completo End-to-End

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub API                                │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  BRONZE - Extração de Dados Brutos                              │
│  ├── commits.py (GraphQL/REST híbrido)                          │
│  ├── repository_structure.py (REST recursive)                   │
│  ├── issues.py                                                   │
│  └── pull_requests.py                                            │
│  Saída: data/bronze/                                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  SILVER - Enriquecimento e Análise                              │
│  ├── temporal_analysis.py                                        │
│  ├── file_language_analysis.py                                  │
│  └── collaboration_analysis.py                                   │
│  Saída: data/silver/                                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND - Visualização (React + D3.js)                        │
│  ├── useRepositories() - Carrega lista                          │
│  ├── useRepoData() - Carrega dados específicos                  │
│  ├── RepoFingerprint - Estrutura (Treemap/CirclePack)          │
│  ├── CollaborationNetworkGraph - Rede de colaboração            │
│  ├── ActivityHeatmap - Mapa de calor temporal                   │
│  └── Commits Timeline - Linha do tempo                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Boas Práticas

### Rate Limit
- ✅ Cache de requisições
- ✅ Circuit breaker para falhas consecutivas
- ✅ Retry com backoff exponencial
- ✅ Delay entre batches (0.3s)
- ✅ Monitoramento de rate limit remaining

### Performance
- ✅ Processamento paralelo quando possível
- ✅ Paginação eficiente
- ✅ Timeout configurável
- ✅ Fallback automático

### Confiabilidade
- ✅ Tratamento de erros robusto
- ✅ Logging detalhado
- ✅ Validação de dados
- ✅ Testes de integração

---

## 📚 Referências

- [Arquitetura Medallion](./ARQUITETURA.md)
- [Batch Processing Guide](../BATCH_PROCESSING.md)
- [Structure Visualization Docs](./structure-visualization.md)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub GraphQL API Documentation](https://docs.github.com/en/graphql)

---

**Última atualização:** 02/12/2025  
**Versão:** 2.0 (Pós-otimizações PR #101 e #104)
