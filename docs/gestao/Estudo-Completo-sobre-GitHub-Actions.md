# Estudo Completo sobre GitHub Actions

## 1. Introdução ao GitHub Actions

O **GitHub Actions** é uma plataforma de Integração Contínua e Entrega Contínua (CI/CD) integrada diretamente ao GitHub. Ela permite automatizar, personalizar e executar fluxos de trabalho de desenvolvimento de software diretamente no seu repositório. Você pode usá-lo para compilar, testar e implantar seu código, além de automatizar qualquer outra tarefa relacionada ao seu projeto.

**Principais componentes:**

- **Workflows (Fluxos de Trabalho):** Processos automatizados definidos em arquivos YAML.
- **Eventos (Events):** Gatilhos que iniciam a execução de um workflow (ex: `push`, `pull_request`).
- **Jobs (Trabalhos):** Conjuntos de etapas (`steps`) que executam em um mesmo executor.
- **Steps (Etapas):** Tarefas individuais que executam comandos ou uma Ação.
- **Actions (Ações):** Pedaços de código reutilizáveis que executam tarefas complexas.
- **Runners (Executores):** Servidores que executam os workflows. Podem ser hospedados pelo GitHub ou auto-hospedados (`self-hosted`).

---

## 2. Tutoriais Básicos de Utilização

### Estrutura de um Workflow YAML

Um workflow é definido em um arquivo `.yml` no diretório `.github/workflows` do seu repositório.

```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
      - name: Run Tests
        run: npm test
```

### Configuração de Eventos

A chave `on` define os gatilhos:

- `on: push`: Roda em cada push.
- `on: pull_request`: Roda em aberturas ou atualizações de Pull Requests.
- `on: schedule`: Roda em um agendamento (ex: `cron: '0 8 * * 1'` para toda segunda-feira às 8h).
- `on: workflow_dispatch`: Permite o acionamento manual pela interface do GitHub.

### Definição de Jobs e Steps

- Jobs rodam em paralelo por padrão. Para executar em sequência, use a chave `needs`.
- Steps são executados em ordem dentro de um job.

### Uso de Actions do Marketplace

Actions simplificam tarefas comuns:

- `actions/checkout@v4`: Clona o código do seu repositório para o runner.
- `actions/setup-node@v4`, `actions/setup-python@v3`, `actions/setup-java@v3`: Configuram o ambiente para a linguagem especificada.

### Gerenciamento de Dependências e Cache

O cache armazena dependências para acelerar execuções futuras. Muitas actions de setup possuem opção de cache integrada.

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm' # Habilita o cache para o gerenciador de pacotes npm
```

### Criação e Teste de Código

Use a chave `run` para executar comandos de linha de comando.

```yaml
- name: Build Project
  run: npm run build --if-present
- name: Run Unit Tests
  run: npm test
```

### Trabalhando com Artefatos de Workflow

Artefatos são arquivos gerados durante um workflow (ex: binários de build) que podem ser salvos e compartilhados entre jobs.

```yaml
- name: Upload Build Artifact
  uses: actions/upload-artifact@v3
  with:
    name: meu-app-build
    path: ./dist # Caminho da pasta de build
```

---

## 3. Gerenciamento Avançado de Workflows

### Workflows Reutilizáveis (Reusable Workflows)

- Evite duplicação criando um workflow reutilizável com o gatilho `on: workflow_call`.
- O workflow que o chama usa:  
  `jobs:<job_id>:uses: <owner>/<repo>/.github/workflows/<workflow.yml>@<ref>`
- **Limitação:** Um workflow reutilizável não pode chamar outro workflow reutilizável.

### Controle de Concorrência (Concurrency)

Evita que múltiplos jobs rodem ao mesmo tempo para o mesmo contexto.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # Cancela a execução antiga se uma nova for iniciada
```

### Ignorando Execuções de Workflow

Inclua `[skip ci]` ou `[ci skip]` na sua mensagem de commit para pular a execução do workflow.

---

## 4. Segurança em GitHub Actions

### Segredos (Secrets) e Variáveis de Ambiente

- **Variáveis de Ambiente (`env`):** Para dados não sensíveis.
- **Segredos (`secrets`):** Para dados sensíveis como tokens e chaves de API. São criptografados e nunca expostos nos logs.

**Boas Práticas:**

- Nunca "hardcode" segredos no arquivo YAML.
- Use o princípio do menor privilégio, concedendo apenas as permissões necessárias.
- O `GITHUB_TOKEN` é um segredo gerado automaticamente com permissões limitadas ao repositório.

### Avaliação de Vulnerabilidades

