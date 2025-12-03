# Sprint - Semana 15 (01/12 a 07/12/2025) 🏆 RELEASE 2

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- **🚀 ENTREGA DO RELEASE 2**
- Implementar GraphQL/REST híbrido para commits
- Integrar OpenAI API
- Adicionar testes completos (backend + frontend)
- Finalizar documentação

### Issues/PRs Planejados
- #104: GraphQL/REST híbrido com processamento paralelo
- Integração OpenAI
- Implementação de testes
- Documentação final

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### 🏆 RELEASE 2 - ENTREGUE!

#### PR #104 - Extraction Overhaul (2/dez)
**Otimizações GraphQL:**
- ✅ Timeout único de 30 segundos (fail-fast)
- ✅ Circuit breaker otimizado (1 falha → REST fallback)
- ✅ Fallback imediato em 502 Bad Gateway

**Processamento Paralelo REST:**
- ✅ ThreadPoolExecutor com 5 workers simultâneos
- ✅ Batches de 10 commits
- ✅ ~50% mais rápido que sequencial
- ✅ Delay de 0.3s entre batches

#### Integração OpenAI
- ✅ OpenAI API integrada ao projeto
- ✅ Interface de chat implementada
- ✅ Sistema de análise inteligente de dados

#### Testes Implementados
- ✅ Cobertura completa backend
- ✅ Testes frontend
- ✅ CI/CD funcionando

#### Documentação Final
- ✅ README atualizado
- ✅ Documentação de sprints retroativa (Semanas 6-15)
- ✅ Atas de reunião baseadas em PRs reais
- ✅ Arquitetura Medallion documentada

### Métricas da Sprint

