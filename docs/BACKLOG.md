# 📋 Product Backlog - CoOps

**Projeto:** Análise de Métricas de Repositórios GitHub  
**Última Atualização:** 01/12/2025

---

## 🎯 Visão do Produto

Sistema de análise e visualização de métricas de repositórios da organização UnB no GitHub, permitindo comparação entre projetos, análise de qualidade de código e geração de insights através de IA.

---

## 📊 Épicos do Projeto

### 🟣 Épico 1: Acesso ao Sistema
Funcionalidades relacionadas à autenticação e autorização de usuários no sistema.

### 🟣 Épico 2: Geração de Métricas
Extração, processamento e armazenamento de métricas dos repositórios GitHub.

### 🟣 Épico 3: Análise Comparativa dentro da Organização
Comparação de métricas entre repositórios de um time/organização.

### 🟣 Épico 4: Agente de IA
Contextualização e análise inteligente das métricas através de IA.

---

## 📦 Backlog por Épico

---

## 🟣 ÉPICO 1: Acesso ao Sistema

### US-001: Fork do Repositório e Atualização de Credenciais
**Como** usuário gestor de organização  
**Quero** forkar o repositório para minha organização e atualizar as credenciais  
**Para** utilizar o sistema e configurar o acesso à minha organização

**Prioridade:** 🔴 Must Have  
**Story Points:** 5  
**Status:** ✅ Concluído (Sprint 4-5)

**Critérios de Aceitação:**
- [ ] DADO que sou gestor de uma organização
- [ ] QUANDO faço fork do repositório oficial
- [ ] ENTÃO o sistema permite atualizar credenciais
- [ ] E as credenciais são armazenadas de forma segura
- [ ] E posso acessar repositórios da minha organização

**Notas Técnicas:**
- Arquivo `.secrets` ou variáveis de ambiente
- GitHub Token com permissões adequadas
- Documentação de setup no README

---

### US-002: Obter Dados de uma Organização
**Como** usuário do sistema  
**Quero** obter dados de uma organização específica  
**Para** fornecer os dados que serão usados na geração de métricas e suas análises

**Prioridade:** 🔴 Must Have  
**Story Points:** 8  
**Status:** ✅ Concluído (Sprint 6-9)

**Critérios de Aceitação:**
- [ ] DADO que as credenciais de acesso ao GitHub foram fornecidas
- [ ] QUANDO a aplicação é executada
- [ ] ENTÃO os dados da organização são coletados via GitHub API
- [ ] E a aplicação pode listar os repositórios da organização
- [ ] E pode acessar informações gerais dos repositórios

**Implementação:**
- ✅ `src/bronze/repository_structure.py`
- ✅ `src/utils/github_api.py`
- ✅ GitHub Actions automatizado

---

## 🟣 ÉPICO 2: Geração de Métricas

### US-003: Visualização de Diretórios/Pastas do Projeto
**Como** usuário do sistema  
**Quero** visualizar os diretórios/pastas do projeto e extensões dos arquivos  
**Para** entender a estrutura do projeto

