# Sprint - Semana 14 (24/11 a 30/11/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- **🚀 Otimizar extração de estrutura (100x mais rápido)**
- Expandir suporte a 90+ extensões de arquivo
- Resolver problemas de rate limit
- Otimizar performance crítica

### Issues/PRs Planejados
- #101: REST API para extração de estrutura
- Expansão de detecção de linguagens

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### 🚀 PR #101 - REST API Optimization (30/nov)
**Problema resolvido:**
- Extração levava 3-4 horas com GraphQL
- Erros frequentes de secondary rate limit (403)
- ~1.500 requisições GraphQL para 73 repositórios

**Solução implementada:**
- ✅ Substitui GraphQL por REST `/git/trees` com `recursive=1`
- ✅ **100x mais rápido:** 3-4h → 30-40 segundos
- ✅ Zero erros de rate limit
- ✅ ~73 requisições (1 por repo) vs 1.500 anteriores
- ✅ Complexidade reduzida: 150K linhas → 146 com otimização

**Expansão de linguagens:**
- ✅ 32 → 90+ extensões suportadas
- ✅ Categorias adicionadas: Imagens (PNG, JPEG, SVG, WebP)
- ✅ Fontes (TTF, OTF, WOFF), Mídia (MP4, MP3, WAV)
- ✅ Arquivos (ZIP, TAR, RAR), Config (TOML, INI, ENV)
- ✅ Docs (RST, LaTeX, PDF), Shell (Fish, PowerShell)

**Arquivos modificados:**
- `src/utils/github_api.py`: método `rest_repository_tree()`
- `src/bronze/repository_structure.py`: troca GraphQL → REST
- `src/silver/file_language_analysis.py`: 60+ novas extensões

#### GitHub Actions
- ✅ Workflow executou com sucesso (27 min total)
- ✅ 73 repositórios processados
- ✅ Extração de estrutura: ~30s

### Métricas da Sprint

- **Commits:** ~25 commits
- **Pull Requests Merged:** 1 PR crítico (#101)
- **Issues Fechadas:** Otimização 100x de performance
- **Contribuidores Ativos:** 3-4 membros
- **Performance:** 3-4h → 30s (melhoria de 100x)

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **🚀 100x mais rápido:** PR #101 otimizou extração (4h → 30s)
2. **REST para estrutura:** Substituiu GraphQL iterativo
3. **Zero rate limits:** Redução de 1.500 → 73 requisições
4. **Suporte a 90+ extensões:** Imagens, fontes, mídia, arquivos
5. **GitHub Actions:** Workflow executou com sucesso (27 min)

### 🟡 O que pode melhorar (Improve)
1. **Documentação da otimização:** Documentar mudança de estratégia
2. **Testes de performance:** Validar com repos gigantes
3. **Fallback GraphQL:** Manter como opção se REST falhar

### 🔴 Problemas identificados (Problems)
1. **Migração abrupta:** Mudança de GraphQL para REST sem aviso
2. **Secondary rate limit resolvido:** Mas problema foi sério
3. **Retrocompatibilidade:** Garantir que nada quebrou

### 📊 Ações para Próxima Sprint (Release 2)
- Integrar OpenAI API
- Finalizar testes backend e frontend
- Preparar entrega do Release 2
- Documentação final

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- 🚀 100x mais rápido (4h → 30s)!
- REST API otimizada perfeitamente
- 90+ extensões suportadas
- Zero erros de rate limit

**🟡 O que pode melhorar:**
- Documentar mudança de estratégia
- Garantir retrocompatibilidade

**🔧 Ações de melhoria:**
- Documentar otimização REST vs GraphQL
- Validar com repositórios gigantes

**🌟 Kudos:**
- 🏆 Sprint ÉPICA! Otimização salvou o projeto!
- PR #101 é exemplo de excelência técnica
- Time mostrou capacidade de resolver problemas críticos

---

## 🔗 Links Relevantes
- [PR #97 - MERGED ✅](https://github.com/unb-mds/2025-2-Squad-01/pull/97)
- [Commits 24-30 Nov](https://github.com/unb-mds/2025-2-Squad-01/commits?since=2025-11-24&until=2025-11-30)
- [Pipeline Actions](https://github.com/unb-mds/2025-2-Squad-01/actions)
