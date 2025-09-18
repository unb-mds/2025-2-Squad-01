# Documentação: Deploy do Front-end com GitHub Pages

**Autor:** [Seu Nome ou Nome do Time]
**Data:** 18 de setembro de 2025
**Status:** Concluído

## 1. Objetivo

Este documento detalha o processo de configuração e deploy do front-end da nossa aplicação, desenvolvida em React e TypeScript, utilizando o serviço **GitHub Pages**. O objetivo é ter uma URL pública e
funcional para demonstração, testes e validação contínua da interface do usuário.

## 2. O que é o GitHub Pages?

O GitHub Pages é um serviço de hospedagem de sites estáticos que extrai os arquivos (HTML, CSS, JavaScript) diretamente de um repositório no GitHub, os processa através de um processo de build e publica o site.

Para nosso projeto, utilizaremos a modalidade de "Project Site", onde o conteúdo de uma branch específica (normalmente `gh-pages`) é servido em uma URL no formato `https://<username>.github.io/<repository-name>`.
## Tópico 1: O que é o GitHub Pages? Uma Análise Detalhada

### 1.1 O Conceito Fundamental: Hospedagem de Sites Estáticos

No nível mais básico, o **GitHub Pages** é um serviço de hospedagem de sites estáticos. Mas o que isso significa?

* **Site Estático:** É um site composto por arquivos pré-renderizados: HTML, CSS, JavaScript e assets (imagens, fontes, etc.). 
O conteúdo que o usuário vê no navegador é exatamente o mesmo que está armazenado nos arquivos do servidor. Não há um processamento do lado do servidor (como PHP, Python ou Node.js) 
para gerar a página dinamicamente a cada visita.

* **Hospedagem:** O GitHub aloca um espaço em seus servidores para armazenar esses arquivos estáticos e os torna acessíveis ao público através de uma URL.

O processo é simples: você envia seus arquivos estáticos para um repositório no GitHub e ele os publica na web. 
É uma solução ideal para portfólios, páginas de documentação e, crucialmente para nós, para a **interface de usuário (front-end) de aplicações modernas**, como as feitas em React.

### 1.2 Por que usar o GitHub Pages?

* **Custo Zero:** É um serviço gratuito para repositórios públicos, tornando-o perfeito para projetos de código aberto, acadêmicos e pessoais.
* **Integração com o Fluxo de Trabalho Git:** O deploy de uma nova versão do site é tão simples quanto um `git push` para uma branch específica. 
Isso se integra perfeitamente ao fluxo de trabalho de desenvolvimento que já usamos.
* **Simplicidade:** A configuração inicial é extremamente rápida e não exige conhecimento em administração de servidores ou infraestrutura complexa.
* **Segurança:** Por servir apenas arquivos estáticos, a superfície de ataque para vulnerabilidades comuns de aplicações web é significativamente reduzida. 
As conexões são servidas via HTTPS por padrão, garantindo a criptografia.

### 1.3 Tipos de Sites no GitHub Pages

Existem dois tipos principais de sites que você pode criar, e é importante entender a diferença, pois ela dita o nome do repositório, a branch de origem e a URL final.

#### 1.3.1 Site de Usuário ou Organização

Este tipo de site funciona como uma página central para um perfil ou uma organização no GitHub.

* **Nome do Repositório:** Deve seguir o padrão exato: `<nome-de-usuario>.github.io`.
* **Branch de Origem:** O conteúdo é publicado a partir da branch `main` (ou `master`).
* **URL Final:** `https://<nome-de-usuario>.github.io`.
* **Limite:** Você só pode ter **um** site deste tipo por conta de usuário ou organização.

#### 1.3.2 Site de Projeto (Nosso caso de uso)

Este é o tipo que usaremos. Ele permite criar um site para cada projeto específico que você tenha.

* **Nome do Repositório:** Pode ser **qualquer nome**.
* **Branch de Origem:** O conteúdo é geralmente publicado a partir de uma branch separada, chamada `gh-pages` por convenção.
Alternativamente, pode-se usar uma pasta `/docs` na branch `main`. Usaremos a abordagem da branch `gh-pages` por ser mais limpa para projetos React.
* **URL Final:** `https://<nome-de-usuario>.github.io/<nome-do-repositorio>`.
* **Limite:** Você pode ter um número ilimitado de sites de projeto.

A estrutura da URL do **Site de Projeto** é um detalhe crucial.
O fato de o site ser servido em um subdiretório (`/<nome-do-repositorio>`) é a razão pela qual precisaremos configurar a propriedade `"homepage"` no arquivo `package.json` da nossa aplicação React,
como veremos nos próximos tópicos. Sem essa configuração, a aplicação tentaria buscar os arquivos JS e CSS a partir da raiz do domínio (`/`), resultando em erros 404.

