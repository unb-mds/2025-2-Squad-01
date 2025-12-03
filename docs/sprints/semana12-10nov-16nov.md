# Sprint - Semana 12 (10/11 a 16/11/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- Migrar extração de commits para GraphQL para otimização de performance
- Reduzir consumo de rate limit significativamente (economia de requisições)
- Adicionar métricas detalhadas de linhas adicionadas/removidas por commit
- Corrigir bugs identificados na página de colaboração

### Issues/PRs Planejados
- #78: Implementação de GraphQL para extração de commits
- #82: Correção de bug na página de colaboração

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #78 - GraphQL para Commits (1/nov)
- **Principais mudanças:**
  - Novo método graphql() no GitHubAPIClient com cache e retry
  - graphql_commit_history() com paginação automática
  - Redução significativa de consumo de rate limit
  - Métricas de linhas adicionadas/removidas sem requests extras
  - Flag --commits-method (rest|graphql)
  - Fallback automático REST quando GraphQL falha
  - Retry automático com backoff exponencial
  - Correção de erro de sintaxe no temporal_analysis.py

#### Pipeline Otimizado
- Workflow Bronze Extract configurado para usar GraphQL por padrão
- Extração de todo histórico sem limites artificiais

### Métricas da Sprint

- **Commits:** ~30 commits
- **Pull Requests Merged:** 1 PR grande (#78)
- **Issues Fechadas:** Otimização de extração GraphQL
- **Contribuidores Ativos:** 3-4 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **GraphQL implementado:** PR #78 reduziu consumo de rate limit
2. **Métricas de linhas:** Adições/remoções por commit sem requests extras
3. **Fallback automático:** GraphQL → REST quando necessário
4. **Retry logic:** Backoff exponencial funcionando
5. **Bug corrigido:** PR #82 resolveu problema na página de colaboração

### 🟡 O que pode melhorar (Improve)
1. **Documentação GraphQL:** Documentar queries e schemas
2. **Timeout configurável:** Permitir ajuste de timeout
3. **Logs mais detalhados:** Melhorar debugging

### 🔴 Problemas identificados (Problems)
1. **Complexidade aumentada:** GraphQL + REST aumenta complexidade
2. **502 Bad Gateway:** GitHub GraphQL ainda tem problemas ocasionais
3. **Rate limit diferente:** GraphQL tem limites diferentes do REST

### 📊 Ações para Próxima Sprint
- Documentar queries e schemas GraphQL
- Melhorar timeout configurável
- Adicionar logs mais detalhados para debugging

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- GraphQL implementado reduzindo rate limit
- Métricas de linhas adicionadas/removidas
- Fallback automático REST funcionando

**🟡 O que pode melhorar:**
- Documentação GraphQL precisa melhorar
- Complexidade aumentou (GraphQL + REST)

**🔧 Ações de melhoria:**
- Documentar queries e schemas
- Adicionar exemplos de uso
- Melhorar logs de debugging

**🌟 Kudos:**
- Excelente trabalho na otimização de API!
- Retry logic com backoff ficou profissional

---

## 🔗 Links Relevantes
- [Commits da sprint](https://github.com/unb-mds/2025-2-Squad-01/commits?since=2025-11-10&until=2025-11-16)
- [Pipeline Actions](https://github.com/unb-mds/2025-2-Squad-01/actions)
