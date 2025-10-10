# Benchmark — Code Climate Velocity
_Data: 2025-09-08_

## Visão geral
**Code Climate Velocity** é uma plataforma de *Software Engineering Intelligence* focada em métricas de fluxo e entrega para times de engenharia. Integra-se ao GitHub (e outras VCS) via GitHub App com **acesso somente leitura**, permitindo selecionar quais repositórios dar acesso.

## Público‑alvo
Líderes de engenharia (EMs/VPs), *tech leads* e times que querem visibilidade de throughput, eficiência de PR e gargalos de ciclo.

## Principais funcionalidades
- **Integração GitHub/GitHub Enterprise** (GitHub App) com permissões de leitura; suporte também a Bitbucket/GitLab/Azure Repos.  
- **Métricas de PR/Issues/Commits**: tempo até primeira resposta, tempo de revisão, *cycle time*, taxa de merge, *WIP* e SLA de review.
- **Painéis por time e organização**: comparativos, tendências e diagnósticos para retrospectivas e melhoria contínua.
- **Integrações com ferramentas de projeto** (ex.: Jira) para conectar *work items* a código e releases.

## IA / automação
Não há “assistente” narrativo nativo; insights são apresentados como gráficos, *widgets* e diagnósticos configuráveis. Pode ser combinado com agentes próprios via API/export.

## Experiência de usuário
Onboarding via GitHub App, seleção de repositórios e times. Dashboards limpos, foco em fluxo e *health* de PRs. Boa usabilidade para cerimônias (retro/weekly).

## Modelo comercial
Planos reportados publicamente partindo de **US$ 449/ano por usuário** (Startup) e **US$ 649/ano por usuário** (Company), com **trial** e **Enterprise** sob contato. (Verificar com vendas para valores atuais.)

## Limitações observadas
- Não cobre qualidade estática de código (SAST/coverage) de forma profunda — precisa integrar uma ferramenta dedicada (ex.: SonarCloud).
- Narrativas em linguagem natural (IA explicativa) não são foco do produto.
- Algumas métricas avançadas (ex.: DORA completas) dependem de integrações de deploy.

## Integração e dados
- Conexão via **GitHub App**; requer ser **Owner/Admin** do repositório para importar.  
- Compatível com GitHub/GHE, Bitbucket, GitLab, Azure Repos.  
- Permissões de leitura do código/metadata para cálculo das métricas.

## Oportunidades de inovação (para nosso projeto)
- **Narrativas de IA** que expliquem por que uma métrica mudou e **que ação tomar** (ex.: “lead time ↑18% por fila de review >24h no time X; sugerir janelas de review e PRs menores”).  
- **Mapa estrutural multi‑repo** (tecnologias, módulos e *hotspots*) acoplado às métricas de fluxo.  
- **Alertas de governança** (SLAs de review, *bus factor* por módulo, *rework* pós‑merge).

## Fontes oficiais / referências
- Docs — Integração GitHub (permissões e App)  
  https://docs.velocity.codeclimate.com/en/articles/2752013-how-does-velocity-connect-to-my-github-organization  
- VCS suportados  
  https://docs.velocity.codeclimate.com/en/articles/2772578-what-vcs-do-you-support  
- Pricing (fontes públicas)  
  https://www.trustradius.com/products/code-climate-velocity/pricing  
  https://www.saasworthy.com/product/code-climate-velocity/pricing


-------------------------------------------------------------------------------


# Benchmark — LinearB
_Data: 2025-09-08_

## Visão geral
**LinearB** é uma plataforma de métricas de engenharia com foco em **fluxo (DORA)**, *cycle time* de PR, gargalos de revisão e automações (p.ex., **gitStream**). Integra-se ao **GitHub** para coletar dados de PR/commits/branches e cruzar com ferramentas de projeto/CI.

## Público‑alvo
Gestores de engenharia, *tech leads* e PMs técnicos buscando previsibilidade de entrega, redução de *lead time* e melhoria de *throughput*.

## Principais funcionalidades
- **Integração GitHub** e outras ferramentas (projeto/CI/CD/comunicação) para visão ponta‑a‑ponta.  
- **DORA e métricas de fluxo**: *lead time for changes*, *deployment frequency*, *change failure rate* (via eventos de deploy), **MTTR** (com integração).  
- **PR analytics**: tempo em fila, tamanho de PR, *review load* e gargalos por equipe.  
- **Automação gitStream**: políticas para *auto‑approve*, *labeling*, *routing* de reviewers e redução de espera.  
- **Dashboards por time/organização** com metas e benchmarks públicos periódicos.

## IA / automação
Foco em automações de fluxo (gitStream) e diagnósticos; não apresenta “assistente” narrativo forte por padrão. Dá para acoplar agentes externos via API.

## Experiência de usuário
UI moderna com painéis de time e drill‑down por PRs/repos. Forte na identificação de gargalos e progressão semanal.

## Modelo comercial
Informações públicas variam por fonte; referências indicam valores a partir de **US$ 49/mês** por usuário em certos planos e outras fontes indicando **a partir de ~US$ 549/ano por colaborador**. Recomenda‑se **contato comercial** para cotação atual e descontos por volume.

## Limitações observadas
- Métricas de qualidade de código (SAST/coverage) não são foco — requer solução dedicada.  
- DORA completas dependem de configuração confiável de eventos de **deploy**.  
- Preços oficiais podem não estar publicamente listados; variação entre fontes.

## Integração e dados
- Integração oficial com **GitHub** e ecossistema (Jira, CI/CD, Slack, etc.).  
- Suporte a webhooks e API para *workflows* customizados.

## Oportunidades de inovação (para nosso projeto)
- **IA explicativa** que conecte gargalos a mudanças de política (ex.: *review windows*, limites de PR e *routing* de reviewers) com recomendações claras.  
- **Mapa de tecnologias + hotspots** correlacionado a DORA (quais módulos impactam *lead time*).

## Fontes oficiais / referências
- Integração GitHub (página oficial)  
  https://linearb.io/integrations/github  
- Integrações gerais  
  https://linearb.io/integrations  
- Pricing (fontes públicas)  
  https://www.g2.com/products/linearb/pricing  
  https://tekpon.com/software/linearb/pricing/

-----------------------------