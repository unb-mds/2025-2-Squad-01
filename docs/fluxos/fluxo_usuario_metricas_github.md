# Documentação do Fluxo de Usuário da Aplicação de Métricas do GitHub

## Visão Geral
Esta aplicação foi criada para fornecer métricas detalhadas sobre uma organização no GitHub.  
O fluxo principal consiste em forkar o projeto, configurar credenciais automaticamente, e disponibilizar uma interface via **GitHub Pages**, onde o usuário poderá visualizar as métricas de sua organização.

---

## Fluxo Completo do Usuário

### 1. Início
O usuário inicia o processo de utilização da aplicação.

### 2. Acesso à Landing Page
O usuário é direcionado para a **landing page** da aplicação.

### 3. Verificação de Instalação e Configuração
- **Decisão:** O sistema verifica se o usuário já passou pelas etapas de instalação e configuração.
  - Caso **não tenha passado**, o site detecta a ausência da configuração e apresenta **instruções de configuração**.
  - Caso **já tenha passado**, o usuário segue diretamente para o acesso ao sistema.

### 4. Instruções de Configuração (se necessário)
O sistema informa ao usuário que é preciso configurar o projeto e fornece instruções.

### 5. Fork do Projeto
O usuário realiza o **fork do projeto diretamente para dentro da sua organização** no GitHub.

### 6. Inicialização da Aplicação
O usuário **inicia a aplicação**.

### 7. Obtenção das Credenciais
A aplicação automaticamente:
- Obtém as **credenciais de acesso do usuário**.
- Usa essas credenciais para realizar chamadas autenticadas à **API do GitHub**.

### 8. Armazenamento das Métricas
As métricas obtidas pela API são:
- Armazenadas em um **arquivo JSON local** na máquina do usuário.
- Preparadas para exibição no sistema.

### 9. Retorno à Landing Page
Após a configuração e autenticação:
- O usuário volta para a **landing page** já com acesso liberado ao sistema.

### 10. Escolha de Visualização
- **Decisão:** O usuário escolhe se deseja visualizar métricas mais detalhadas da organização.
  - Caso **não queira**, permanece na landing page.
  - Caso **queira**, acessa a página de métricas da organização.

### 11. Página de Métricas da Organização
Se escolhido:
- O usuário acessa a página de métricas completas.
- Visualiza estatísticas detalhadas sobre sua organização GitHub.

### 12. Fim do Fluxo
O processo de utilização da aplicação é concluído.

