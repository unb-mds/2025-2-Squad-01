# Guia de Metodologias Ágeis com Foco em Scrum

[cite_start]Este documento serve como um guia para entender as principais metodologias ágeis utilizadas no mercado de desenvolvimento de software, com um foco aprofundado no framework Scrum, detalhando seu processo e como aplicá-lo passo a passo em um projeto. [cite: 2]

---

## 1. Visão Geral das Metodologias Ágeis

[cite_start]Metodologias ágeis são abordagens para o gerenciamento de projetos que priorizam a **flexibilidade**, a **colaboração** e a **entrega de valor** de forma contínua. [cite: 4] [cite_start]Elas contrastam com o modelo tradicional "Cascata" (*Waterfall*), que exige um planejamento extensivo no início e tem pouca abertura para mudanças. [cite: 5]

[cite_start]As metodologias ágeis mais conhecidas são: [cite: 6]

### [cite_start]Kanban [cite: 7]
* [cite_start]**Conceito Central:** Foco no fluxo de trabalho contínuo e na visualização das tarefas. [cite: 8] [cite_start]O Kanban não utiliza iterações de tempo fixo como o Scrum. [cite: 9]
* [cite_start]**Como Funciona:** As tarefas são representadas por cartões em um quadro (o "Quadro Kanban") dividido em colunas que representam as etapas do processo (ex: "A Fazer", "Em Desenvolvimento", "Em Teste", "Concluído"). [cite: 10] [cite_start]A principal regra é limitar o número de tarefas em andamento em cada etapa (*Work in Progress - WIP*). [cite: 11] [cite_start]Quando uma tarefa é concluída, a equipe "puxa" a próxima tarefa da coluna anterior. [cite: 12]
* [cite_start]**Ideal para:** Equipes que recebem demandas contínuas e de prioridades variáveis, como equipes de suporte, manutenção ou infraestrutura. [cite: 13]

### [cite_start]Extreme Programming (XP) [cite: 14]
* [cite_start]**Conceito Central:** Foco extremo na qualidade técnica do software e na colaboração intensa entre desenvolvedores e o cliente. [cite: 15]
* [cite_start]**Como Funciona:** O XP promove um conjunto de práticas de engenharia de software para serem usadas em conjunto. [cite: 16] [cite_start]As mais famosas são: [cite: 17]
    * [cite_start]**Programação em Par (Pair Programming):** Dois desenvolvedores trabalham juntos no mesmo computador. [cite: 18]
    * [cite_start]**Desenvolvimento Orientado a Testes (TDD):** Escreve-se o teste antes de escrever o código da funcionalidade. [cite: 19]
    * [cite_start]**Integração Contínua:** O código de todos os desenvolvedores é integrado e testado várias vezes ao dia. [cite: 20]
    * [cite_start]**Cliente Presente:** O cliente (ou um representante) trabalha fisicamente junto com a equipe de desenvolvimento. [cite: 21]
* [cite_start]**Ideal para:** Projetos com requisitos vagos ou que mudam rapidamente, onde a excelência técnica é um fator crítico de sucesso. [cite: 22]

---

## [cite_start]2. Foco Aprofundado: O Framework Scrum [cite: 23]

[cite_start]O Scrum não é uma metodologia, mas sim um **framework** — uma estrutura dentro da qual você pode empregar diversas práticas e técnicas. [cite: 24] [cite_start]Ele é o mais popular por fornecer um conjunto claro de papéis, eventos e artefatos que ajudam as equipes a se tornarem ágeis. [cite: 25]

### [cite_start]Os Pilares do Scrum [cite: 26]

[cite_start]O Scrum é baseado no **empirismo**, que afirma que o conhecimento vem da experiência. [cite: 27] Seus três pilares são:
* [cite_start]**Transparência:** O trabalho e o progresso devem ser visíveis para todos. [cite: 28]
* [cite_start]**Inspeção:** Os artefatos e o progresso devem ser inspecionados frequentemente para detectar variações indesejadas. [cite: 29]
* [cite_start]**Adaptação:** Se a inspeção revelar que algo está fora dos limites aceitáveis, o processo ou o produto deve ser ajustado. [cite: 30]

### [cite_start]Como Utilizar o Scrum Passo a Passo em um Projeto [cite: 31]

#### [cite_start]Passo 0: A Preparação (Antes da Primeira Sprint) [cite: 32]
1.  [cite_start]**Defina os Papéis:** [cite: 33]
    * [cite_start]**Product Owner (PO):** Identifique a pessoa que tem a visão do produto e a autoridade para tomar decisões sobre ele. [cite: 34] [cite_start]Ela será responsável por criar e priorizar o **Product Backlog**. [cite: 35]
    * [cite_start]**Equipe de Desenvolvimento (Dev Team):** Reúna a equipe multifuncional (desenvolvedores, QAs, designers, etc.) que irá construir o produto. [cite: 36] [cite_start]O tamanho ideal é entre 3 e 9 pessoas. [cite: 37]
    * [cite_start]**Scrum Master:** Defina quem irá desempenhar este papel, garantindo que o time entenda e siga o Scrum. [cite: 38]
