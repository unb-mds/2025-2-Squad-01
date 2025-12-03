# Sprint - Semana 9 (20/10 a 26/10/2025)

## 📋 Planejamento da Sprint

### Objetivos da Sprint
- Implementar filtros de membro e timeline
- Expandir extração Bronze sem limites
- Melhorar UX com componentes controlados
- Otimizar processamento de dados

### Issues/PRs Planejados
- #67: Filtros de membro e timeline + refactor de componentes
- Extração Bronze sem limites artificiais
- Componentes de filtro com estado centralizado

---

## 🎯 Execução da Sprint

### Issues Concluídas ✅

#### PR #67 - Filtros e Extração Otimizada
- **Merged:** 17/10/2025
- **Funcionalidades implementadas:**
  - Filtro de membro (por colaborador específico)
  - Filtro de timeline (24h, 7 dias, 30 dias, 6 meses, 1 ano, todo período)
  - Componentes controlados com estado centralizado
  - Refatoração de BaseFilters e Filter.tsx
  
#### Extração Bronze Sem Limites
- **Mudança principal:** Removido limite de 5 dados na camada Bronze
- **Impacto:** Paginação ampla, extração completa de todos os repositórios
- **Resultado:** Extração de todos os 73 repositórios sem limitações

#### Pipeline Automatizado
- **Bronze:** Múltiplas atualizações automáticas
- **Silver:** Pipeline funcionando perfeitamente

### Métricas da Sprint

- **Commits:** ~20 commits
- **Pull Requests Merged:** 1 PR grande (#67)
- **Issues Fechadas:** Sistema de filtros completo
- **Contribuidores Ativos:** 4 membros

---

## 🔄 Retrospectiva da Sprint

### 🟢 O que funcionou bem (Keep)
1. **Filtros implementados:** PR #67 trouxe filtros de membro e timeline completos
2. **Componentes controlados:** Estado centralizado facilita manutenção
3. **Extração sem limites:** Bronze agora extrai todos os dados disponíveis
4. **Paginação ampla:** Suporte a grandes volumes de dados
5. **UX consistente:** Filtros integrados em múltiplas páginas

### 🟡 O que pode melhorar (Improve)
1. **Performance de filtros:** Testar com muitos dados
2. **Persistência de filtros:** Salvar seleção em URL
3. **Feedback visual:** Loading states para filtros

### 🔴 Problemas identificados (Problems)
1. **Volume de dados grande:** Extração sem limites pode causar problemas
2. **Performance:** Necessidade de otimização futura
3. **Rate limit:** Remoção de limites aumenta consumo de API

### 📊 Ações para Próxima Sprint
- Monitorar performance com grandes volumes
- Otimizar filtros se necessário
- Continuar desenvolvimento de features

---

## 📊 Análise do Scrum Master

**🟢 O que foi bom:**
- Páginas PRs, Issues e Collaboration entregues
- Prettier configurado (código mais limpo)
- Protótipo Figma documentado

**🟡 O que pode melhorar:**
- Adiantar um pouco de trabalho antes do período de prova de outras disciplinas

**🔧 Ações de melhoria:**
- Foco em refatoração e qualidade
- Sem novas features grandes

**🌟 Kudos:**
- 🏆 Release 1 concluída com sucesso!
- Time mostrou grande capacidade de entrega
- Parabéns pela resiliência!

---

## 🔗 Links Relevantes
- [Commits da sprint](https://github.com/unb-mds/2025-2-Squad-01/commits?since=2025-10-20&until=2025-10-26)
- [Pipeline Silver](https://github.com/unb-mds/2025-2-Squad-01/actions)
- [Release 1 Documentation](https://github.com/unb-mds/2025-2-Squad-01/releases)

---

**Scrum Master:** Pedro Druck  
**Equipe:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Rocha

**Data da Retrospectiva:** 26/10/2025

**🎉 PARABÉNS EQUIPE!** Release 1 entregue com sucesso. Agora vamos focar em qualidade para a Release 2.
