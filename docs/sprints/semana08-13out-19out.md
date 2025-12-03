# Sprint - Semana 8 (13/10 a 19/10/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- Migrar de Next.js para React + Vite
- Implementar nova navegação com RepositoryToolbar
- Melhorar experiência de desenvolvimento
- Preparar para Release 1

### Issues/PRs Planejados
- #61: Migração Next.js → React + Vite
- #63: Nova navegação (RepositoryToolbar + Sidebar)

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #61 - Migração Next.js → Vite
- **Merged:** 15/10/2025
- **Principais mudanças:**
  - Stack completa migrada: Next.js → React puro + Vite
  - React Router substituiu roteamento baseado em arquivos
  - HMR muito mais rápido no desenvolvimento
  - Estrutura simplificada (src/, components/, pages/)

#### PR #63 - Nova Navegação
- **Merged:** 16/10/2025
- **Funcionalidades:**
  - RepositoryToolbar com abas (Issues, Commits, PRs, Collaboration, Structure)
  - Seletor de repositórios com query string (?repo=)
  - Sidebar ajustada para melhor alinhamento
  - UI padronizada em inglês

### Métricas da Sprint

- **Commits:** ~30 commits
- **Pull Requests Merged:** 2 PRs grandes (#61, #63)
- **Issues Fechadas:** Migração de stack completa
- **Contribuidores Ativos:** 4 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **Migração bem-sucedida:** PR #61 mudou stack sem quebrar funcionalidades
2. **HMR muito mais rápido:** Desenvolvimento acelerado com Vite
3. **Navegação implementada:** PR #63 trouxe RepositoryToolbar completo
4. **UX melhorada:** Seletor de repositórios com query string funcionando

### 🟡 O que pode melhorar (Improve)
1. **Migração gradual:** Poderia ter sido feita em etapas menores
2. **Testes de UI:** Validar componentes de navegação
3. **Performance:** Testar navegação com muitos repositórios

### 🔴 Problemas identificados (Problems)
1. **Grande mudança de stack:** Risco de bugs inesperados
2. **Alinhamento visual:** Sidebar e Toolbar precisam refinamento
3. **Documentação de componentes:** Novos componentes precisam docs

### 📊 Ações para Próxima Sprint
- Testar nova stack em produção
- Validar navegação com usuários
- Continuar implementação de features

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- Migração Next.js → Vite bem-sucedida
- Filtros implementados com sucesso
- Bronze ilimitado funcionando

**🟡 O que pode melhorar:**
- 72 commits indica sprint muito intensa
- Risco de burnout do time
- Precisa equilibrar ritmo

**🔧 Ações de melhoria:**
- Próxima sprint: ritmo mais sustentável
- Distribuir melhor as tarefas
- Monitorar carga de trabalho

**🌟 Kudos:**
- 👏 Trabalho incrível do time, mas cuidado com o ritmo!
- Migração de stack foi corajosa e bem executada

---

## 🔗 Links Relevantes
- [GitHub Actions - Pipeline Bronze](https://github.com/unb-mds/2025-2-Squad-01/actions)
- [Commits desta sprint](https://github.com/unb-mds/2025-2-Squad-01/commits?since=2025-10-13&until=2025-10-19)

---

**Scrum Master:** Pedro Druck  
**Equipe:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Rocha

**Data da Retrospectiva:** 19/10/2025

**⚠️ ALERTA DO SM:** Sprint produtiva mas ritmo insustentável. Próxima sprint precisa focar em qualidade e saúde do time.