2.  [cite_start]**Crie o Product Backlog Inicial:** [cite: 39]
    * [cite_start]O PO, com a ajuda da equipe e stakeholders, realiza um brainstorming para listar todas as funcionalidades, requisitos e melhorias desejadas para o produto. [cite: 40] [cite_start]Cada item é uma entrada no Product Backlog (geralmente no formato de *User Stories*). [cite: 41]
    * [cite_start]O PO então prioriza essa lista, colocando os itens de maior valor para o negócio no topo. [cite: 42]
3.  [cite_start]**Defina a "Definição de Pronto" (Definition of Done - DoD):** [cite: 43]
    * [cite_start]A equipe inteira deve criar um checklist compartilhado do que significa um trabalho estar "Pronto". [cite: 44] Isso garante a qualidade e a transparência. [cite_start]Exemplos: "Código revisado", "Testes automatizados passaram", "Funcionalidade documentada". [cite: 45]

#### [cite_start]Passo 1: A Sprint Planning (O Início do Ciclo) [cite: 46]
* [cite_start]A Sprint é o coração do Scrum, um ciclo de tempo fixo (geralmente de 1 a 4 semanas) onde a equipe trabalha para criar um incremento de produto "Pronto". [cite: 47]
* [cite_start]**O "Quê?":** O PO apresenta os itens do topo do Product Backlog para a equipe. [cite: 48] [cite_start]A Equipe de Desenvolvimento seleciona a quantidade de trabalho que acredita poder concluir dentro da Sprint. [cite: 49]
* [cite_start]**O "Como?":** A equipe quebra os itens selecionados em tarefas menores e cria um plano de como irá realizar o trabalho. [cite: 50]
* [cite_start]**A Saída:** O resultado da reunião é o **Sprint Backlog** (a lista de itens e tarefas para a Sprint) e a **Meta da Sprint** (um objetivo único que resume o propósito da Sprint). [cite: 51]

#### [cite_start]Passo 2: O Trabalho na Sprint (O Dia a Dia) [cite: 52]
* [cite_start]**Daily Scrum:** [cite: 53] [cite_start]Todos os dias, a Equipe de Desenvolvimento se reúne por no máximo 15 minutos. [cite: 54] Cada membro responde: O que fiz ontem? O que farei hoje? [cite_start]Há algum impedimento? [cite: 55] [cite_start]O objetivo é sincronizar o trabalho e identificar bloqueios, que o Scrum Master deve ajudar a remover. [cite: 56]
* [cite_start]**O Trabalho Flui:** [cite: 57] A equipe trabalha nas tarefas do Sprint Backlog. [cite_start]O quadro de tarefas (Kanban board) torna o progresso visível para todos. [cite: 58] [cite_start]O Scrum Master protege a equipe de interrupções e garante que o processo Scrum esteja sendo seguido. [cite: 59] [cite_start]O PO está disponível para tirar dúvidas sobre os requisitos. [cite: 60]

#### [cite_start]Passo 3: A Sprint Review (Inspeção do Produto) [cite: 61]
* [cite_start]**Apresentação:** Ao final da Sprint, a equipe apresenta o **Incremento** de produto que foi construído para o PO e os stakeholders. [cite: 62] [cite_start]Não é uma apresentação formal com slides, mas uma demonstração funcional. [cite: 63]
* [cite_start]**Feedback:** O principal objetivo é coletar feedback sobre o produto. [cite: 64] O que os stakeholders gostaram? [cite_start]O que pode ser melhorado? [cite: 65]
* [cite_start]**Adaptação:** Com base no feedback, o PO pode ajustar o Product Backlog, adicionando, removendo ou repriorizando itens. [cite: 66]

#### [cite_start]Passo 4: A Sprint Retrospective (Inspeção do Processo) [cite: 67]
* [cite_start]**Reflexão:** Após a Review, a equipe (Scrum Master e Equipe de Desenvolvimento) se reúne para refletir sobre a Sprint que acabou. [cite: 68]
* [cite_start]**Discussão:** A equipe discute o que correu bem, o que não correu tão bem e o que pode ser melhorado no processo de trabalho, nas ferramentas ou na colaboração. [cite: 69]
* [cite_start]**Plano de Ação:** A retrospectiva termina com um ou dois itens de melhoria concretos que a equipe se compromete a implementar na próxima Sprint. [cite: 70]

#### [cite_start]Passo 5: Repetir o Ciclo [cite: 71]
* [cite_start]Imediatamente após a Retrospectiva, o ciclo recomeça com a Sprint Planning da próxima Sprint. [cite: 72] [cite_start]Este ciclo de **Planejar -> Executar -> Inspecionar -> Adaptar** é o que permite que as equipes ágeis entreguem valor de forma consistente e melhorem continuamente. [cite: 73]