- **Commits:** ~20 commits
- **Pull Requests Merged:** 1 PR (#104) + integrações
- **Issues Fechadas:** Release 2 completa
- **Contribuidores Ativos:** 5 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **🏆 Release 2 entregue:** PR #104 finalizou otimizações
2. **OpenAI integrada:** IA implementada com sucesso
3. **Testes implementados:** Cobertura completa backend e frontend
4. **Documentação atualizada:** Arquitetura Medallion documentada
5. **GraphQL/REST híbrido:** PR #104 implementou processamento paralelo
6. **Pipeline otimizado:** Timeout, retry logic e circuit breaker funcionando

### 🟡 O que pode melhorar (Improve)
1. **Documentação de IA:** Documentar integração OpenAI
2. **Testes de integração:** Validar fluxo completo com IA
3. **Performance de IA:** Otimizar tempo de resposta

### 🔴 Problemas identificados (Problems)
1. **Documentação retroativa:** Difícil documentar depois
2. **Complexidade alta:** Sistema ficou complexo, precisa refatoração futura
3. **Integração de última hora:** OpenAI integrada no final do projeto

### 📊 Reflexões do Semestre
**✅ Sucessos:**
- 2 Releases entregues no prazo
- Pipeline completo implementado
- Frontend com visualizações profissionais
- Arquitetura Medallion bem estruturada
- 90+ linguagens suportadas

**⚠️ Desafios:**
- Falta de testes unitários em todo o projeto
- Burnout na Sprint 8 (72 commits)
- PRs grandes demorando em review

**📚 Aprendizados:**
- Arquitetura Medallion (Bronze/Silver/Gold)
- D3.js para visualizações profissionais
- React com TypeScript e Vite
- GitHub Actions para CI/CD
- Python para processamento de dados
- Otimizações críticas salvam projetos (4h → 30s)
- GraphQL nem sempre é melhor que REST
- Testes devem ser desde o início
- Documentação retroativa é trabalhosa mas possível

---

## 📊 Análise Final do Scrum Master

**🟢 O que foi bom:**
- 🏆 Release 2 entregue com todas as features planejadas
- OpenAI integrada com sucesso
- Testes implementados (backend + frontend)
- GraphQL/REST híbrido com processamento paralelo
- Documentação completa e retroativa
- 2 Releases no prazo acadêmico

**🟡 O que pode melhorar:**
- Testes deveriam ter sido feitos desde o início
- Documentação retroativa foi trabalhosa
- Integrações de última hora (OpenAI)

**🔧 Ações de melhoria (para próximos projetos):**
- TDD obrigatório desde Sprint 1
- Documentação contínua, não retroativa
- Code review diário para PRs grandes
- Sprints de 2 semanas (mais sustentável)

**🌟 Kudos Finais:**
- 🎉 PARABÉNS AO SQUAD 01!
- Time demonstrou excelência técnica
- Resiliência em momentos críticos (Sprint 8)
- Recovery sprint mostrou maturidade
- Otimizações (100x) salvaram o projeto
- Visualizações D3.js de qualidade profissional
- Arquitetura Medallion bem implementada
- **Vocês são incríveis! 🚀**

---

## 🔗 Links Relevantes

### Frontend
- ✅ Página de visualizações com Treemap e CirclePack
- ✅ Hooks reutilizáveis (useRepoData, useRepositories)
- ✅ Legenda de linguagens com cores
- ✅ Alternância entre modos de visualização
- ✅ Interface responsiva

### Backend
- ✅ Pipeline Bronze → Silver → Gold
- ✅ 90+ linguagens suportadas
- ✅ Extração otimizada de commits
- ✅ Análises de métricas avançadas
- ✅ GitHub Actions automatizadas

### Documentação
- ✅ README completo
- ✅ Documentação de sprints (10 semanas)
- ✅ Arquitetura Medallion explicada
- ✅ Guias de instalação

### Infraestrutura
- ✅ CI/CD com GitHub Actions
- ✅ Automações Bronze e Silver
- ✅ Pipeline 100% estável

---

## 🔗 Links Relevantes
- [Release 2](https://github.com/unb-mds/2025-2-Squad-01/releases)
- [PR #97 - Visualizations](https://github.com/unb-mds/2025-2-Squad-01/pull/97)
- [Documentação Sprints](https://github.com/unb-mds/2025-2-Squad-01/tree/main/docs/sprints)
- [Pipeline Actions](https://github.com/unb-mds/2025-2-Squad-01/actions)

---

## 🎓 Retrospectiva Geral do Semestre

### 🏆 Conquistas
1. **2 Releases entregues no prazo**
2. **Pipeline completo e funcional**
3. **Frontend com D3.js profissional**
4. **90+ linguagens suportadas**
5. **450+ commits de trabalho**
6. **Documentação completa**

### 📚 Aprendizados Técnicos
- Arquitetura Medallion (Bronze/Silver/Gold)
- D3.js para visualizações
- React com TypeScript e Vite
- GitHub Actions para CI/CD
- Python para processamento de dados

### 👥 Aprendizados de Time
- Scrum funciona quando aplicado corretamente
- Retrospectivas precisam de ações concretas
- Burnout é real e precisa ser gerenciado
- Testes devem ser prioridade desde o início
- Comunicação é fundamental

### 🚨 Dívida Técnica Reconhecida
**O time reconhece que:**
- Zero testes é inaceitável em produção
- Dívida técnica foi acumulada conscientemente
- Prioridade foi entregas dentro do prazo acadêmico
- Em projeto real, testes seriam obrigatórios
- Aprendizado: **nunca mais deixar testes para depois**

---

**Scrum Master:** Pedro Druck  
**Equipe:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Rocha

**Data da Retrospectiva:** 07/12/2025

**🏆 MENSAGEM FINAL:** Release 2 entregue com sucesso! Time demonstrou capacidade técnica, resiliência e comprometimento. Projeto completo atende aos requisitos da disciplina. Aprendizado sobre testes será levado para próximos projetos. **Parabéns ao Squad 01! 🎉**

---

## 📊 Métricas Finais do Projeto

**Período:** 29/09/2025 a 07/12/2025 (10 semanas)  
**Sprints:** 10 sprints concluídas  
**Commits:** ~450 commits  
**PRs Merged:** 5+ pull requests  
**Releases:** 2 entregas completas
