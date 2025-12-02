# 🤝 Guia de Contribuição - Squad 01

Bem-vindo ao projeto de Análise de Métricas de Repositórios GitHub! Este guia explica como contribuir com o projeto.

---

## 📋 Índice

1. [Primeiros Passos](#-primeiros-passos)
2. [Configuração do Ambiente](#-configuração-do-ambiente)
3. [Git Workflow](#-git-workflow)
4. [Padrões de Código](#-padrões-de-código)
5. [Commits](#-commits)
6. [Pull Requests](#-pull-requests)
7. [Code Review](#-code-review)
8. [Testes](#-testes)

---

## 🚀 Primeiros Passos

### Pré-requisitos

- **Python 3.11+**
- **Node.js 18+** e **npm/yarn**
- **Git** configurado
- **GitHub Account** com acesso ao repositório
- **GitHub Personal Access Token** (para acessar a API)

### Clone do Repositório

```bash
git clone https://github.com/unb-mds/2025-2-Squad-01.git
cd 2025-2-Squad-01
```

---

## ⚙️ Configuração do Ambiente

### Backend (Python)

1. **Criar ambiente virtual:**
   ```bash
   python -m venv .venv
   ```

2. **Ativar ambiente:**
   - **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Linux/Mac:**
     ```bash
     source .venv/bin/activate
     ```

3. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar credenciais GitHub:**
   
   Crie um arquivo `.secrets` na raiz do projeto:
   ```
   GITHUB_TOKEN=seu_token_aqui
   GITHUB_ORG=unb-mds
   ```

5. **Testar extração:**
   ```bash
   python src/bronze/repository_structure.py
   ```

### Frontend (React)

1. **Navegar para o diretório:**
   ```bash
   cd front-end
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Acessar:**
   ```
   http://localhost:5173
   ```

---

## 🌿 Git Workflow

### Estrutura de Branches

```
main (produção)
  ├── development (desenvolvimento integrado)
  │   ├── feature/nome-da-feature (novas funcionalidades)
  │   ├── fix/nome-do-bug (correções)
  │   ├── docs/nome-da-doc (documentação)
  │   └── refactor/nome-refactor (refatorações)
  └── hotfix/nome-urgente (correções urgentes em produção)
```

### Convenção de Nomes de Branches

- **Features:** `feature/issue-42-dashboard-metricas`
- **Fixes:** `fix/issue-55-rate-limit-error`
- **Docs:** `docs/update-readme`
- **Refactor:** `refactor/extract-api-client`
- **Hotfix:** `hotfix/critical-api-error`

### Workflow Padrão

1. **Atualizar main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Criar branch da feature:**
   ```bash
   git checkout -b feature/issue-42-dashboard-metricas
   ```

3. **Fazer alterações e commits:**
   ```bash
   git add .
   git commit -m "feat(dashboard): add metrics visualization"
   ```

4. **Push da branch:**
   ```bash
   git push origin feature/issue-42-dashboard-metricas
   ```

5. **Abrir Pull Request** no GitHub

6. **Code Review** e aprovação

7. **Merge** para `main` (via Squash and Merge)

---

## 📝 Padrões de Código

### Python

**Style Guide:** [PEP 8](https://pep8.org/)

```python
# ✅ Bom
def extract_repository_data(repo_name: str) -> dict:
    """
    Extract repository data from GitHub API.
    
    Args:
        repo_name: Name of the repository
        
    Returns:
        Dictionary with repository data
    """
    response = github_api.get_repository(repo_name)
    return response.json()

# ❌ Evitar
def getData(r):
    resp = api.get(r)
    return resp.json()
```

**Ferramentas:**
- **Formatter:** `black`
- **Linter:** `flake8` ou `pylint`
- **Type Checker:** `mypy`

```bash
# Formatar código
black src/

# Verificar linting
flake8 src/

# Type checking
mypy src/
```

### TypeScript/React

**Style Guide:** [Airbnb Style Guide](https://github.com/airbnb/javascript/tree/master/react)

```typescript
// ✅ Bom
interface RepoData {
  name: string;
  stars: number;
  language: string;
}

export const RepoCard: React.FC<{ data: RepoData }> = ({ data }) => {
  return (
    <div className="repo-card">
      <h3>{data.name}</h3>
      <p>⭐ {data.stars}</p>
      <span>{data.language}</span>
    </div>
  );
};

// ❌ Evitar
export const RepoCard = (props) => {
  return (
    <div>
      <h3>{props.data.name}</h3>
    </div>
  );
};
```

**Ferramentas:**
- **Formatter:** `prettier`
- **Linter:** `eslint`

```bash
# Formatar código
npm run format

# Verificar linting
npm run lint

# Fix automático
npm run lint:fix
```

### Estrutura de Arquivos

```
src/
├── bronze/          # Extração de dados (Bronze layer)
│   ├── commits.py
│   └── repository_structure.py
├── silver/          # Transformação (Silver layer)
│   └── file_language_analysis.py
├── gold/            # Agregação (Gold layer)
│   └── kpis.py
└── utils/           # Utilitários compartilhados
    └── github_api.py

front-end/
├── src/
│   ├── components/  # Componentes reutilizáveis
│   ├── pages/       # Páginas/rotas
│   ├── hooks/       # Custom hooks
│   ├── utils/       # Utilitários
│   └── types/       # Tipos TypeScript
└── public/          # Assets estáticos
```

---

## 💬 Commits

### Conventional Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/).

**Formato:**
```
<tipo>(escopo): <descrição curta>

[corpo opcional]

[footer opcional]
```

### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Adicionar/modificar testes
- `chore`: Tarefas de manutenção
- `perf`: Melhoria de performance
- `ci`: Mudanças em CI/CD

### Exemplos

```bash
# Feature
git commit -m "feat(dashboard): add treemap visualization with D3.js"

# Fix
git commit -m "fix(api): handle rate limit errors with exponential backoff"

# Docs
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(bronze): extract API client to utils"

# Breaking change
git commit -m "feat(api)!: change response format to include metadata

BREAKING CHANGE: API responses now include metadata object"
```

### Boas Práticas

- ✅ **Commits atômicos:** Um commit = uma mudança lógica
- ✅ **Mensagens claras:** Descreva o "o quê" e "por quê"
- ✅ **Presente do indicativo:** "add feature" não "added feature"
- ✅ **Limite 50 caracteres** no título
- ✅ **Linha em branco** entre título e corpo
- ❌ **Evitar commits genéricos:** "fix bug", "update code"

---

## 🔀 Pull Requests

### Template de PR

Ao abrir um PR, preencha o template:

```markdown
## 📋 Descrição
Breve descrição das mudanças implementadas.

## 🔗 Issue Relacionada
Closes #42

## 🎯 Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova feature
- [ ] 📝 Documentação
- [ ] ♻️ Refatoração
- [ ] 🎨 Estilo/UI

## 🧪 Como Testar
1. Rodar `python src/bronze/commits.py`
2. Verificar que dados são extraídos corretamente
3. Checar logs para erros

## 📸 Screenshots (se aplicável)
[Adicionar prints de tela]

## ✅ Checklist
- [ ] Código segue style guide
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] CI/CD passa
- [ ] Code review solicitado
```

### Processo de PR

1. **Abrir PR** assim que tiver código funcional
2. **Draft PR** para work in progress
3. **Assignar reviewers** (mínimo 1)
4. **Aguardar aprovação** (mínimo 1 approve)
5. **Resolver comentários** do code review
6. **Merge** via Squash and Merge

### Boas Práticas de PR

- ✅ **PRs pequenos:** < 400 linhas de mudança
- ✅ **Título descritivo:** "feat(dashboard): add metrics visualization"
- ✅ **Descrição completa:** O que, por que, como
- ✅ **Screenshots/GIFs** para mudanças visuais
- ✅ **Linkar issue:** "Closes #42"
- ✅ **CI/CD passando** antes de solicitar review
- ❌ **Evitar force push** após review iniciado

---

## 👀 Code Review

### Para Autores

**Antes de solicitar review:**
- ✅ Código compila/roda sem erros
- ✅ Testes passam
- ✅ CI/CD está verde
- ✅ Self-review feito
- ✅ Documentação atualizada

**Durante review:**
- ✅ Responder comentários rapidamente
- ✅ Fazer commits de fix separados
- ✅ Agradecer sugestões
- ❌ Não levar feedback para o lado pessoal

### Para Reviewers

**Responsabilidades:**
- ✅ Revisar em até **24 horas**
- ✅ Testar código localmente (se necessário)
- ✅ Comentários construtivos
- ✅ Sugerir melhorias
- ✅ Aprovar quando satisfatório

**Checklist de Review:**
- [ ] **Funcionalidade:** Código faz o que deveria?
- [ ] **Testes:** Tem cobertura adequada?
- [ ] **Performance:** Há gargalos óbvios?
- [ ] **Segurança:** Há vulnerabilidades?
- [ ] **Legibilidade:** Código é claro?
- [ ] **Documentação:** Está atualizada?
- [ ] **Style Guide:** Segue padrões?

**Tipos de Comentários:**

```markdown
# 🔴 Bloqueante (deve ser corrigido)
**BLOCKER:** Esta função tem um bug crítico que causa data loss.

# 🟡 Sugestão (nice to have)
**SUGGESTION:** Considere usar list comprehension aqui para melhor performance.

# 🟢 Nitpick (estilo/preferência)
**NIT:** Espaçamento inconsistente nesta linha.

# 💡 Pergunta (esclarecimento)
**QUESTION:** Por que optou por esta abordagem ao invés de X?

# ✅ Aprovação
**LGTM!** Código está ótimo, apenas um nit sobre formatação.
```

---

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/           # Testes unitários
│   ├── test_api_client.py
│   └── test_data_processing.py
├── integration/    # Testes de integração
│   └── test_etl_pipeline.py
└── e2e/            # Testes end-to-end
    └── test_dashboard.spec.ts
```

### Python - pytest

```python
# tests/unit/test_api_client.py
import pytest
from src.utils.github_api import GitHubAPIClient

def test_get_repository_success():
    """Test successful repository retrieval."""
    client = GitHubAPIClient(token="test_token")
    repo = client.get_repository("unb-mds/2025-2-Squad-01")
    
    assert repo is not None
    assert repo["name"] == "2025-2-Squad-01"

def test_get_repository_not_found():
    """Test repository not found error."""
    client = GitHubAPIClient(token="test_token")
    
    with pytest.raises(RepositoryNotFoundError):
        client.get_repository("fake/repo")
```

**Rodar testes:**
```bash
# Todos os testes
pytest

# Com cobertura
pytest --cov=src

# Teste específico
pytest tests/unit/test_api_client.py::test_get_repository_success

# Verbose
pytest -v
```

### TypeScript/React - Vitest

```typescript
// src/components/RepoCard.test.tsx
import { render, screen } from '@testing-library/react';
import { RepoCard } from './RepoCard';

describe('RepoCard', () => {
  it('renders repository name', () => {
    const mockData = {
      name: 'test-repo',
      stars: 42,
      language: 'TypeScript'
    };
    
    render(<RepoCard data={mockData} />);
    
    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(screen.getByText('⭐ 42')).toBeInTheDocument();
  });
});
```

**Rodar testes:**
```bash
# Todos os testes
npm test

# Watch mode
npm test -- --watch

# Cobertura
npm test -- --coverage
```

### Cobertura Esperada

- **Mínimo:** 70% cobertura geral
- **Crítico:** 90% para funções de API/ETL
- **Frontend:** 60% (componentes principais)

---

## 🐛 Reportar Bugs

### Template de Issue

```markdown
**Descrição do Bug**
Descrição clara do que está acontecendo.

**Como Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
 - OS: [Windows/Mac/Linux]
 - Browser [Chrome, Firefox]
 - Versão [22]

**Contexto Adicional**
Qualquer outra informação relevante.
```

---

## 📚 Recursos

### Documentação do Projeto
- [README.md](../README.md)
- [BACKLOG.md](./BACKLOG.md)
- [ARQUITETURA.md](./ARQUITETURA.md)
- [Documentação de Sprints](./sprints/README.md)

### Guias Externos
- [PEP 8](https://pep8.org/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### Ferramentas
- [GitHub Issues](https://github.com/unb-mds/2025-2-Squad-01/issues)
- [GitHub Projects](https://github.com/unb-mds/2025-2-Squad-01/projects)
- [GitHub Actions](https://github.com/unb-mds/2025-2-Squad-01/actions)

---

## 🤝 Código de Conduta

- ✅ Seja respeitoso e inclusivo
- ✅ Aceite feedback construtivo
- ✅ Foque no que é melhor para a comunidade
- ✅ Mostre empatia com outros contribuidores
- ❌ Não use linguagem ofensiva
- ❌ Não faça ataques pessoais

---

## 💬 Comunicação

### Canais
- **Issues:** Bugs e features
- **Pull Requests:** Code review
- **Discussions:** Questões gerais
- **Atas de Reunião:** [`docs/atas/`](./atas/)

### Reuniões
- **Daily Stand-up:** (se aplicável)
- **Sprint Planning:** Início de cada sprint
- **Sprint Review:** Final de cada sprint
- **Retrospectiva:** Após cada sprint

---

## ❓ FAQ

**Q: Preciso criar issue antes de abrir PR?**  
A: Sim, para features. Para fixes pequenos, pode abrir PR direto.

**Q: Quantos reviewers preciso?**  
A: Mínimo 1 aprovação para merge.

**Q: Posso fazer force push?**  
A: Não após code review iniciado. Antes, apenas se necessário.

**Q: Como atualizar minha branch com main?**  
A: `git checkout main && git pull && git checkout sua-branch && git rebase main`

**Q: Testes são obrigatórios?**  
A: Sim, a partir da Sprint 15. PRs sem testes não serão aprovados.

---

## 🙏 Agradecimentos

Obrigado por contribuir com o projeto! Suas contribuições fazem a diferença.

---

**Mantenedores:**
- Carlos Eduardo
- Gustavo Xavier
- Heitor Macedo
- Pedro Druck
- Pedro Rocha

**Última Atualização:** 01/12/2025
