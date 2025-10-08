---
title: "Frontend - ReactJS"
description: "Documentação do desenvolvimento frontend"
weight: 30
---

# Frontend - ReactJS

## Tecnologias Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipagem estática
- **React Router**: Navegação SPA
- **Axios**: Cliente HTTP
- **Chart.js**: Visualização de dados

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas principais
├── hooks/         # Custom hooks
├── services/      # API calls
├── utils/         # Funções utilitárias
├── types/         # Definições TypeScript
└── styles/        # Estilos globais
```

## Componentes Principais

### Dashboard
- Exibe métricas principais do repositório
- Gráficos interativos de produtividade
- Filtros por período e colaboradores

### Análise de Repositório
- Formulário de busca de repositórios
- Validação de URLs do GitHub
- Feedback visual durante carregamento

### Relatórios
- Tabelas de dados detalhados
- Exportação de relatórios
- Comparação entre repositórios

## Estado da Aplicação
- Context API para dados globais
- Local state para componentes específicos
- Cache de requisições com React Query