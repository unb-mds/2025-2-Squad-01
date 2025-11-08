# Análise de Commits - Processamento em Lote

Este documento explica como expandir a análise de commits para **todos os repositórios** do projeto.

## 📋 Visão Geral

O pipeline de processamento consiste em 3 etapas:

1. **Enriquecimento** (`batch_enrich_commits.py`) - Busca estatísticas de cada commit via GitHub API
2. **Processamento** (`batch_process_commits.py`) - Agrega dados por autor e semana
3. **Visualização** - Frontend exibe os dados processados

## 🚀 Como Usar

### Opção 1: Pipeline Completo (Recomendado)

Processa TODOS os repositórios automaticamente:

```bash
python process_all_repos.py --token YOUR_GITHUB_TOKEN
```

**Com limite de repositórios (para teste):**
```bash
python process_all_repos.py --token YOUR_GITHUB_TOKEN --max-repos 5
```

### Opção 2: Etapas Separadas

#### 1. Enriquecimento

Busca dados de adições/deleções via GitHub API:

```bash
python batch_enrich_commits.py --token YOUR_GITHUB_TOKEN --owner unb-mds
```

**Parâmetros:**
- `--token`: Token de acesso do GitHub (obrigatório)
- `--owner`: Organização/dono dos repositórios (padrão: `unb-mds`)
- `--bronze-dir`: Diretório com arquivos de commits (padrão: `data/bronze`)
- `--max-repos`: Limita número de repositórios para processar

**Saída:**
- Arquivos `data/bronze/commits_REPO-NAME_with_stats.json` com estatísticas

#### 2. Processamento

Agrega dados por autor e semana:

```bash
python batch_process_commits.py
```

**Parâmetros:**
- `--bronze-dir`: Diretório bronze (padrão: `data/bronze`)
- `--output-dir`: Diretório de saída (padrão: `front-end/public`)
- `--max-repos`: Limita número de repositórios

**Saída:**
- Arquivos `front-end/public/commits_by_author_REPO-NAME.json`

## 📊 Formato dos Dados

### Arquivo de Entrada (Bronze)
```json
[
  {
    "sha": "abc123...",
    "commit": {
      "author": {
        "name": "João Silva",
        "date": "2024-10-15T10:30:00Z"
      }
    },
    "stats": {
      "additions": 150,
      "deletions": 30
    }
  }
]
```

### Arquivo de Saída (Processado)
```json
[
  {
    "author": "João Silva",
    "total_commits": 25,
    "total_additions": 3500,
    "total_deletions": 800,
    "final_total_lines": 2700,
    "weeks": [
      {
        "week": "2024-W42",
        "commits": 5,
        "additions": 150,
        "deletions": 30,
        "total_lines": 120,
        "changes_per_commit": 36
      }
    ]
  }
]
```

## ⚙️ Configuração do Token GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione escopo: `repo` (acesso completo a repositórios)
4. Copie o token gerado

**⚠️ Nunca commite o token!**

## 🔄 Fluxo de Trabalho

### Primeira Vez (Todos os Repositórios)

```bash
# 1. Execute o pipeline completo
python process_all_repos.py --token YOUR_TOKEN

# 2. Aguarde o processamento (pode demorar vários minutos)

# 3. Verifique os arquivos gerados
ls front-end/public/commits_by_author_*.json
```

### Atualização (Apenas Novos Repositórios)

O script **pula automaticamente** repositórios já processados:

```bash
# Apenas novos repos serão enriquecidos
python process_all_repos.py --token YOUR_TOKEN
```

### Reprocessamento (Sem Re-enriquecer)

Se já tem os dados enriquecidos e só quer reprocessar:

```bash
python process_all_repos.py --token YOUR_TOKEN --skip-enrich
```

## 📈 Estimativas de Tempo

**Para ~70 repositórios:**
- Enriquecimento: ~2-4 horas (depende do número de commits)
- Processamento: ~2-5 minutos

**Taxa de processamento:**
- ~600 commits/minuto (limitado por rate limit da API)
- Cada repositório com 500 commits = ~50 segundos

## 🎯 Próximos Passos

Após processar os dados:

1. **Atualizar Frontend** - Adicionar seletor de repositório
2. **Criar Índice** - Listar todos os repositórios disponíveis
3. **Melhorar Performance** - Cache de dados processados

## 📝 Notas

- **Rate Limit**: GitHub API permite ~5000 requests/hora com autenticação
- **Arquivos Ignorados**: `commits_all.json`, `commits_carlarocha.json`, etc.
- **Erro 404**: Commits de forks podem não estar acessíveis (normal)

## 🐛 Troubleshooting

### "Rate limit exceeded"
Aguarde 1 hora ou use outro token.

### "Invalid format"
Arquivo de commits pode estar corrompido. Verifique o JSON.

### "No enriched files found"
Execute primeiro o enriquecimento com `batch_enrich_commits.py`.

## 📚 Arquivos Relacionados

- `batch_enrich_commits.py` - Enriquecimento em lote
- `batch_process_commits.py` - Processamento em lote  
- `process_all_repos.py` - Pipeline completo
- `src/enrich_commits.py` - Enriquecimento individual (referência)
- `process_real_data.py` - Processamento individual (referência)
