# 🏗️ Arquitetura do Sistema

**Projeto:** Análise de Métricas de Repositórios GitHub  
**Squad:** 01  
**Última Atualização:** 01/12/2025

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura Medallion](#-arquitetura-medallion)
3. [Topologia do Sistema](#-topologia-do-sistema)
4. [Diagrama de Sequência](#-diagrama-de-sequência)
5. [Camadas de Dados](#-camadas-de-dados)
6. [Tecnologias](#-tecnologias)
7. [Decisões Arquiteturais](#-decisões-arquiteturais)

---

## 🎯 Visão Geral

O sistema utiliza a **arquitetura Medallion** (Bronze → Silver → Gold) para processamento incremental de dados, combinada com um frontend moderno em React para visualização de métricas e dashboards interativos.

### Princípios Arquiteturais
- ✅ **Separação de responsabilidades:** Camadas Bronze, Silver e Gold
- ✅ **Processamento incremental:** ETL automatizado via GitHub Actions
- ✅ **Cache inteligente:** Dados armazenados em JSON para reduzir chamadas à API
- ✅ **Escalabilidade:** Processamento assíncrono e paralelo
- ✅ **Observabilidade:** Logs e monitoramento de rate limits

---

## 🥉🥈🥇 Arquitetura Medallion

### Bronze Layer (Raw Data)
**Responsabilidade:** Extração de dados brutos da GitHub API

**Fontes de Dados:**
- 📊 **Repositórios da Organização**
  - Metadados (nome, descrição, linguagens)
  - Estrutura de diretórios/arquivos
  
- 🐛 **Issues/PRs**
  - Lista de issues abertas/fechadas
  - Pull requests e status
  
- 💬 **Commits/Events**
  - Histórico de commits
  - Eventos de colaboração

**Tecnologias:**
- Python Scripts (`src/bronze/`)
- GitHub REST API
- GitHub Actions (Daily Trigger - Cron: 0 6 * * *)

**Armazenamento:**
- Arquivos JSON (`data/bronze/`)
- Append-only storage com timestamp

---

### Silver Layer (Normalized Data)
**Responsabilidade:** Transformação e normalização dos dados

**Processos:**
1. **Parse & Normalize**
   - dim_users (dimensão usuários)
   - dim_repos (dimensão repositórios)
   - fact_commits (fato commits)
   - fact_prs (fato PRs)
   - fact_issues (fato issues)
   - fact_reviews (fato reviews)

2. **ETL Transform**
   - Limpeza de dados
   - Enriquecimento
   - Relacionamentos estabelecidos

**Tecnologias:**
- Python Scripts (`src/silver/`)
- Pandas para transformações
- JSON normalizado

**Armazenamento:**
- Arquivos JSON normalizados (`data/silver/`)
- Modelo relacional com foreign keys

---

### Gold Layer (KPIs & Analytics)
**Responsabilidade:** Agregação e cálculo de KPIs

**Métricas Calculadas:**
- 📈 **Throughput metrics** (velocidade de entrega)
- 📊 **Code quality indices** (qualidade de código)
- 🔍 **Contribution analysis** (análise de contribuição)
- 📉 **Distribution indices** (distribuição de trabalho)

**Saídas:**
- KPIs agregados
- Métricas prontas para visualização
- Dados estruturados para dashboards

**Tecnologias:**
- Python Scripts (`src/gold/`)
- Cálculos estatísticos
- JSON com KPIs

**Armazenamento:**
- Arquivos JSON otimizados (`data/gold/`)
- Ready-to-consume metrics

---

## 🗺️ Topologia do Sistema

![Topologia do Sistema](./Template%20MDS.png)

### Componentes Principais

#### 📱 Camada de Apresentação (Frontend Layer)

**Dashboard Repository**
- **Hospedagem:** Firebase Platform / Netlify
- **Tecnologias:** React + D3.js
- **Acesso:** HTTPS
- **Funcionalidades:**
  - Visualizações interativas (Treemap, CirclePack)
  - Dashboards de métricas
  - Análises com IA

**Usuários:**
- 👨‍🏫 Docentes/Gestores
- 👨‍🎓 Estudantes  
- 🔬 Pesquisadores

#### 🔄 Camada de Processamento (Processing Layer)

**GitHub Actions - Scheduled Trigger (Daily: 0 6 * * *)**
- ⏰ Cron diário às 6h
- 🤖 ETL automatizado
- 📊 Processamento Bronze → Silver → Gold

**Python Scripts ETL**
- `src/bronze/` - Extração
- `src/silver/` - Transformação  
- `src/gold/` - Agregação

#### 💾 Camada de Dados (Data Layer)

**Organizações & Repositórios**
- **LicitaBSB** (Organização exemplo)
- **Projetos A, B, N** (Repositórios)
- Dados extraídos via GitHub API

**Fontes de Dados:**
- 📦 Repositórios da Organização
- 🐛 Issues/PRs
- 💬 Commits/Events

#### 🤖 Camada de IA (React Agent AI)

**Dashboard Integration**
- ✅ D3.js Visualizações
- ✅ GitHub API Client

**Processamento IA:**
- 🧠 Gera análises via Gemini API
- 📊 Análise de qualidade de commits/PRs
- 💡 Insights contextualizados

**Armazenamento:**
- 📁 Store in Repository (GitHub)
- 🗄️ Advanced Queries (Retrieval Access)

#### 🎨 Camada de Visualização Avançada (Frontend Layer - Extended)

**Ambiente Acadêmico:**
- 👥 Pesquisadores Atípicos
- 📚 Estudantes Independentes
- 🎓 Professores Gestores

**Visualizações:**
- 📊 Gráfico CPM (Critical Path Method)
- 📈 Edge Locations (Network graphs)

---

```
┌─────────────────────────────────────────────────────────────┐
│                     STAKEHOLDERS                             │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐        │
│  │ Docentes/    │  │ Estudantes │  │ Pesquisadores│        │
│  │ Gestores     │  │            │  │              │        │
│  └──────────────┘  └────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
           │                │                │
           └────────────────┼────────────────┘
                           HTTPS
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    FRONTEND LAYER                             │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  React + D3.js                                      │     │
│  │  - Frontend & Hosting (Firebase/Vercel)            │     │
│  │  - Dashboard Repository                             │     │
│  └─────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
                            │
                    GitHub API Read Data
                            │
┌───────────────────────────▼──────────────────────────────────┐
│               REPOSITÓRIO CENTRAL (GitHub)                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Dashboard Repository                               │     │
│  │  - Bronze/Silver/Gold JSON data                     │     │
│  │  - Python Scripts                                   │     │
│  │  - GitHub Actions ETL                               │     │
│  └─────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
           │                                          │
           │ Store                              API Access
           │                                   Bronze/Silver
           ▼                                          ▼
┌──────────────────────┐              ┌──────────────────────┐
│  CAMADAS DE DADOS    │              │  FONTES DE DADOS     │
│                      │              │                      │
│  ┌────────────────┐  │              │ ┌──────────────────┐│
│  │ Bronze         │  │              │ │ Repositórios da  ││
│  │ Raw JSON       │  │◄─────────────┼─│ Organização      ││
│  └────────────────┘  │  GitHub API  │ └──────────────────┘│
│         │            │              │                      │
│         │ ETL Transform             │ ┌──────────────────┐│
│         ▼            │              │ │ Issues/PRs       ││
│  ┌────────────────┐  │              │ └──────────────────┘│
│  │ Silver         │  │              │                      │
│  │ Normalized     │  │              │ ┌──────────────────┐│
│  └────────────────┘  │              │ │ Commits/Events   ││
│         │            │              │ └──────────────────┘│
│         │ Aggregate                 │                      │
│         ▼            │              └──────────────────────┘
│  ┌────────────────┐  │                       │
│  │ Gold           │  │         GitHub Actions Daily ETL
│  │ KPIs           │  │         ┌────────────▼─────────────┐
│  └────────────────┘  │         │ Processamento            │
└──────────────────────┘         │ Bronze→Silver→Gold       │
                                 └──────────────────────────┘
```

### Fluxo de Dados

1. **Extração (Bronze)**
   - GitHub Actions trigger diário (cron: 0 6 * * *)
   - Python scripts executam ETL
   - Dados brutos salvos em JSON

2. **Transformação (Silver)**
   - Leitura dos dados Bronze
   - Normalização em tabelas dimensionais
   - Modelo relacional com foreign keys

3. **Agregação (Gold)**
   - Cálculo de KPIs
   - Métricas agregadas
   - Dados prontos para consumo

4. **Visualização (Frontend)**
   - Dashboard React acessa dados Gold
   - Visualizações D3.js interativas
   - Análises avançadas com IA

---

## 🔄 Diagrama de Sequência

### Fase 1: Extração - Bronze (Raw Data)

```
┌─────────────┐  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐
│GitHub API   │  │GitHub Actions │  │Python Scripts│  │Bronze Layer │
└──────┬──────┘  └───────┬───────┘  └──────┬───────┘  └──────┬──────┘
       │                 │                  │                 │
       │    Daily Trigger (Cron: 0 6 * * *)│                 │
       │                 ├─────────────────►│                 │
       │                 │   Execute ETL    │                 │
       │                 │      Script      │                 │
       │                 │                  │                 │
       │◄────────────────┼──────────────────┤                 │
       │  Get Organization Data             │                 │
       ├─────────────────┼──────────────────►                 │
       │ Organization info, Members         │                 │
       │                 │                  │                 │
       │◄────────────────┼──────────────────┤                 │
       │  Get Repositories                  │                 │
       ├─────────────────┼──────────────────►                 │
       │ Repository list + metadata         │                 │
       │                 │                  │                 │
       │◄────────────────┼──────────────────┤                 │
       │  Get Issues/PRs/Commits            │                 │
       ├─────────────────┼──────────────────►                 │
       │ Raw events data                    │                 │
       │                 │                  │                 │
       │                 │                  ├────────────────►│
       │                 │              Store Raw JSON        │
       │                 │                  │                 │
       │                 │◄─────────────────┤                 │
       │                 │ Append-only storage with timestamp │
       │                 │                  │                 │
       │                 │◄─────────────────┼─────────────────┤
       │                 │    Storage confirmed               │
```

### Fase 2: Transformação - Silver (Normalized)

```
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│Bronze Layer │  │Python Scripts│  │Silver Layer │
└──────┬──────┘  └──────┬───────┘  └──────┬──────┘
       │                │                 │
       │◄───────────────┤                 │
       │  Read Raw Data │                 │
       ├────────────────►                 │
       │ JSON payloads  │                 │
       │                │                 │
       │                │  Parse & Normalize:    │
       │                │  - dim_users           │
       │                │  - dim_repos           │
       │                │  - fact_commits        │
       │                │  - fact_prs            │
       │                │  - fact_issues         │
       │                │  - fact_reviews        │
       │                │                 │
       │                ├────────────────►│
       │                │ Store Normalized Tables
       │                │                 │
       │                │◄────────────────┤
       │                │ Relational model
       │                │ with foreign keys
       │                │                 │
       │                │◄────────────────┤
       │                │ Normalization confirmed
```

### Fase 3: Agregação - Gold (KPIs)

```
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│Silver Layer │  │Python Scripts│  │ Gold Layer  │
└──────┬──────┘  └──────┬───────┘  └──────┬──────┘
       │                │                 │
       │◄───────────────┤                 │
       │ Query Normalized Data            │
       ├────────────────►                 │
       │ Structured data│                 │
       │                │                 │
       │                │ Calculate KPIs:        │
       │                │ - Throughput metrics   │
       │                │ - Code quality indices │
       │                │ - Contribution analysis│
       │                │ - Distribution indices │
       │                │                 │
       │                ├────────────────►│
       │                │ Store KPIs & Visualizations
       │                │                 │
       │                │◄────────────────┤
       │                │ Ready-to-consume
       │                │ metrics for dashboard
       │                │                 │
       │◄───────────────┤                 │
       │   ETL Complete │                 │
       │                │                 │
       │                │  KPIs saved     │
```

### Fase 4: Consumo pelo Dashboard

```
┌──────────────┐  ┌─────────────┐  ┌─────────────┐
│Dashboard UI  │  │ Gold Layer  │  │   Users     │
└──────┬───────┘  └──────┬──────┘  └──────┬──────┘
       │                 │                │
       │◄────────────────┤                │
       │ Access Dashboard│                │
       │                 │                │
       │                 │  Fetch KPIs (GitHub API)
       │◄────────────────┤                │
       │ JSON KPIs + metadata             │
       │ [Métricas Análises]              │
       │                 │                │
       │ Direct access to Silver data    │
       │◄────────────────┤                │
       │ Raw structured data              │
       │                 │                │
       │  Custom analysis│                │
       │  Network graphs │                │
       │  Collaboration  │                │
       │                 │                │
       │  Interactive visualizations     │
       ├─────────────────┼────────────────►
       │                 │   Pesquisável avançado
```

### Error Handling & Monitoring

```
┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│GitHub API    │  │Python Scripts│ │GitHub Issues │
└──────┬───────┘  └──────┬──────┘  └──────┬───────┘
       │                 │                │
       │  [API Rate Limit]                │
       ├────────────────►│                │
       │  403 Rate Limited│                │
       │                 │                │
       │                 │ Wait & Retry with backoff
       │◄────────────────┤                │
       │                 │                │
       │  [Processing Error]              │
       │                 ├────────────────►
       │                 │ Log error + Continue
       │                 │                │
       │                 ├────────────────►
       │                 │ Notification via GitHub Issues
```

---

## 📦 Camadas de Dados

### Bronze Layer
**Localização:** `data/bronze/`

**Estrutura:**
```
bronze/
├── organizations/
│   └── unb-mds.json
├── repositories/
│   ├── repo1_metadata.json
│   ├── repo2_metadata.json
│   └── ...
├── issues/
│   ├── repo1_issues.json
│   └── ...
└── commits/
    ├── repo1_commits.json
    └── ...
```

**Características:**
- Dados brutos sem transformação
- Append-only (histórico preservado)
- Timestamp de extração
- Cache para reduzir chamadas à API

---

### Silver Layer
**Localização:** `data/silver/`

**Estrutura:**
```
silver/
├── dim_users.json
├── dim_repos.json
├── fact_commits.json
├── fact_prs.json
├── fact_issues.json
└── fact_reviews.json
```

**Modelo Relacional:**
```
dim_users
├── user_id (PK)
├── username
├── name
└── email

dim_repos
├── repo_id (PK)
├── name
├── description
└── languages

fact_commits
├── commit_id (PK)
├── repo_id (FK)
├── user_id (FK)
├── timestamp
└── stats

fact_prs
├── pr_id (PK)
├── repo_id (FK)
├── author_id (FK)
├── reviewer_id (FK)
└── status

fact_issues
├── issue_id (PK)
├── repo_id (FK)
├── creator_id (FK)
└── status
```

---

### Gold Layer
**Localização:** `data/gold/`

**Estrutura:**
```
gold/
├── kpis/
│   ├── velocity_metrics.json
│   ├── quality_scores.json
│   └── contribution_analysis.json
└── visualizations/
    ├── treemap_data.json
    ├── network_graph.json
    └── timeline_data.json
```

**KPIs Calculados:**
- 📊 Velocity (commits/dia, PRs/semana)
- 📈 Throughput (issues fechadas/sprint)
- 🎯 Code quality indices
- 👥 Contribution distribution
- 🔄 Collaboration metrics

---

## 🛠️ Tecnologias

### Backend
- **Python 3.11+**
  - Scripts ETL
  - GitHub API client
  - Pandas para transformações

### Automação
- **GitHub Actions**
  - Daily trigger (cron: 0 6 * * *)
  - ETL pipeline automatizado
  - Notificações de erro

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **D3.js** (visualizações)
  - Treemap (estrutura de arquivos)
  - CirclePack (visualização alternativa)
  - Network graphs (colaboração)
- **Tailwind CSS** (estilização)
- **Hospedagem:** Firebase Platform / Netlify

### APIs
- **GitHub REST API**
  - Rate limit: 5000 req/hora (authenticated)
  - Cache para otimização
  
### Armazenamento
- **GitHub Repository**
  - Arquivos JSON versionados
  - Histórico completo de dados

### IA (Em Progresso - Sprint 15)
- **RAG** (Retrieval-Augmented Generation)
- **LLM APIs:**
  - Google Gemini API (principal)
  - OpenAI (alternativa)
  - Claude (alternativa)
- **Funcionalidades:**
  - Análise de qualidade de código
  - Contextualização de métricas
  - Insights automáticos
  - Análise de commits e PRs

---

## 🖼️ Diagramas Visuais

### Topologia Simplificada
![Topologia](./arquitetura/topologia.png)

### Arquitetura Completa
![Arquitetura Completa](./arquitetura/arquitetura-completa.png)

### Diagrama de Sequência
![Diagrama de Sequência](./arquitetura/diagrama-sequencia.png)

> **Nota:** Para visualizar os diagramas completos em alta resolução, consulte a pasta `docs/arquitetura/` ou o arquivo `Template MDS.png`

---

## 📝 Decisões Arquiteturais

### ADR-001: Arquitetura Medallion
**Status:** ✅ Aceito  
**Contexto:** Necessidade de processamento incremental de grandes volumes de dados  
**Decisão:** Adotar arquitetura Medallion (Bronze/Silver/Gold)  
**Consequências:**
- ✅ Separação clara de responsabilidades
- ✅ Reprocessamento seletivo possível
- ⚠️ Maior complexidade inicial

### ADR-002: GitHub Actions para ETL
**Status:** ✅ Aceito  
**Contexto:** Necessidade de automação de extração diária  
**Decisão:** Usar GitHub Actions com cron trigger  
**Consequências:**
- ✅ Zero custo de infraestrutura
- ✅ Integração nativa com repositório
- ⚠️ Limitações de tempo de execução (6h max)

### ADR-003: REST API ao invés de GraphQL
**Status:** ✅ Aceito (Semana 14)  
**Contexto:** GraphQL tinha performance ruim para extração de estrutura  
**Decisão:** Usar REST API com `?recursive=1` para árvore de arquivos  
**Consequências:**
- ✅ 100x mais rápido que GraphQL
- ✅ Single request ao invés de múltiplos
- ⚠️ Menos flexibilidade em queries complexas

### ADR-004: D3.js para Visualizações
**Status:** ✅ Aceito (Sprint 14 - PR #97)  
**Contexto:** Necessidade de visualizações hierárquicas complexas  
**Decisão:** Usar D3.js para Treemap e CirclePack  
**Consequências:**
- ✅ Visualizações profissionais e interativas
- ✅ Flexibilidade total de customização
- ⚠️ Curva de aprendizado alta

### ADR-005: JSON como Storage
**Status:** ✅ Aceito  
**Contexto:** Necessidade de armazenamento simples e versionado  
**Decisão:** Usar arquivos JSON no próprio repositório  
**Consequências:**
- ✅ Versionamento automático via Git
- ✅ Fácil inspeção e debug
- ✅ Zero infraestrutura de BD
- ⚠️ Não escalável para volumes muito grandes

### ADR-006: Firebase/Netlify para Hospedagem Frontend
**Status:** ✅ Aceito (Sprint 14)  
**Contexto:** Necessidade de hospedagem rápida e gratuita para frontend  
**Decisão:** Usar Firebase Platform ou Netlify para deploy  
**Consequências:**
- ✅ Deploy automático integrado com Git
- ✅ CDN global (baixa latência)
- ✅ HTTPS gratuito
- ✅ Tier gratuito suficiente para o projeto
- ⚠️ Vendor lock-in parcial

### ADR-007: Google Gemini API para IA
**Status:** 🔄 Em Progresso (Sprint 15)  
**Contexto:** Necessidade de análise inteligente de métricas e código  
**Decisão:** Usar Google Gemini API como LLM principal  
**Consequências:**
- ✅ API gratuita com limites generosos
- ✅ Suporte a português nativo
- ✅ Baixa latência (Google Cloud)
- ⚠️ Requer gerenciamento de API keys
- ⚠️ Custos potenciais em escala

---

## 🔒 Segurança

### Credenciais
- ✅ GitHub Token em variáveis de ambiente
- ✅ `.secrets` no `.gitignore`
- ✅ Permissões mínimas necessárias (read-only)

### Rate Limiting
- ✅ Verificação proativa de rate limits
- ✅ Backoff exponencial em caso de 403
- ✅ Cache agressivo para reduzir chamadas

### Dados Sensíveis
- ✅ Nenhum dado sensível armazenado
- ✅ Apenas métricas públicas do GitHub

---

## 📊 Monitoramento

### Logs
- GitHub Actions logs completos
- Timestamps de cada fase ETL
- Erros capturados e notificados

### Métricas
- Taxa de sucesso de ETL
- Tempo de processamento por camada
- Taxa de cache hit

### Alertas
- Notificação via GitHub Issues em caso de erro
- Rate limit warnings

---

## 🚀 Escalabilidade

### Limitações Atuais
- ⚠️ GitHub Actions: 6h max execution time
- ⚠️ JSON storage: ~100MB recomendado
- ⚠️ Rate limit: 5000 req/hora

### Planos Futuros
- Migração para banco de dados (PostgreSQL) se necessário
- Processamento paralelo de repositórios
- Cache distribuído (Redis)

---

## 📚 Referências

- [Documentação GitHub API](https://docs.github.com/en/rest)
- [Medallion Architecture](https://www.databricks.com/glossary/medallion-architecture)
- [D3.js Documentation](https://d3js.org/)
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)

---

**Arquitetos:** Equipe CoOps
**Última Revisão:** 01/12/2025