## 3. Como será utilizado no Projeto?

Nosso front-end é uma **Single Page Application (SPA)** construída com React e TypeScript. O fluxo de utilização do GitHub Pages será o seguinte:

1.  **Desenvolvimento:** O código-fonte do front-end reside na branch principal do projeto (ex: `main` ou `develop`).
2.  **Build:** Ao final de um ciclo de desenvolvimento ou quando um deploy for necessário, executaremos um script que "compila" nossa aplicação React/TypeScript. 
Esse processo, geralmente `npm run build`, gera uma pasta (`build` ou `dist`) contendo arquivos estáticos otimizados (HTML, CSS e JS).
3.  **Deploy:** Os conteúdos dessa pasta de build serão enviados para uma branch dedicada em nosso repositório, chamada `gh-pages`.
4.  **Hospedagem:** O GitHub Pages é configurado para monitorar a branch `gh-pages`. Assim que novos arquivos são enviados para ela, o GitHub automaticamente os publica, atualizando o site que está no ar.

O front-end, uma vez publicado, será responsável por fazer as chamadas HTTP para a nossa API (back-end), que estará hospedada em outro serviço, para buscar e exibir os dados das métricas de colaboração.
## Tópico 2: Arquitetura e Fluxo de Uso no Projeto

Este tópico descreve a estratégia e o fluxo de trabalho que adotaremos para integrar o front-end da nossa aplicação (desenvolvido em React/TypeScript) com o serviço do GitHub Pages.

### 2.1 A Arquitetura: Front-end Desacoplado do Back-end

Nossa aplicação segue uma arquitetura moderna e comum chamada **JAMstack** (JavaScript, APIs, e Markup), onde o front-end e o back-end são entidades separadas e desacopladas.

* **Front-end (Nossa Aplicação React):**
    * **Responsabilidade:** É responsável exclusivamente pela apresentação (a interface com o usuário) e pela lógica de interação no navegador.
    * **Composição:** Após o processo de "build", ele se torna um conjunto de arquivos estáticos (HTML, CSS, JavaScript).
    * **Hospedagem:** Será hospedado no **GitHub Pages**, que é perfeito para servir arquivos estáticos de forma eficiente e gratuita.

* **Back-end (Nossa API):**
    * **Responsabilidade:** É responsável por toda a lógica de negócio, processamento de dados (coleta de métricas do GitHub), persistência em banco de dados e segurança.
    * **Composição:** É uma API (provavelmente REST ou GraphQL) que expõe *endpoints* (URLs) para o front-end consumir.
    * **Hospedagem:** Será hospedado em uma plataforma diferente, adequada para executar código do lado do servidor (como Heroku, Vercel, AWS, etc.).

A comunicação entre eles ocorre via requisições HTTP. 
O front-end (no GitHub Pages) fará chamadas (como `fetch` ou `axios`) para os endpoints da API (hospedada em outro lugar) para buscar os dados das métricas e exibi-los ao usuário.

![Diagrama de Arquitetura](httpsa-url-de-um-diagrama-se-voce-criar-um.png)
*(Opcional: Você pode criar um diagrama simples mostrando uma caixa para "Browser/GitHub Pages", uma para "API/Servidor", e uma seta entre elas indicando "Requisição HTTP / JSON".)*

### 2.2 O Fluxo de Trabalho de Deploy (Workflow)

Entender o fluxo de deploy é essencial para a equipe. Ele será semi-automatizado através de scripts NPM e funcionará da seguinte maneira:

**Passo 1: Desenvolvimento**
* A equipe trabalha normalmente, codificando novas features e corrigindo bugs no código-fonte do front-end, que reside na branch principal de desenvolvimento (ex: `main` ou `develop`).
* Durante o desenvolvimento local, utilizamos o servidor de desenvolvimento do React (`npm start`) para ter o *hot-reload* e um ambiente de testes rápido.

**Passo 2: Geração dos Arquivos Estáticos (Build)**
* Quando uma versão está pronta para ser publicada, o desenvolvedor responsável executa o comando `npm run build`.
* Este comando invoca o compilador do TypeScript e o empacotador do React (Webpack, por baixo dos panos) para realizar as seguintes tarefas:
    1.  Converter o código TypeScript (.tsx, .ts) em JavaScript puro (.js) que os navegadores entendem.
    2.  Transformar o código JSX em funções JavaScript.
    3.  Minificar os arquivos (remover espaços, encurtar nomes de variáveis) para reduzir seu tamanho.
    4.  Agrupar todo o código em alguns poucos arquivos otimizados.
    5.  Injetar os links para esses arquivos JS e CSS no `index.html`.
* O resultado final é uma pasta (geralmente chamada `build` ou `dist`) que contém o site estático pronto para produção. **É este o conteúdo que será hospedado, não o nosso código-fonte `.tsx`.**

