---
title: "GitHub API Integration"
description: "Como utilizamos a API do GitHub"
weight: 50
---

# Integração com GitHub API

## API do GitHub v4 (GraphQL)

### Vantagens do GraphQL
- **Eficiência**: Busca apenas dados necessários
- **Flexibilidade**: Uma query, múltiplos recursos
- **Tipagem**: Schema bem definido
- **Rate Limiting**: Baseado em complexidade

## Queries Principais

### Dados do Repositório
```graphql
query GetRepository($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    description
    stargazerCount
    forkCount
    issues(states: [OPEN, CLOSED]) {
      totalCount
    }
    pullRequests(states: [OPEN, CLOSED, MERGED]) {
      totalCount
    }
  }
}
```

### Contribuidores e Atividade
```graphql
query GetContributors($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    collaborators(first: 100) {
      nodes {
        login
        avatarUrl
        bio
      }
    }
    defaultBranchRef {
      target {
        ... on Commit {
          history(first: 100) {
            nodes {
              author {
                user {
                  login
                }
              }
              committedDate
              message
            }
          }
        }
      }
    }
  }
}
```

## Métricas Calculadas
- **Frequência de Commits**: Commits por período
- **Colaboração**: PRs e reviews entre membros
- **Produtividade**: Issues resolvidas vs criadas
- **Qualidade**: Tempo médio de review
- **Engajamento**: Comentários e discussões

## Rate Limiting e Cache
- **Limite**: 5000 pontos/hora
- **Cache**: Redis com TTL
- **Fallback**: Dados locais quando limite atingido