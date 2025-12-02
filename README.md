# 📊 CoOps

![License](https://img.shields.io/github/license/unb-mds/2025-2-Squad-01)
![Issues](https://img.shields.io/github/issues/unb-mds/2025-2-Squad-01)
![Contributors](https://img.shields.io/github/contributors/unb-mds/2025-2-Squad-01)
![Stars](https://img.shields.io/github/stars/unb-mds/2025-2-Squad-01?style=social)
![Forks](https://img.shields.io/github/forks/unb-mds/2025-2-Squad-01?style=social)
![Last Commit](https://img.shields.io/github/last-commit/unb-mds/2025-2-Squad-01)

![Python](https://img.shields.io/badge/python-3.11-blue)
![React](https://img.shields.io/badge/react-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.6.2-blue)
![Vite](https://img.shields.io/badge/vite-6.0.1-646CFF)
![D3.js](https://img.shields.io/badge/d3.js-7.9.0-F9A03C)
![GitHub Actions](https://img.shields.io/badge/github_actions-automated-2088FF)

---

## 1. 📌 Visão Geral

Projeto desenvolvido na disciplina **Métodos de Desenvolvimento de Software (MDS - 2025/2)** – Engenharia de Software (UnB).

O **CoOps** é uma ferramenta que permite visualizar e interpretar métricas de colaboração no **GitHub**, evoluindo de repositórios individuais para **organizações**, com auxílio de **agentes de IA** para explicar o significado das métricas coletadas.

### 🚀 Propósito
O produto busca apoiar **desenvolvedores, mantenedores e organizações** na análise da colaboração dentro de projetos GitHub, fornecendo **métricas claras, visuais e interpretadas por IA**.  

Com o CoOps, os usuários podem:
- 📊 **Visualizar métricas de colaboração** através de dashboards interativos
- 🎯 **Analisar repositórios e organizações** com visualizações D3.js profissionais
- 🤖 **Obter insights com IA** para interpretar métricas complexas
- 📈 **Acompanhar produtividade, gargalos e qualidade** de projetos

---

## 2. 🧩 Links Importantes

- 🗺️ [Story Map](https://www.figma.com/board/fuD1KRb6yGlJuFWPZSOWXx/CoOps?node-id=40000167-1737&t=udDroKh4FZePSKUv-0)
- 🎨 [Protótipo de Alta Fidelidade](https://www.figma.com/proto/oCBp6kKarswmGbJAiIToyt/Prot%C3%B3tipo-Alta-Fidelidade?node-id=17-460&p=f&t=JcFBYqvzn89t0xPV-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A1080&show-proto-sidebar=1)
- 📋 [Board do Projeto no GitHub](https://github.com/orgs/unb-mds/projects/18)
- 🏗️ [Arquitetura Medallion](./docs/ARQUITETURA.md)
- 📊 [Extração de Dados](./docs/EXTRACAO_DADOS.md)
- 📚 [Documentação de Sprints](./docs/sprints/)
- 🔄 [Retrospectivas](./docs/sprints/README.md)

---

## 3. 📌 Escopo do Produto

### Funcionalidades Implementadas
- **Dashboard de Métricas**: painel central para visualização de dados
- **Análise de Repositórios**: visualização individual de projetos GitHub
- **Visualizações Interativas**:
  - Treemap e CirclePack (estrutura de repositórios)
  - Grafo de rede de colaboração
  - Heatmap de atividades temporais
  - Timeline de commits
- **Métricas Coletadas**:
  - Issues → abertas/fechadas, tempo médio de resolução
  - Commits → frequência, volume por contribuidor, linhas adicionadas/removidas
  - Pull Requests → quantidade, tempo de vida, taxa de aprovação
  - Estrutura → 90+ linguagens de programação suportadas
- **Pipeline de Dados**: Arquitetura Medallion (Bronze → Silver → Gold)
- **Otimizações**: Extração 100x mais rápida (4h → 30s)
- **Agente de IA**: Integração OpenAI para explicação de métricas

### Fora do Escopo (Versões Futuras)
- Outras plataformas além do GitHub (ex.: GitLab, Bitbucket)
- Ações de gerenciamento direto (ex.: fechar issue, aprovar PR)
- Métricas de CI/CD (tempo de build, taxa de falha)
- Predição de tendências com ML avançado

---

## 4. 🚀 Como Rodar o Projeto

### Pré-requisitos
- Python 3.11+
- Node.js v20+
- GitHub CLI (`gh`)
- GitHub Act (CLI extension)
- Docker Desktop (instalado e rodando)
- Token do GitHub com permissões de leitura

## 📦 Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/unb-mds/2025-2-Squad-01.git
cd 2025-2-Squad-01
```

2. Configure o ambiente Python:
```bash
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
```

3. Configure as variáveis de ambiente:
```bash
# Crie o arquivo .secrets com seu token
echo "GITHUB_TOKEN=ghp_seu_token_aqui" > .secrets
```

4. Execute a extração de dados (Bronze):
```bash
python src/bronze_extract.py --token SEU_TOKEN_AQUI --cache
```

5. Execute o processamento (Silver):
```bash
python src/silver_process.py
```

6. Copie os dados para o frontend:
```bash
# Windows:
xcopy data\silver\language_analysis_*.json front-end\public\data\silver\ /Y

# Linux/Mac:
cp data/silver/language_analysis_*.json front-end/public/data/silver/
```

7. Instale e rode o frontend:
```bash
cd front-end
npm install
npm run dev
```

8. Acesse a aplicação:
```
http://localhost:5173/2025-2-Squad-01
```

Para mais detalhes, consulte o [guia de contribuição](./CONTRIBUTING.md) e a [documentação de extração](./docs/EXTRACAO_DADOS.md).

---

## 5. 🏗️ Arquitetura

O projeto utiliza a **Arquitetura Medallion** com três camadas:

```
GitHub API → Bronze (Raw) → Silver (Enriched) → Gold (Aggregated) → Frontend
```

- **🥉 Bronze**: Dados brutos extraídos da API do GitHub
- **🥈 Silver**: Dados processados e enriquecidos com análises
- **🥇 Gold**: Dados agregados prontos para visualização
- **🎨 Frontend**: React + TypeScript + Vite + D3.js

**Principais Otimizações:**
- ⚡ 100x mais rápido: Extração de estrutura (4h → 30s)
- 🔄 GraphQL/REST híbrido com processamento paralelo
- 🎯 90+ linguagens de programação suportadas
- 📊 Visualizações D3.js profissionais

Para mais detalhes, consulte a [documentação de arquitetura](./docs/ARQUITETURA.md).

---

## 6. 👥 Equipe

Squad 01 – MDS 2025/2 – FGA/UnB

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/pedruck.png" width="100px;" style="border-radius: 10px;" alt="Pedro Druck"/><br />
      <sub><b>Pedro Druck</b></sub><br />
      <sub>Scrum Master</sub>
    </td>
    <td align="center">
      <img src="https://github.com/cadumotta.png" width="100px;" style="border-radius: 10px;" alt="Carlos Eduardo"/><br />
      <sub><b>Carlos Eduardo</b></sub><br />
      <sub>Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/guxvr.png" width="100px;" style="border-radius: 10px;" alt="Gustavo Xavier"/><br />
      <sub><b>Gustavo Xavier</b></sub><br />
      <sub>Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/HeitorM50.png" width="100px;" style="border-radius: 10px;" alt="Heitor Macedo"/><br />
      <sub><b>Heitor Macedo</b></sub><br />
      <sub>Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/pedrogrocha13.png" width="100px;" style="border-radius: 10px;" alt="Pedro Rocha"/><br />
      <sub><b>Pedro Rocha</b></sub><br />
      <sub>Developer</sub>
    </td>
  </tr>
</table>

---

## 7. 📊 Entregas

- ✅ **Release 1** (01/10/2025): Pipeline Bronze/Silver, Frontend básico
- ✅ **Release 2** (07/12/2025): Visualizações D3.js, OpenAI, Testes completos

**Documentação completa:** [Sprints e Retrospectivas](./docs/sprints/README.md)

---
- [GitHub Repo Visualization](https://githubnext.com/projects/repo-visualization/#explore-for-yourself)
- SonarQube (benchmark de qualidade de código)
- GitHub Insights