**Prioridade:** 🟡 Should Have  
**Story Points:** 5  
**Status:** ✅ Concluído (Sprint 14 - PR #97)

**Critérios de Aceitação:**
- [ ] DADO que estou na sessão de visualização de projeto
- [ ] QUANDO eu seleciono um projeto
- [ ] ENTÃO o sistema exibe os diretórios/pastas em uma estrutura hierárquica
- [ ] E posso expandir/retrair diretórios
- [ ] E as extensões dos arquivos são exibidas

**Implementação:**
- ✅ Treemap D3.js (RepoTreemap component)
- ✅ CirclePack visualization
- ✅ VisualizationTabs para alternância

---

### US-004: Gerar Gráficos e Dashboards - Issues
**Como** gestor de organização  
**Quero** ver métricas relacionadas às issues  
**Para** acompanhar as ações do time PARA visualizar e analisar a quantidade de issues abertas ao longo do tempo dentro da organização

**Prioridade:** 🟡 Should Have  
**Story Points:** 8  
**Status:** 🔄 Em Progresso (Sprint 15)

**Critérios de Aceitação:**
- [ ] DADO que estou na sessão de métricas relacionadas às issues
- [ ] QUANDO eu acesso as métricas de issues
- [ ] ENTÃO eu posso ver um gráfico da quantidade de issues abertas ao longo do tempo dentro da organização
- [ ] E o gráfico é interativo (zoom, filtros)
- [ ] E posso visualizar métricas individuais por repositório

**Notas Técnicas:**
- Dashboard com gráficos de linha/barra
- Filtros por repositório, período, status
- Dados da camada Silver/Gold

---

### US-005: Gerar Gráficos e Dashboards - Pull Requests
**Como** gestor de organização  
**Quero** ver métricas relacionadas aos PRs  
**Para** acompanhar as ações do time PARA visualizar e analisar a quantidade de PRs ao longo do tempo

**Prioridade:** 🟡 Should Have  
**Story Points:** 8  
**Status:** 🔄 Em Progresso (Sprint 15)

**Critérios de Aceitação:**
- [ ] DADO que estou na sessão de métricas relacionadas aos PRs
- [ ] QUANDO eu acesso as métricas de PRs
- [ ] ENTÃO eu posso ver gráficos de PRs abertos, fechados, merged
- [ ] E visualizo tempo médio de review
- [ ] E posso filtrar por repositório e período

---

### US-006: Gerar Gráficos e Dashboards - Commits
**Como** gestor de organização  
**Quero** ver métricas relacionadas aos commits  
**Para** avaliar a produtividade e eficiência da equipe ao longo do tempo

**Prioridade:** 🟡 Should Have  
**Story Points:** 8  
**Status:** ✅ Concluído (Sprint 14 - PR #97)

**Critérios de Aceitação:**
- [ ] DADO que estou na sessão de métricas relacionadas aos commits
- [ ] QUANDO eu acesso as métricas de commits
- [ ] ENTÃO visualizo quantidade de commits ao longo do tempo
- [ ] E vejo métricas de curva de commits
- [ ] E posso comparar commits entre repositórios

**Implementação:**
- ✅ Extração de commits (`src/bronze/commits.py`)
- ✅ Processamento Silver layer
- ✅ Visualizações frontend

---

### US-007: Gerar Gráficos e Dashboards - Colaboração entre Usuários
**Como** gestor de organização  
**Quero** ver métricas relacionadas à colaboração entre usuários  
**Para** avaliar o trabalho em equipe PARA visualizar e analisar a colaboração entre os usuários

**Prioridade:** 🟢 Could Have  
**Story Points:** 13  
**Status:** ⏸️ Backlog

**Critérios de Aceitação:**
- [ ] DADO que estou na sessão de métricas relacionadas à colaboração
- [ ] QUANDO eu acesso essas métricas
- [ ] ENTÃO vejo gráficos de rede de colaboração
- [ ] E visualizo quais usuários mais revisam PRs uns dos outros
- [ ] E vejo estatísticas de pair programming/co-autoria

**Notas Técnicas:**
- Graph visualization (D3.js force-directed graph)
- Análise de co-autoria em commits
- Análise de reviews em PRs

---

## 🟣 ÉPICO 3: Análise Comparativa dentro da Organização

### US-008: Comparar Métricas entre Repositórios
**Como** usuário gestor de organização  
**Quero** poder comparar as métricas de contribuição de diferentes repositórios em uma organização  
**Para** poder avaliar a produtividade entre diferentes repositórios

**Prioridade:** 🟡 Should Have  
**Story Points:** 13  
**Status:** ⏸️ Backlog (*despriorizado*)

**Critérios de Aceitação:**
- [ ] DADO que estou na página principal de uma organização
- [ ] QUANDO eu seleciono a opção de comparar métricas dos repositórios selecionados
- [ ] ENTÃO poderei ver as métricas principais comparadas lado a lado

**Notas:**
- Feature planejada mas despriorizada
- Pode ser implementada em versões futuras
- Requer UI de seleção múltipla de repos

---

## 🟣 ÉPICO 4: Agente de IA

### US-009: Contextualização das Métricas por IA (RAG)
**Como** gestor de organização  
**Quero** ver análises feitas sobre as descrições das issues  
**Para** analisar e verificar se as issues estão sendo feitas de forma adequada e seguindo os padrões da metodologia ágil

**Prioridade:** 🔴 Must Have  
**Story Points:** 13  
**Status:** 🔄 Em Progresso (Sprint 15)

**Critérios de Aceitação:**
- [ ] DADO que estou na sessão de métricas relacionadas a issues
- [ ] QUANDO eu acesso as métricas de qualidade das issues
- [ ] ENTÃO será mostrada uma análise feita por IA sobre a qualidade da descrição das issues (critérios como se está bem definido, se trata de um bug, se tem passos para reprodução)
- [ ] E as métricas são contextualizadas via RAG
- [ ] E posso passar para o LLM as métricas da organização

**Notas Técnicas:**
- RAG (Retrieval-Augmented Generation)
- Integração com LLM (OpenAI, Claude, etc.)
- Análise de qualidade de issues/PRs

---

### US-010: Receber 'Insights' das Métricas via IA
**Como** usuário (qualquer)  
**Quero** receber 'insights' de uma IA sobre as métricas  
**Para** entender o impacto que elas têm no projeto

**Prioridade:** 🟡 Should Have  
**Story Points:** 8  
**Status:** 🔄 Em Progresso (Sprint 15)

**Critérios de Aceitação:**
- [ ] DADO que estou visualizando um dashboard gráfico das métricas
- [ ] QUANDO eu clico no botão "Explicar com IA"
- [ ] ENTÃO um texto explicativo é exibido, contextualizando as métricas
- [ ] E o significado do resultado pode indicar sobre o progresso da equipe

**Notas Técnicas:**
- Botão "Explain with AI" nos dashboards
- Prompt engineering para contexto adequado
- Respostas em português

---

### US-011: Análise de Qualidade de Código por IA
**Como** gestor da organização  
**Quero** receber um relatório feito por uma IA sobre a qualidade do código entregue em commits e pull requests  
**Para** entender qual é a qualidade dos commits e PRs feitos

**Prioridade:** 🟡 Should Have  
**Story Points:** 13  
**Status:** 🔄 Em Progresso (Sprint 15)

**Critérios de Aceitação:**
- [ ] DADO que estou na página de visualização de qualidade de código
- [ ] QUANDO eu seleciono a opção de análise de código por IA
- [ ] ENTÃO irei receber um relatório feito pelo agente de IA que me diz o a qualidade dos commits e PRs enviados
- [ ] E o relatório contém um score geral de 0 a 100
- [ ] E há análises de métricas individuais (complexidade, duplicação, etc.)

**Notas Técnicas:**
- Análise estática de código
- Integração com IA para interpretação
- Score de qualidade por commit/PR

---

## 📊 Resumo do Backlog

### Por Status
- ✅ **Concluído:** 4 histórias (US-001, US-002, US-003, US-006)
- 🔄 **Em Progresso:** 4 histórias (US-004, US-005, US-009, US-010, US-011)
- ⏸️ **Backlog:** 2 histórias (US-007, US-008)

### Por Prioridade (MoSCoW)
- 🔴 **Must Have:** 3 histórias (27% - 26 pts)
- 🟡 **Should Have:** 7 histórias (64% - 75 pts)
- 🟢 **Could Have:** 1 história (9% - 13 pts)

### Por Story Points
- **Total:** 114 story points
- **Concluído:** 26 pontos (23%)
- **Em Progresso:** 55 pontos (48%)
- **Backlog:** 33 pontos (29%)

---

## 🎯 Roadmap de Releases

### ✅ Release 1 (Sprint 9 - 26/10/2025)
- ✅ US-001: Fork e credenciais
- ✅ US-002: Obter dados da organização
- ✅ US-006: Métricas de commits
- ✅ Pipeline Bronze → Silver operacional

### ✅ Release 2 (Sprint 15 - 07/12/2025)
- ✅ US-003: Visualização de estrutura (Treemap/CirclePack)
- 🔄 US-004: Dashboards de issues
- 🔄 US-005: Dashboards de PRs
- 🔄 US-009: IA - Contextualização (RAG)
- 🔄 US-010: IA - Insights
- 🔄 US-011: IA - Análise de qualidade

### 🔮 Backlog Futuro
- ⏸️ US-007: Colaboração entre usuários
- ⏸️ US-008: Comparação entre repositórios

---

## 📝 Notas de Planejamento

### Decisões Técnicas
- **Arquitetura:** Medallion (Bronze → Silver → Gold)
- **Frontend:** React + TypeScript + Vite + D3.js
- **Backend:** Python + GitHub API
- **CI/CD:** GitHub Actions
- **IA:** RAG + LLM (OpenAI/Claude)

### Dívida Técnica Reconhecida
- 🚨 **Testes unitários:** Zero cobertura até Sprint 14
- 🔄 **Testes em implementação:** Sprint 15 focada em cobertura completa

### Riscos
- ⚠️ **Integração IA:** Depende de APIs externas (custos, rate limits)
- ⚠️ **GitHub API Rate Limits:** Gerenciado com cache e otimizações

---

**Scrum Master:** Pedro Druck  
**Equipe:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Rocha

**Última Revisão:** 01/12/2025
