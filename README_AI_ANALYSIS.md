# AI Analysis (Gemini)

Este módulo gera JSONs com análises de IA (Gemini) para a organização, repositórios e membros utilizando os dados já extraídos (bronze) de commits, issues e pull-requests.

## Saída

- `data/silver/ai/org/<org>.json`
- `data/silver/ai/repo/<repo>.json`
- `data/silver/ai/member/<login>.json`

Cada arquivo contém:
- `_metadata` com org, escopo, modelo
- `months`: objeto com chaves por `YYYY-MM` e a análise da IA para o período

## Pré-requisitos

1. Python 3.10+
2. Instalar dependências:

```powershell
pip install -r requirements.txt
```

3. Definir a API Key do Gemini no ambiente (ou via `.secrets` na raiz):

```powershell
$env:GEMINI_API_KEY = "<SUA_CHAVE>"
# ou
$env:GOOGLE_API_KEY = "<SUA_CHAVE>"
```

Ou crie/edite o arquivo `.secrets` na raiz do repositório:

```
GEMINI_API_KEY=<SUA_CHAVE>
```

Opcional: ajustar limites
```powershell
$env:GEMINI_QPS = "0.8"
$env:GEMINI_MAX_CONCURRENT = "2"
$env:GEMINI_MAX_ITEMS = "8"
$env:GEMINI_MAX_CHARS = "24000"
$env:ORG_NAME = "unb-mds"
$env:GEMINI_MODEL = "gemini-1.5-flash"
```

## Execução

```powershell
# Exemplo: últimos 12 meses, apenas membros, usando .secrets
python run_ai_analysis.py --org unb-mds --entities member --time-preset "Last 12 months" --bronze data/bronze --out data/silver/ai

# Execução completa (org, repos, membros) com range explícito de meses
python run_ai_analysis.py --org unb-mds --entities org,repo,member --since 2024-12 --until 2025-12 --bronze data/bronze --out data/silver/ai
```

- O processo respeita rate limit (QPS e concorrência) e faz batching, permitindo analisar múltiplos meses por prompt dentro do limite de tokens. Modo multi‑membros por mês pode ser habilitado futuramente (`--batching per-month`).
- Reexecuções fazem resume: meses já presentes não são recalculados.

## Observações
- As entradas do bronze precisam seguir o padrão gerado pelo pipeline deste repositório (arquivos `commits_*.json`, `issues_*.json`, `prs_*.json`).
- Além do bronze, o prompt inclui contexto das camadas silver (`temporal_events.json`) e gold (`timeline_last_12_months.json`, `timeline_last_7_days.json`) quando disponíveis.
- Os filtros de tempo são compatíveis com o frontend (e.g., "Last 24 hours", "Last 7 days", "Last 30 days", "Last 12 months"); internamente, o recorte é por mês para manter consistência dos arquivos.
- Se desejar reduzir custo/tempo, ajuste `--entities` (por exemplo, apenas `member`), o QPS e o modelo.