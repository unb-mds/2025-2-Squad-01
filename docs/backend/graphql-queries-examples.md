# Queries GraphQL para Teste

## 1. Query Básica - 10 Commits

Use esta query no [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer):

```graphql
{
  repository(owner: "unb-mds", name: "2025-2-Squad-01") {
    ref(qualifiedName: "main") {
      target {
        ... on Commit {
          history(first: 10) {
            totalCount
            nodes {
              oid
              message
              committedDate
              additions
              deletions
              changedFiles
              author {
                name
                email
                user {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## 2. Query com Paginação

Para buscar mais commits usando cursor:

```graphql
query GetCommits($cursor: String) {
  repository(owner: "unb-mds", name: "2025-2-Squad-01") {
    ref(qualifiedName: "main") {
      target {
        ... on Commit {
          history(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
            nodes {
              oid
              message
              committedDate
              additions
              deletions
              changedFiles
              author {
                name
                user {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}
```

Variables:
```json
{
  "cursor": null
}
```

Para próxima página, use o `endCursor` retornado como valor de `cursor`.

## 3. Query Completa com Todos os Detalhes

```graphql
query GetDetailedCommits($owner: String!, $name: String!, $branch: String!, $maxCommits: Int!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    ref(qualifiedName: $branch) {
      target {
        ... on Commit {
          history(first: $maxCommits, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
            nodes {
              oid
              message
              committedDate
              author {
                name
                email
                user {
                  login
                  avatarUrl
                }
              }
              committer {
                name
                email
                user {
                  login
                }
              }
              additions
              deletions
              changedFiles
              parents(first: 1) {
                totalCount
                nodes {
                  oid
                }
              }
              tree {
                oid
              }
            }
          }
        }
      }
    }
  }
}
```

Variables:
```json
{
  "owner": "unb-mds",
  "name": "2025-2-Squad-01",
  "branch": "main",
  "maxCommits": 50,
  "cursor": null
}
```

## 4. Query para Commit Específico

```graphql
query GetCommitDetails($owner: String!, $name: String!, $oid: GitObjectID!) {
  repository(owner: $owner, name: $name) {
    object(oid: $oid) {
      ... on Commit {
        oid
        message
        messageHeadline
        messageBody
        committedDate
        author {
          name
          email
          user {
            login
          }
        }
        additions
        deletions
        changedFiles
        parents(first: 10) {
          totalCount
          nodes {
            oid
            message
          }
        }
      }
    }
  }
}
```

Variables:
```json
{
  "owner": "unb-mds",
  "name": "2025-2-Squad-01",
  "oid": "COMMIT_SHA_HERE"
}
```

## 5. Query para Múltiplos Repositórios

```graphql
{
  org: organization(login: "unb-mds") {
    repo1: repository(name: "2025-2-Squad-01") {
      ref(qualifiedName: "main") {
        target {
          ... on Commit {
            history(first: 5) {
              nodes {
                oid
                additions
                deletions
              }
            }
          }
        }
      }
    }
    repo2: repository(name: "2024-2-Squad06") {
      ref(qualifiedName: "main") {
        target {
          ... on Commit {
            history(first: 5) {
              nodes {
                oid
                additions
                deletions
              }
            }
          }
        }
      }
    }
  }
}
```

## 6. Query com Estatísticas Agregadas

```graphql
{
  repository(owner: "unb-mds", name: "2025-2-Squad-01") {
    name
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first: 100) {
            totalCount
            nodes {
              additions
              deletions
              changedFiles
              committedDate
            }
          }
        }
      }
    }
  }
}
```

## Como Testar no GraphQL Explorer

1. Acesse: https://docs.github.com/en/graphql/overview/explorer
2. Faça login com sua conta GitHub
3. Cole uma das queries acima no painel esquerdo
4. Se a query usa variáveis, adicione-as no painel "Query Variables"
5. Clique em "Play" para executar
6. Veja os resultados no painel direito

## Exemplo de Resposta

```json
{
  "data": {
    "repository": {
      "ref": {
        "target": {
          "history": {
            "totalCount": 150,
            "pageInfo": {
              "hasNextPage": true,
              "endCursor": "abc123cursor"
            },
            "nodes": [
              {
                "oid": "abc123def456",
                "message": "Add new feature",
                "committedDate": "2025-11-03T10:30:00Z",
                "additions": 120,
                "deletions": 45,
                "changedFiles": 8,
                "author": {
                  "name": "João Silva",
                  "email": "joao@example.com",
                  "user": {
                    "login": "joaosilva"
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

## Dicas

1. **Limite de resultados**: GraphQL limita a 100 itens por vez, use paginação
2. **Rate limiting**: Queries complexas consomem mais pontos do rate limit
3. **Branches**: Use `defaultBranchRef` se não souber o nome do branch
4. **Erros**: Leia a mensagem de erro, geralmente indica o problema
5. **Exploração**: Use o autocomplete (Ctrl+Space) para ver campos disponíveis
