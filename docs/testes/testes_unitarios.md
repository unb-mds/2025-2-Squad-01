# 📋 Documentação de Testes Unitários

## Índice

1. [Visão Geral](#visão-geral)
2. [Backend - Testes Python](#backend---testes-python)
3. [Frontend - Testes React/TypeScript](#frontend---testes-reacttypescript)
4. [Execução dos Testes](#execução-dos-testes)
5. [Integração Contínua (CI/CD)](#integração-contínua-cicd)
6. [Boas Práticas](#boas-práticas)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

Este projeto possui **cobertura completa de testes unitários** para backend (Python) e frontend (React/TypeScript).

### 📊 Estatísticas de Cobertura

| Componente | Cobertura Mínima | Cobertura Atual | Arquivos Testados |
|------------|------------------|-----------------|-------------------|
| **Backend** | 60% | ~70% | 100+ arquivos |
| **Frontend** | 60% | ~86% | 50+ arquivos |

### 🎯 Objetivo dos Testes

- ✅ Garantir qualidade e confiabilidade do código
- ✅ Detectar bugs antes de chegarem à produção
- ✅ Facilitar refatorações com segurança
- ✅ Documentar comportamento esperado
- ✅ Validar integração entre componentes

---

## Backend - Testes Python

### 🛠️ Stack de Testes

- **Framework**: `pytest` 8.3.4
- **Coverage**: `pytest-cov` 6.0.0
- **Mocking**: `pytest-mock` 3.14.0
- **Fixtures**: `@pytest.fixture`
- **Parametrização**: `@pytest.mark.parametrize`

### 📂 Estrutura de Diretórios
