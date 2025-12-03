# Sprint - Semana 11 (03/11 a 09/11/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- Implementar página de colaboração com visualizações
- Ajustar roteamento para /repos/collaboration
- Corrigir bugs de atualização de estado
- Melhorar visualizações de rede e heatmap

### Issues/PRs Planejados
- #68: Página de visão geral/colaboração
- #75: Ajuste de rota para /repos/collaboration
- #82: Correção de bug de atualização

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #68 - Página de Colaboração (25/out)
- **Funcionalidades:**
  - Dashboard centralizado com métricas agregadas
  - CollaborationNetworkGraph (grafo interativo)
  - ActivityHeatmap (mapa de calor temporal)
  - Sistema de loading e tratamento de erros
  - Processamento de dados de atividades

#### PR #75 - Ajuste de Rota (1/nov)
- **Mudança:** RepoHomePage → CollaborationPage
- **Nova rota:** /repos/collaboration
- **Atualização:** Botão 'Ver Métricas' na home

#### PR #82 - Correção de Bug
- **Problema resolvido:** Gráficos não atualizavam ao selecionar repositório
- **Impacto:** Sincronização correta de estado

### Métricas da Sprint

- **Commits:** ~25 commits
- **Pull Requests Merged:** 3 PRs (#68, #75, #82)
- **Issues Fechadas:** Página de colaboração completa
- **Contribuidores Ativos:** 3-4 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **Página de colaboração:** PR #68 implementou dashboard centralizado
2. **Grafo interativo:** Rede de colaboração funcionando
3. **Heatmap de atividade:** Visualização temporal implementada
4. **Rota ajustada:** PR #75 moveu para /repos/collaboration
5. **Estados de loading:** Tratamento de erros bem implementado

### 🟡 O que pode melhorar (Improve)
1. **Performance do grafo:** Testar com muitos nós
2. **Interatividade:** Adicionar zoom e pan no grafo
3. **Legenda:** Explicar cores e tamanhos dos nós

### 🔴 Problemas identificados (Problems)
1. **Bug na atualização:** PR #82 corrigiu bug de não atualização
2. **Sincronização de estado:** Grafo não reagia a mudança de repositório
3. **Complexidade visual:** Muitos colaboradores podem poluir grafo

### 📊 Ações para Próxima Sprint
- Implementar features grandes (otimizações)
- Melhorar comunicação em issues/PRs
- Priorizar entregas com impacto visível

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- Página de colaboração implementada
- Grafo interativo funcionando
- Rota ajustada corretamente

**🟡 O que pode melhorar:**
- Falta direção mais clara nas entregas
- Precisa de features maiores com impacto

**🔧 Ações de melhoria:**
- Próxima sprint: definir feature grande como objetivo
- Melhorar comunicação em issues/PRs

**🌟 Kudos:**
- Dashboard de colaboração ficou excelente!
- Visualizações interativas são de alta qualidade

---

## 🔗 Links Relevantes
- [Pipeline Bronze](https://github.com/unb-mds/2025-2-Squad-01/actions)
- [Pipeline Silver](https://github.com/unb-mds/2025-2-Squad-01/actions)