**Passo 3: Publicação na Branch `gh-pages`**
* Em vez de copiar e colar manualmente o conteúdo da pasta `build` para uma nova branch, usaremos um script (`npm run deploy`) que automatiza este processo.
* O script fará o "push" do conteúdo da pasta `build` para a branch `gh-pages` no nosso repositório remoto no GitHub.

**Passo 4: A Mágica do GitHub Pages**
* O serviço do GitHub Pages está configurado para "escutar" por atualizações na branch `gh-pages`.
* Assim que o push do passo 3 é concluído, o GitHub Pages automaticamente pega os novos arquivos e os distribui através de sua CDN (Rede de Distribuição de Conteúdo), atualizando o site que está no ar.
* Após alguns instantes, as alterações estarão visíveis para qualquer pessoa que acesse a URL do nosso projeto.

Este fluxo garante que a branch `main` contenha sempre o código-fonte legível e em desenvolvimento, enquanto a branch `gh-pages` serve como um "artefato de deploy", 
contendo apenas o código otimizado e compilado para produção.

## 4. Integração: React, TypeScript e GitHub Pages

Para automatizar o processo de build e deploy, seguiremos os passos abaixo.

### Passo 1: Instalar a dependência `gh-pages`

Esta biblioteca simplifica o processo de enviar o conteúdo da pasta de build para a branch `gh-pages`.

```bash
npm install gh-pages --save-dev
```

### Passo 2: Configurar o `package.json`

Adicionaremos 3 informações importantes ao nosso `package.json`:

1.  **`homepage`**: Uma nova chave no nível raiz do JSON que informa ao React qual é o caminho base da aplicação. É crucial para que os links para os arquivos CSS e JS funcionem corretamente.

2.  **`predeploy`**: Um script que será executado automaticamente antes do script `deploy`. Ele garante que a aplicação seja sempre "buildada" com a versão mais recente do código.

3.  **`deploy`**: O script que efetivamente utiliza a biblioteca `gh-pages` para publicar o conteúdo da pasta `build` na branch `gh-pages`.

```json
{
  "name": "nome-do-seu-projeto",
  "version": "0.1.0",
  // Adicione esta linha. Substitua com seu usuário/organização e nome do repositório.
  "homepage": "[https://seu-usuario.github.io/seu-repositorio](https://seu-usuario.github.io/seu-repositorio)", 
  "private": true,
  "dependencies": {
    // ... suas dependências
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    // Adicione as duas linhas abaixo
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  // ... resto do arquivo
}
```

### Passo 3: Realizar o Deploy

Com a configuração pronta, o deploy se torna um único comando:

```bash
npm run deploy
```

Ao executar este comando, o seguinte acontecerá:
1.  O script `predeploy` (`npm run build`) será executado, criando a pasta `build` com os arquivos estáticos da aplicação.
2.  O script `deploy` (`gh-pages -d build`) pegará o conteúdo da pasta `build` e o enviará para a branch `gh-pages` do seu repositório no GitHub. Se a branch não existir, ela será criada.

### Passo 4: Habilitar o GitHub Pages no Repositório

1.  Navegue até o seu repositório no GitHub.
2.  Clique em **Settings** (Configurações).
3.  No menu lateral, vá para **Pages**.
4.  Na seção "Build and deployment", em **Source**, selecione **Deploy from a branch**.
5.  Em **Branch**, selecione `gh-pages` e a pasta `/(root)`.
6.  Clique em **Save**.

Após alguns minutos, seu site estará no ar na URL definida no campo `homepage` do `package.json`.

## 5. Considerações Importantes

### Roteamento (React Router)

O GitHub Pages não suporta nativamente o roteamento de SPAs que usam a History API do navegador (usada pelo `BrowserRouter` do React Router). Se um usuário acessar `https://.../sua-rota` diretamente, 
o GitHub procurará por um arquivo `sua-rota/index.html` e retornará um erro 404.

**Solução:** Utilize o `HashRouter` em vez do `BrowserRouter`. Ele usa a parte da hash (`#`) na URL para gerenciar o roteamento do lado do cliente, o que é totalmente compatível com o GitHub Pages.

**Exemplo (`src/index.tsx`):**
```typescript
import { HashRouter } from 'react-router-dom';

// ...

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```

### Variáveis de Ambiente

Para que o front-end saiba o endereço da API do back-end, utilizaremos variáveis de ambiente. Crie um arquivo `.env.production` na raiz do projeto com a URL da API de produção.

**`.env.production`:**
```
REACT_APP_API_URL=[https://sua-api-de-producao.com/api](https://sua-api-de-producao.com/api)
```

O React (via Create React App) irá automaticamente incorporar essa variável durante o processo de `build`.