Integre ferramentas de análise de segurança (SAST/SCA) no seu pipeline:

- **Snyk, SonarCloud, Horusec:** Analisam seu código e dependências em busca de vulnerabilidades.
- **Super-Linter:** Uma action do GitHub que combina vários linters para garantir a qualidade e consistência do código.

### Pinagem de Ações

Para garantir que você está usando a versão exata e segura de uma action de terceiros, use o hash SHA1 completo do commit em vez de uma tag.

```yaml
- uses: actions/checkout@a5ac7e51b41094c92402da3b24376905380afc29 # Hash completo
```

### Eventos `pull_request` vs. `pull_request_target`

- Use `pull_request` para a maioria dos casos.
- `pull_request_target` é perigoso em repositórios públicos, pois pode executar código de um fork com acesso a segredos. Use-o com extremo cuidado.

### Integração com OpenID Connect (OIDC)

A forma mais segura de autenticar com provedores de nuvem (AWS, Azure, GCP). Permite que seus workflows acessem recursos na nuvem sem armazenar chaves de acesso de longa duração como segredos.

### Dependabot para Atualizações de Ações

Ative o Dependabot para receber Pull Requests automáticos que mantêm as versões das suas actions e outras dependências sempre atualizadas e seguras.

---

## 5. Debugging e Monitoramento

- **Debugging com SSH:** Use actions como `tmate/tmate-action` para pausar um workflow e abrir uma sessão SSH no runner, permitindo investigar o ambiente.
- **Teste Local:** Use ferramentas como o Act (`nektos/act`) para rodar seus workflows localmente em um ambiente Docker.
- **Logs:** A aba "Actions" no GitHub oferece visualização detalhada dos logs de cada step. Você pode pesquisar, baixar e excluir logs para análise.

---

## 6. Exemplos de Implantação

### Implantação em Instância EC2 da AWS via SSH

1. Gere um par de chaves SSH.
2. Adicione a chave pública ao arquivo `~/.ssh/authorized_keys` na instância EC2.
3. Adicione a chave privada como um segredo no seu repositório GitHub (ex: `EC2_SSH_KEY`).
4. Use uma action como `appleboy/ssh-action` no seu workflow para se conectar à instância e executar os comandos de deploy.

### Implantação no Azure App Service

- Use OIDC para autenticação segura.
- Configure uma identidade de carga de trabalho (workload identity) no Azure AD.
- Use `azure/login@v1` para autenticar via OIDC.
- Use `azure/webapps-deploy@v2` para publicar seu aplicativo.

### Implantação de Serviços Serverless na AWS com IaC (Lambda, Glue)

1. Configure a integração AWS-GitHub via OIDC: Crie um Identity Provider (IdP) no IAM da AWS e uma Role com as permissões necessárias que confia nesse IdP.
2. Defina sua infraestrutura usando AWS SAM ou CloudFormation em um arquivo `template.yml`.
3. Use um workflow para autenticar na AWS com a Role (via `aws-actions/configure-aws-credentials`), empacotar seu código (`sam package`) e fazer o deploy da stack (`sam deploy`).

---

## 7. Como o GitHub Actions Será Utilizado no Projeto CoOps

- **Coleta Automatizada de Métricas:** Workflows agendados (`schedule`) executarão scripts para extrair dados da API do GitHub, usando concurrency para evitar execuções duplicadas.
- **Processamento e Análise de Dados com IA:** Os workflows irão configurar ambientes (Python/Node.js), processar os dados coletados e disparar chamadas para APIs de IA, usando secrets para as chaves de API.
- **Armazenamento e Compartilhamento de Resultados:** Os dados processados e os insights da IA serão salvos como artefatos para serem consumidos pelo front-end da aplicação.
- **CI/CD para o Desenvolvimento da Própria Ferramenta:** Um workflow será configurado para rodar testes, linter e análise de segurança a cada `pull_request` na `main`, garantindo a qualidade do projeto CoOps.
- **Otimização de Custos e Eficiência:** A equipe optará por runners `ubuntu-latest` sempre que possível, utilizará cache de dependências e otimizará os gatilhos para minimizar o consumo de minutos.

---

## 8. Conclusão

O **GitHub Actions** é uma ferramenta extremamente poderosa e flexível, central para a arquitetura do projeto CoOps, automatizando desde a coleta de dados até a garantia de qualidade do próprio projeto. Os principais benefícios são a automação nativa e a integração profunda com o ecossistema do GitHub.  
Os desafios a serem gerenciados serão a otimização de custos em repositórios privados e a implementação de um pipeline seguro e eficiente.