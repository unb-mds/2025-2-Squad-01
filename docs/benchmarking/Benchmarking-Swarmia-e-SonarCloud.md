# Benchmark — Swarmia
_Data: 2025-09-08_

## Visão geral
**Swarmia** é uma plataforma de métricas de engenharia orientada a times, com foco em **DORA**, *team‑centric insights* e integrações profundas com **GitHub** e **Slack**. Promove melhoria contínua sem *surveillance* individual.

## Público‑alvo
Times de engenharia, EMs/VPs e organizações que priorizam produtividade coletiva e acordos de trabalho (SLA de review, WIP, limites de PR).

## Principais funcionalidades
- **Integração GitHub (Marketplace App)** com controle de escopo e permissões de leitura.  
- **Métricas de PR/Issues/Deploys**: *cycle time*, *review time*, *WIP*, DORA; geração de **deploys** a partir de **GitHub Checks**.  
- **Integração Slack**: *inbox* de PRs, *nudges* e lembretes automáticos.  
- **Relatórios de equipe** e acordos configuráveis para reduzir gargalos.  
- **Onboarding rápido** (“Get started in 15 minutes”).

## IA / automação
Automatiza lembretes, *routing* e notificações (Slack/PR). Não há “assistente” narrativo amplo; insights guiados por métricas e regras.

## Experiência de usuário
Dashboards por time com foco em fluxo, sem *leaderboards* individuais. Visualizações claras para *throughput* e gargalos semanais.

## Modelo comercial
- Página oficial indica **US$ 39 por desenvolvedor/mês (cobrança anual)**.  
- Marketplace: **teste grátis 14 dias** e **gratuito para startups até 9 devs**.

## Limitações observadas
- Requer boa configuração de *deploys* para DORA completas.  
- Não cobre qualidade estática de código (SAST) — integrar com SonarCloud ou similar.  
- Sem narrativas de IA explicativas nativas.

## Integração e dados
- GitHub App com escopo selecionável; acessa **issues, checks, deployments, contents, metadata** (somente leitura).  
- Gera deploys a partir de **GitHub Checks** quando não há integração nativa de CD.

## Oportunidades de inovação (para nosso projeto)
- **Narrativas de IA** e **alertas inteligentes** (ex.: riscos de *bus factor*, *rework* pós‑merge, SLAs de review estourando).  
- **Mapa multi‑repo** de tecnologias e *hotspots* conectado às métricas de fluxo.

## Fontes oficiais / referências
- Preço e planos  
  https://www.swarmia.com/pricing/  
- GitHub integration (docs)  
  https://help.swarmia.com/getting-started/integrations/github  
- GitHub reporting (posicionamento e métricas)  
  https://www.swarmia.com/github-reporting/  
- Slack + GitHub  
  https://www.swarmia.com/github-slack-integration/  
- Data access / permissões (read‑only)  
  https://help.swarmia.com/resources/security-and-data-retention/data-access  
- Deploys via GitHub Checks  
  https://help.swarmia.com/configuration/configuring-deployments-in-swarmia/generate-deployments-from-github-checks

----------------


# Benchmark — SonarCloud (SonarSource)
_Data: 2025-09-08_

## Visão geral
**SonarCloud** é o serviço SaaS da SonarSource para **qualidade e segurança de código** (SAST, *code smells*, cobertura), com **Quality Gates** que podem **bloquear merges/deploys**. Integra‑se nativamente com **GitHub** e outras plataformas DevOps.

## Público‑alvo
Desenvolvedores, *tech leads* e times de qualidade/segurança que querem padronizar *code review* automatizado, cobertura mínima e políticas de merge.

## Principais funcionalidades
- **Análise estática** multiplataforma/linguagens com regras de qualidade e segurança.  
- **Quality Gate**: critério go/no‑go para PRs e *main*.  
- **Integração GitHub nativa** (checagens, *decorations* de PR) e CI/CD.  
- **Dashboards de issues** (bugs/vulns/smells) e **coverage** por projeto/org.

## IA / automação
Não é uma plataforma de IA explicativa de colaboração; a “automação” ocorre via **Quality Gate** e análise de PR (checagens automáticas).

## Experiência de usuário
Onboarding guiado, importação de projetos via GitHub, *pull request decoration* clara e painéis por projeto/organização com status de *quality gate*.

## Modelo comercial
- **Baseado em linhas de código (LoC)** para projetos privados.  
- **Team plan** a partir de **€ 30/mês** (até 100k LoC). **Enterprise** com faixas maiores e contratação anual. **Trial de 14 dias**.

## Limitações observadas
- Foco em **qualidade de código**; não cobre métricas de fluxo (DORA, *cycle time*).  
- Para visão organizacional de colaboração (issues/PRs), é necessário complementar com outra solução.  

## Integração e dados
- Integração nativa com **GitHub** e os principais provedores de CI/CD.  
- Fácil de ativar em minutos; *pull request decoration* e *status checks* bloqueiam merges quando o **Quality Gate** falha.

## Oportunidades de inovação (para nosso projeto)
- **Unir qualidade (Sonar) + fluxo (PR/Issues) + narrativas de IA** em uma visão coesa por **organização**.  
- Conectar *hotspots* de dívida técnica a gargalos de fluxo e sugerir intervenções.

## Fontes oficiais / referências
- Página do produto (SonarCloud)  
  https://www.sonarsource.com/products/sonarcloud/  
- Integrações/CI/CD + GitHub  
  https://www.sonarsource.com/products/sonarcloud/features/integrations/  
  https://www.sonarsource.com/learn/integrating-sonarcloud-with-github/  
- Planos e preços (Team/Enterprise, LoC)  
  https://www.sonarsource.com/plans-and-pricing/  
  https://www.sonarsource.com/products/sonarcloud/new-pricing-plans/  
  https://docs.sonarsource.com/sonarqube-cloud/getting-started/github/