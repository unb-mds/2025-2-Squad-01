## 📊 Visualização de Estrutura de Repositórios

### Extração e Análise de Dados

```bash
# Configurar token do GitHub
export GITHUB_TOKEN=seu_token_aqui  # Linux/Mac
$env:GITHUB_TOKEN="seu_token_aqui"  # Windows PowerShell

# Executar extração completa
./setup_visualization.sh  # Linux/Mac
./setup_visualization.ps1  # Windows
```

### Dados Gerados

- **Bronze:** `data/bronze/structure_*.json` - Estrutura de arquivos e diretórios
- **Silver:** `data/silver/language_analysis_*.json` - Análise de linguagens

Para mais detalhes, veja [VISUALIZATION_SETUP.md](VISUALIZATION_SETUP.md)