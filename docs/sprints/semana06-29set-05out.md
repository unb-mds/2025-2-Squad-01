# Sprint - Semana 6 (29/09 a 05/10/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- **🎯 RELEASE 1 (01/10/2025)** - Marco importante do projeto
- Consolidar e estabilizar extração de dados da camada Bronze
- Melhorar documentação do projeto (README) com informações completas
- Finalizar diagramas de arquitetura C4 para visualização clara do sistema
- Manter pipeline de atualização automática de métricas via GitHub Actions

### Issues Planejadas
- #52: Bronze extraction consolidation
- #45: Consolidar extração bronze
- #43: Melhorar extração de dados
- #42: Refatorar pipeline bronze
- Atualizar README
- Corrigir links diagramas C4

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #52 - Bronze Extraction Consolidation
- **Merged:** 02/10/2025
- **Commits:** 15+ commits
- **Mudanças principais:**
  - Consolidação de scripts de extração bronze
  - Refatoração do pipeline ETL
  - Melhorias de performance
- **Revisores:** 2 aprovações
- **Arquivos modificados:** src/bronze/*.py, src/utils/

#### Melhorias de Documentação
- **Commits:** "docs: atualiza README e remove arquivos desnecessários"
- **Mudanças:**
  - README revisado para melhor clareza do projeto
  - Instruções de setup atualizadas
  - Remoção de arquivos Hugo desnecessários

#### Diagramas C4
- **Commits:** "diagrams-url-fix", "diagrams-final-fix"
- **Ação:** Links para diagramas C4 atualizados no repositório GitHub
- **Status:** ✅ Completo

### Métricas da Sprint

- **Commits:** 68 commits
- **Pull Requests Merged:** 1 grande PR (#52)
- **Issues Fechadas:** 3 issues principais
- **Contribuidores Ativos:** 4 membros

### Automações
- Pipeline de atualização automática de métricas Bronze executado 6x
- GitHub Actions funcionando conforme esperado

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **🏆 Release 1 entregue (01/10):** Primeira entrega completa e funcional
2. **Consolidação bem-sucedida do Bronze:** PR #52 integrou várias melhorias de forma organizada
3. **Documentação proativa:** Equipe atualizou README sem precisar de cobrança
4. **Pipeline automatizado:** Atualizações automáticas de métricas funcionaram perfeitamente
5. **Revisão de código:** PR teve boa revisão técnica com feedback construtivo

### 🟡 O que pode melhorar (Improve)
1. **Organização de trabalho:** Preparação para implementação da camada Silver
2. **Planejamento de features:** Definir roadmap claro para próximas sprints
3. **Documentação técnica:** Documentar arquitetura Bronze para facilitar Silver

### 🔴 Problemas identificados (Problems)
1. **Próximos passos:** Necessidade de definir arquitetura da camada Silver
2. **Suporte multi-branch:** Pipeline ainda não suporta múltiplas branches
3. **Rate limiting:** Necessidade de otimizar consumo de API do GitHub

### 📊 Ações para Próxima Sprint
- Iniciar implementação da camada Silver
- Definir arquitetura de transformação de dados
- Melhorar suporte multi-branch no workflow

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- Release 1 entregue no prazo
- Pipeline Bronze consolidado e estável
- Time engajado e comunicativo

**🟡 O que pode melhorar:**
- Precisamos de mais análises na Silver layer
- Frontend ainda básico, precisa de visualizações

**🔧 Ações de melhoria:**
- Próxima sprint: focar em análises Silver
- Começar visualizações no frontend

**🌟 Kudos:**
- Parabéns ao time pela entrega do Release 1! 🎉
- Ótimo trabalho na consolidação da camada Bronze

---

## 🔗 Links Relevantes
- [PR #52 - Bronze Consolidation](https://github.com/unb-mds/2025-2-Squad-01/pull/52)
- [Commit: docs README](https://github.com/unb-mds/2025-2-Squad-01/commit/76a4a04f)
- [Pipeline de Bronze](https://github.com/unb-mds/2025-2-Squad-01/actions)

---

**Scrum Master:** Pedro Druck  
**Equipe:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Rocha

**Data da Retrospectiva:** 05/10/2025
