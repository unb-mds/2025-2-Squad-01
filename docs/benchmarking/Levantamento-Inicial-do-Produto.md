# 📄 Documento de Visão do Produto e Necessidades dos Usuários  

**Projeto:** Análise de Métricas de Colaboração no GitHub  
**Versão:** 1.0  
**Autores:** Heitor Macêdo Ricardo (Scrum Master), Marcos (Product Owner)  

---

## 1. Introdução e Propósito  

### 1.1. O Problema  
Equipes de desenvolvimento de software e gestores de projetos frequentemente enfrentam dificuldades para visualizar e compreender a dinâmica da colaboração em seus repositórios e organizações no GitHub.  

Métricas como número de commits ou pull requests são fáceis de obter, mas difíceis de interpretar em um contexto que reflita a saúde, a produtividade e os gargalos do time.  

Faltam ferramentas que não apenas exibam dados, mas que também ofereçam **insights acionáveis** e expliquem o que esses dados significam.  

### 1.2. A Solução Proposta  
Nosso produto será uma plataforma de **visualização e análise de métricas de colaboração** para repositórios e organizações no GitHub.  

O diferencial será o uso de **agentes de IA** para contextualizar os dados, explicar as características da colaboração e traduzir as métricas em informações estratégicas.  

A plataforma ajudará times a:  
- Identificar pontos de melhoria.  
- Celebrar conquistas.  
- Otimizar processos de desenvolvimento de forma inteligente e guiada.  

---

## 2. Escopo do Produto  

### 2.1. Funcionalidades Inclusas (Escopo Principal)  
- **Dashboard de Métricas**: Painel central para visualização de dados.  
- **Análise a Nível de Repositório e Organização**: Alternar entre visão de um único projeto e performance consolidada de uma organização.  
- **Métricas a Serem Coletadas**:  
  - **Issues**: Quantidade abertas vs. fechadas, tempo médio para fechamento.  
  - **Commits**: Frequência, volume por contribuidor.  
  - **Pull Requests (PRs)**: Quantidade, tempo de vida (abertura → merge), taxa de aprovação, tamanho médio.  
  - **Tecnologias**: Identificação das linguagens e tecnologias mais utilizadas.  
  - **Qualidade de Código**: (a definir) – possivelmente integração com análise estática ou métricas básicas.  
- **Agente de IA Explicativo**: Assistente virtual que interpreta gráficos e métricas (exemplo: alto número de PRs abertos pode indicar gargalo na revisão).  

### 2.2. Fora do Escopo (Para Versões Futuras)  
- Análise de plataformas além do GitHub (ex: GitLab, Bitbucket).  
- Ações de gerenciamento direto na plataforma (ex: fechar uma issue, aprovar PR).  
- Análise de métricas de CI/CD (ex: tempo de build, taxa de falha).  
- Predição de tendências com Machine Learning avançado.  

---

## 3. Público-Alvo e Personas  
- **CTOs e Gerenciadores de Equipe**.  
- **Membros de equipes de desenvolvimento**.  
- **Desenvolvedores interessados em produtividade e organização de projetos**.  

---

## 4. Funcionalidades Fundamentais (Features)  

| Necessidade do Usuário | Funcionalidade Chave | Persona Atendida | Prioridade |
|-------------------------|----------------------|------------------|------------|
| "Preciso ver a saúde do meu projeto rapidamente." | Dashboard principal com resumo das métricas chave. | Todas | Essencial |
| "Não entendo o que este gráfico quer dizer." | Botão **"Explicar com IA"** em cada métrica/gráfico. | Todas | Essencial |
| "Quero saber se estamos demorando para revisar PRs." | Métrica de **Tempo de Vida do PR** com detalhamento. | Líder Técnico, Gestor de Engenharia | Alta |
| "Como está o fluxo de trabalho das issues?" | Gráfico de **fluxo cumulativo (CFD)** de issues. | Gerente de Projetos | Alta |
| "Preciso comparar a performance de duas equipes." | Seletor de visualização (**Repositório vs. Organização**). | Gestor de Engenharia | Média |
| "Quais tecnologias meu time mais usa?" | Análise de linguagens e tecnologias do repositório. | Líder Técnico, Gestor de Engenharia | Média |
| "Quero saber sobre a produtividade de um membro específico da equipe." | Filtragem por membro + análise da IA sobre dados individuais. | Todas | Média |

---

## 5. Análise de Riscos  

- **Principal Risco:** Implementação do agente de IA para análises e geração de insights.  
  - Pode ser comprometida pela falta de conhecimento técnico da equipe ou pelo tempo limitado.  
- **Outro Risco:** Organização e comunicação da equipe.  
  - Falhas podem causar atrasos graves e necessidade de retrabalho.  

---

📌 **Resumo da Estrutura do Documento**  
1. Introdução e Propósito  
   - O Problema  
   - A Solução Proposta  
2. Escopo do Produto  
   - Funcionalidades Inclusas  
   - Fora do Escopo  
3. Público-Alvo e Personas  
4. Funcionalidades Fundamentais (Features)  
5. Análise de Riscos  
