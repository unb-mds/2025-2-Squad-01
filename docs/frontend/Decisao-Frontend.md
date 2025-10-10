**# Decisão de Tecnologias para o Frontend**
    
    ## Bibilioteca Principal: 
        React com Vite e Typescript
            ### Ponto Forte: Arquitetura de Componentes
                Utilidade no Projeto: O dashboard terá muitas partes que se repetem (por exemplo, um "card" que mostra uma métrica). Cria-se o componente MetricaCard uma vez e o reutiliza para mostrar "Commits", "Issues", "PRs", etc., apenas mudando os dados que se passa para ele. Isso torna o código absurdamente mais limpo, organizado e fácil de dar manutenção.
   
    ## Estilização:
        Tailwind CSS
            ### Ponto Forte: Desenvolvimento Rápido e Focado no HTML/JSX
                Utilidade no Projeto: A construção de um dashboard envolve muito ajuste fino de layout (alinhar este card aqui, dar um espaçamento ali, mudar a cor de um texto...). Com Tailwind, esses ajustes são feitos de forma extremamente ágil, sem criar uma montanha de arquivos .css. Isso mantém o foco na estrutura e na lógica do componente.
   
    ## Comunicação com a API do Github:
        TanStack Query (React Query)
            ### Ponto Forte: Gerenciamento de Estado do Servidor (Server State)
                Utilidade no Projeto: Imagine carregar a página da sua organização. Você precisa mostrar spinners de loading para cada métrica enquanto os dados da API do GitHub são buscados. Se uma chamada falhar, precisa mostrar uma mensagem de erro. Fazer isso manualmente para cada gráfico e card seria um pesadelo de código com useState e useEffect. TanStack Query faz isso por você com pouquíssimas linhas de código.

    ## Gráficos:
        Recharts
            ### Ponto Forte: Abordagem Declarativa e Baseada em Componentes
                Utilidade no Projeto: Isso torna a criação de gráficos muito intuitiva para quem já está pensando em React. É simples e funcional.  