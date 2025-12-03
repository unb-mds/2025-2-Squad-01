# Sprint - Semana 13 (17/11 a 23/11/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- Implementar visualização de estrutura de repositórios
- Melhorar layout da página de colaboração
- Atualizar documentação para arquitetura Medallion
- Adicionar batch processing

### Issues/PRs Planejados
- #88: Visualização de estrutura (RepoFingerprint)
- #86: Layout vertical para colaboração
- #91, #83: Documentação e batch processing

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #88 - Structure Visualization (14/nov)
- **Funcionalidades:**
  - Componente RepoFingerprint.tsx para visualização
  - Extração Bronze: repository_structure.py via GraphQL
  - Silver: file_language_analysis.py (análise de linguagens)
  - Suporte a até 100.000 arquivos por repositório
  - GraphQL API: método graphql_repository_tree()
  - Documentação técnica: structure-visualization.md

#### PR #86 - Layout Vertical
- **Mudanças:** Layout de horizontal para vertical (cards empilhados)
- **Melhorias:** Heatmap centralizado e aumentado

#### PRs #91, #83 - Documentação
- **Migração:** Documentação completa para Medallion architecture
- **Batch processing:** Guia completo em BATCH_PROCESSING.md
- **Data quality:** Script check_unknown.py
- **Limpeza:** Remoção de docs obsoletos

### Métricas da Sprint

- **Commits:** ~35 commits
- **Pull Requests Merged:** 4 PRs (#88, #86, #91, #83)
- **Issues Fechadas:** Structure visualization e documentação
- **Contribuidores Ativos:** 3-4 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **Structure visualization:** PR #88 implementou visualização completa
2. **GraphQL tree:** Extração até 100k arquivos por repo
3. **90+ extensões:** Análise de linguagens expandida
4. **Layout melhorado:** PR #86 ajustou colaboração para vertical
5. **Documentação:** PRs #91 e #83 atualizaram docs

### 🟡 O que pode melhorar (Improve)
1. **Performance:** Testar com repos muito grandes
2. **Interatividade:** Adicionar zoom na visualização
3. **Cores customizáveis:** Permitir temas diferentes

### 🔴 Problemas identificados (Problems)
1. **Conflitos no github_api.py:** PR #88 teve conflitos de merge
2. **Complexidade do componente:** RepoFingerprint muito grande
3. **Documentação técnica:** structure-visualization.md precisa exemplos

### 📊 Ações para Próxima Sprint
- Merge do PR #97 (repo-visualization)
- Prioridade total para merges de PRs grandes
- Finalizar features para Release 2

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- Structure visualization implementada
- Suporte a 100k arquivos por repo
- 90+ extensões de linguagens
- Documentação Medallion atualizada

**🟡 O que pode melhorar:**
- PR #97 travado em revisão
- Precisa acelerar merges para Release 2

**🔧 Ações de melhoria:**
- Próxima sprint: prioridade total para merges
- Review diário de PRs grandes

**🌟 Kudos:**
- RepoFingerprint ficou incrível! 🎨
- Visualização de estrutura é feature destaque

---

## 🔗 Links Relevantes
- [PR #97 - repo-visualization](https://github.com/unb-mds/2025-2-Squad-01/pull/97) - **EM REVISÃO**
- [Pipeline Actions](https://github.com/unb-mds/2025-2-Squad-01/actions)
