# CoOps

# 📊 Sobre

Projeto desenvolvido na disciplina **Métodos de Desenvolvimento de Software (MDS)** – Engenharia de Software (UnB).

Nosso objetivo é criar uma ferramenta que permita visualizar e interpretar métricas de colaboração no **GitHub**, evoluindo de repositórios individuais para **organizações**, com auxílio de **agentes de IA** para explicar o significado das métricas coletadas.

---

## 🚀 Propósito
O produto busca apoiar **desenvolvedores, mantenedores e organizações** na análise da colaboração dentro de projetos GitHub, fornecendo **métricas claras, visuais e interpretadas por IA**.  
Assim, os usuários podem compreender melhor **produtividade, gargalos e qualidade** de seus projetos.

---

## 📌 Escopo do Produto

### Funcionalidades Inclusas (Escopo Principal)
- **Dashboard de Métricas**: painel central para visualização de dados.
- **Análise em Repositório e Organização**: alternar entre visão de um único projeto ou performance consolidada.
- **Métricas a serem coletadas**:
  - Issues → abertas/fechadas, tempo médio de resolução.
  - Commits → frequência, volume por contribuidor.
  - Pull Requests → quantidade, tempo de vida, taxa de aprovação, tamanho médio.
  - Tecnologias → linguagens e frameworks usados.
  - Qualidade de Código → métricas simples (ex.: tamanho médio de commits).
- **Agente de IA Explicativo**: assistente virtual que interpreta gráficos e explica métricas.

### Fora do Escopo (Versões Futuras)
- Outras plataformas além do GitHub (ex.: GitLab, Bitbucket).
- Ações de gerenciamento direto (ex.: fechar issue, aprovar PR).
- Métricas de CI/CD (tempo de build, taxa de falha).
- Predição de tendências com ML avançado.

---

## 🗂️ Backlog Inicial

### Épicos
1. Visualização de métricas
2. Análise em nível de repositório e organização
3. Explicação inteligente com IA
4. Qualidade de código (básica)
5. Integração com API GitHub

### Exemplos de Histórias de Usuário
- Como **mantenedor**, quero ver issues abertas e fechadas, para entender o andamento do projeto.
- Como **desenvolvedor**, quero ver quantos commits fiz no mês, para acompanhar minha contribuição.
- Como **líder de equipe**, quero ver o tempo médio para revisar PRs, para identificar gargalos.
- Como **gestor de organização**, quero métricas consolidadas de todos os repositórios, para avaliar performance geral.
- Como **usuário iniciante**, quero que a IA explique métricas, para interpretar melhor os gráficos.

---

## 🎨 Story Map (Figma)
👉 [Link do TEMPLATE FIGMA](https://www.figma.com/board/fuD1KRb6yGlJuFWPZSOWXx/Template-MDS?node-id=0-1&t=jP65B3v7rqapejoa-1)

## 🎨 Protótipo (Figma)
👉 [Link do TEMPLATE FIGMA](https://www.figma.com/proto/oCBp6kKarswmGbJAiIToyt/Prot%C3%B3tipo-Alta-Fidelidade?node-id=17-460&p=f&t=JcFBYqvzn89t0xPV-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A1080&show-proto-sidebar=1)

---

## 👥 Equipe
- **Scrum Master**: Pedro Druck
- **Product Owner (PO)**: Marcos Antonio
- **Time de Desenvolvimento**: Carlos Eduardo, Gustavo Xavier, Heitor Macedo, Pedro Rocha

---
## Passos para rodar as funcionalidades do projeto

# Pré-requisitos:
- npm (v20) (Somente caso for rodar o front-end localmente)
- python
- github cli (gh)
- github act (cli extension)
- docker desktop (instalado e rodando)
  
# Instalação
1. Clone o repositório:
   ```powershell
   git clone https://github.com/unb-mds/2025-2-Squad-01.git
   cd 2025-2-Squad-01

2. Inicie o Workflow usando o act:
   ```powershell
   gh act -W .github/workflows/bronze-extract.yaml -j extract-bronze-data --secret-file .secrets --bind

   
   

## 📚 Referências
- [GitHub Repo Visualization](https://githubnext.com/projects/repo-visualization/#explore-for-yourself)
- SonarQube (benchmark de qualidade de código)
- GitHub Insights

