# Deploy do GitHub Pages - CoOps

Este documento explica como o deploy do site CoOps é realizado no GitHub Pages.

## Estrutura

- `/site/` - Contém os arquivos estáticos gerados pelo Next.js
- `.github/workflows/pages-deploy.yml` - Workflow de deploy automático

## Como funciona

1. **Build Local**: Execute `npm run build` no projeto Next.js
2. **Cópia de Arquivos**: Copie o conteúdo da pasta `out/` para `site/`
3. **Deploy Automático**: Push para `main` dispara o workflow do GitHub Pages

## URLs

- **Site Principal**: https://unb-mds.github.io/2025-2-Squad-01/
- **Documentação**: https://unb-mds.github.io/2025-2-Squad-01/documentacao.html
- **Métricas**: https://unb-mds.github.io/2025-2-Squad-01/commits.html

## Estrutura do Site

```
site/
├── index.html          # Página principal
├── documentacao.html   # Documentação completa
├── commits.html        # Visualização de métricas
├── _next/             # Assets do Next.js
│   ├── static/
│   │   ├── chunks/    # JavaScript chunks
│   │   ├── css/       # Estilos compilados
│   │   └── media/     # Fontes (Merriweather)
└── *.svg              # Ícones e assets
```

## Atualizações

Para atualizar o site:

1. Faça alterações no projeto Next.js
2. Execute `npm run build`
3. Copie novos arquivos para a pasta `site/`
4. Faça commit e push para `main`
5. O GitHub Actions fará o deploy automaticamente