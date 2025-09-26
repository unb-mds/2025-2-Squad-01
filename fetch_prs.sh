#!/usr/bin/env bash
set -euo pipefail

TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "ERRO: defina a variável de ambiente GITHUB_TOKEN com seu PAT"
  exit 1
fi

ORG="${ORG:-}"

mkdir -p src/data
OUT_FILE="src/data/prs.json"
echo "{}" > "$OUT_FILE"

if [ ! -f src/data/org_repos.json ]; then
  echo "Arquivo src/data/org_repos.json não encontrado. Criando vazio e saindo."
  echo '[]' > src/data/org_repos.json
  exit 0
fi

REPO_COUNT=$(jq length src/data/org_repos.json 2>/dev/null || echo 0)
echo "Repositórios no arquivo: $REPO_COUNT"

if [ "$REPO_COUNT" -eq 0 ]; then
  echo "Nenhum repositório encontrado em src/data/org_repos.json"
  exit 0
fi

for idx in $(seq 0 $((REPO_COUNT - 1))); do
  full_name=$(jq -r ".[$idx].full_name // .[$idx].name // .[$idx].html_url // empty" src/data/org_repos.json)

  if echo "$full_name" | grep -q "^https://"; then
    full_name=$(echo "$full_name" | sed -E 's#https://github.com/([^/]+/[^/]+)/?.*#\1#')
  fi

  if [ -n "$ORG" ] && ! echo "$full_name" | grep -q "/"; then
    full_name="${ORG}/${full_name}"
  fi

  if [ -z "$full_name" ] || [ "$full_name" = "null" ]; then
    echo "Índice $idx: não conseguiu identificar o repo. Pulando..."
    continue
  fi

  repo_short=$(echo "$full_name" | awk -F'/' '{print $2}')
  echo "Coletando PRs de: $full_name"

  page=1
  prs="[]"
  while true; do
    api="https://api.github.com/repos/${full_name}/pulls?state=all&per_page=100&page=${page}"
    body=$(curl -sS -H "Authorization: Bearer $TOKEN" "$api")

    if [ -z "$body" ] || [ "$body" = "[]" ]; then
      break
    fi

    page_prs=$(echo "$body" | jq '[.[] | {id: .id, number: .number, title: .title, author: .user.login, state: .state, created_at: .created_at, merged_at: .merged_at, closed_at: .closed_at, html_url: .html_url}]')

    prs=$(printf "%s\n%s\n" "$prs" "$page_prs" | jq -s 'add')

    count=$(echo "$page_prs" | jq length)
    if [ "$count" -lt 100 ]; then
      break
    fi
    page=$((page+1))
  done

  tmp=$(mktemp)
  jq --arg repo "$repo_short" --argjson prs "$prs" '. + {($repo): $prs}' "$OUT_FILE" > "$tmp" && mv "$tmp" "$OUT_FILE"
done

echo "Concluído. Arquivo gerado: $OUT_FILE"
echo "Número de repositórios processados: $REPO_COUNT"
echo "PRs coletados com sucesso em $OUT_FILE"
