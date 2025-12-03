# Sprint - Semana 10 (27/10 a 02/11/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- Implementar padronização de código com Prettier para manter consistência
- Criar páginas dedicadas de análise de Pull Requests e Issues com visualizações
- Adicionar protótipo de alta fidelidade no Figma para guiar desenvolvimento
- Refatorar componentes para maior reutilização e manutenibilidade do código

### Issues/PRs Planejados
- #69: Integração do Prettier + refatorações
- #60: Página de análise de Pull Requests
- #64: Página de Issues + componentes reutilizáveis
- #66: Protótipo Figma + documentação

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #69 - Code Formatting (18/out)
- **Entregas:**
  - Prettier configurado (.prettierrc e .prettierignore)
  - Scripts de formatação (format, format:check)
  - Componente BaseFilters reutilizável
  - Refatoração de componentes (DashboardLayout, Graphs)

#### PR #60 - Página de Pull Requests (19/out)
- **Funcionalidades:**
  - Histograma de timeline de atividade de PRs
  - Gráfico de pizza de colaboradores
  - Painel de estatísticas (Total PRs, Colaboradores, Período)
  - Filtros de membros e timeline integrados
  - Extração de 26.399 eventos de todos os 73 repositórios

#### PR #64 - Página de Issues (20/out)
- **Entregas:**
  - Página completa de análise de issues
  - Componentes genéricos reutilizáveis (Histogram.tsx, PieChart.tsx)
  - Diferenciação visual (Commits: azul, Issues: verde)
  - Total de 3.067 eventos de issues processados

#### PR #66 - Protótipo e Documentação (20/out)
- **Entregas:**
  - Seção de protótipo Figma integrada
  - Grid de documentação com links
  - Correção de .gitignore (remoção de arquivos .next/)

### Métricas da Sprint

- **Commits:** ~40 commits
- **Pull Requests Merged:** 4 PRs grandes (#69, #60, #64, #66)
- **Issues Fechadas:** Páginas de PRs e Issues completas
- **Contribuidores Ativos:** 4 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **Code formatting:** PR #69 padronizou todo o código com Prettier
2. **Página de PRs:** PR #60 implementou análise completa de pull requests
3. **Página de Issues:** PR #64 com componentes reutilizáveis
4. **Componentes genéricos:** Histogram e PieChart reutilizáveis
5. **Protótipo Figma:** PR #66 documentou design

### 🟡 O que pode melhorar (Improve)
1. **Performance:** Testar com 26k+ eventos
2. **Diferenciação visual:** Manter cores consistentes
3. **Acessibilidade:** Adicionar labels ARIA

### 🔴 Problemas identificados (Problems)
1. **Muitas páginas similares:** Risco de código duplicado
2. **Dados grandes:** 3k issues + 26k eventos podem causar lentidão
3. **Arquivos de build commitados:** PR #66 commitou .next/

### 📊 Ações para Próxima Sprint
- Otimizar performance das páginas
- Adicionar mais visualizações
- Melhorar acessibilidade

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- Código refatorado e melhorado

**🟡 O que pode melhorar:**
- Agora é hora de retomar features grandes
- Planejar melhor para Release 2

**🔧 Ações de melhoria:**
- Definir roadmap claro para Release 2
- Manter ritmo sustentável aprendido

**🌟 Kudos:**
- Parabéns pela maturidade do time!

---

## 🔗 Links Relevantes
- [Issue #66](https://github.com/unb-mds/2025-2-Squad-01/issues/66)
- [Protótipo de Alta Fidelidade](https://github.com/unb-mds/2025-2-Squad-01/blob/main/docs/frontend/prototipo_alta_fidelidade.md)

---

**Scrum Master:** Pedro Druck  
**Equipe:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Rocha

**Data da Retrospectiva:** 02/11/2025

**💡 Reflexão:** Sprint leve foi necessária e bem-sucedida. Time está pronto para acelerar novamente.
