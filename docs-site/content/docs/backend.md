---
title: "Backend - Python/FastAPI"
description: "Documentação do desenvolvimento backend"
weight: 40
---

# Backend - Python/FastAPI

## Arquitetura do Backend

### FastAPI Framework
- **Performance**: Baseado em Starlette (async/await)
- **Documentação**: Swagger/OpenAPI automático
- **Validação**: Pydantic models
- **Testes**: Pytest integrado

## Estrutura do Projeto

```
backend/
├── app/
│   ├── api/           # Endpoints da API
│   ├── core/          # Configurações
│   ├── models/        # Modelos de dados
│   ├── services/      # Lógica de negócio
│   └── utils/         # Utilitários
├── tests/             # Testes automatizados
└── requirements.txt   # Dependências
```

## Endpoints Principais

### `/api/repos/analyze`
- **POST**: Analisa repositório GitHub
- **Parâmetros**: URL do repositório
- **Retorna**: Métricas de colaboração

### `/api/metrics/{repo_id}`
- **GET**: Busca métricas salvas
- **Parâmetros**: ID do repositório
- **Retorna**: Dados históricos

### `/api/reports/export`
- **GET**: Exporta relatório
- **Formato**: JSON/CSV
- **Filtros**: Data, repositório, colaboradores

## Integração GitHub API
- Rate limiting respeitado
- Cache de resultados
- Webhook para atualizações automáticas

## Banco de Dados
- **PostgreSQL**: Dados estruturados
- **Redis**: Cache e sessões
- **Migrations**: Alembic