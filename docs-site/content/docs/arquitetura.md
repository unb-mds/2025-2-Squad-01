---
title: "Arquitetura do Sistema"
description: "Visão geral da arquitetura técnica do CoOps"
weight: 20
---

# Arquitetura do Sistema

## Visão Geral

O CoOps utiliza uma arquitetura moderna baseada em microserviços com as seguintes camadas:

## Frontend
- **Framework**: ReactJS
- **Estilização**: CSS Modules / Styled Components
- **State Management**: Redux/Context API
- **Build**: Vite/Webpack

## Backend
- **Runtime**: Python 3.9+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Cache**: Redis
- **API Externa**: GitHub API v4 (GraphQL)

## Infraestrutura
- **Deploy**: GitHub Pages (Frontend) + Heroku (Backend)
- **CI/CD**: GitHub Actions
- **Monitoramento**: Logs centralizados

## Fluxo de Dados

1. **Coleta**: Extração de dados via GitHub API
2. **Processamento**: Análise e cálculo de métricas
3. **Armazenamento**: Persistência em banco de dados
4. **Visualização**: Dashboard interativo

## Segurança
- Autenticação via GitHub OAuth
- Rate limiting para API
- Validação de dados de entrada