# Guia de Metodologias Ágeis com Foco

# em Scrum

```
Este documento serve como um guia para entender as principais metodologias ágeis
utilizadas no mercado de desenvolvimento de software, com um foco aprofundado no
framework Scrum, detalhando seu processo e como aplicá-lo passo a passo em um
projeto.
```
## 1. Visão Geral das Metodologias Ágeis

```
Metodologias ágeis são abordagens para o gerenciamento de projetos que priorizam a
flexibilidade, a colaboração e a entrega de valor de forma contínua. Elas contrastam
com o modelo tradicional "Cascata" (Waterfall), que exige um planejamento extensivo
no início e tem pouca abertura para mudanças.
```
```
As metodologias ágeis mais conhecidas são:
```
### Kanban

 Conceito Central: Foco no fluxo de trabalho contínuo e na visualização das tarefas. O
Kanban não utiliza iterações de tempo fixo como o Scrum.
 Como Funciona: As tarefas são representadas por cartões em um quadro (o "Quadro
Kanban") dividido em colunas que representam as etapas do processo (ex: "A Fazer",
"Em Desenvolvimento", "Em Teste", "Concluído"). A principal regra é limitar o
número de tarefas em andamento em cada etapa (Work in Progress - WIP). Quando uma
tarefa é concluída, a equipe "puxa" a próxima tarefa da coluna anterior.
 Ideal para: Equipes que recebem demandas contínuas e de prioridades variáveis, como
equipes de suporte, manutenção ou infraestrutura.

### Extreme Programming (XP)

 Conceito Central: Foco extremo na qualidade técnica do software e na colaboração
intensa entre desenvolvedores e o cliente.
 Como Funciona: O XP promove um conjunto de práticas de engenharia de software
para serem usadas em conjunto. As mais famosas são:
o Programação em Par (Pair Programming): Dois desenvolvedores trabalham juntos
no mesmo computador.
o Desenvolvimento Orientado a Testes (TDD): Escreve-se o teste antes de escrever o
código da funcionalidade.
o Integração Contínua: O código de todos os desenvolvedores é integrado e testado
várias vezes ao dia.
o Cliente Presente: O cliente (ou um representante) trabalha fisicamente junto com a
equipe de desenvolvimento.
 Ideal para: Projetos com requisitos vagos ou que mudam rapidamente, onde a
excelência técnica é um fator crítico de sucesso.


## 2. Foco Aprofundado: O Framework Scrum

```
O Scrum não é uma metodologia, mas sim um framework — uma estrutura dentro da
qual você pode empregar diversas práticas e técnicas. Ele é o mais popular por fornecer
um conjunto claro de papéis, eventos e artefatos que ajudam as equipes a se tornarem
ágeis.
```
### Os Pilares do Scrum

```
O Scrum é baseado no empirismo, que afirma que o conhecimento vem da experiência.
Seus três pilares são:
```
1. Transparência: O trabalho e o progresso devem ser visíveis para todos.
2. Inspeção: Os artefatos e o progresso devem ser inspecionados frequentemente para
    detectar variações indesejadas.
3. Adaptação: Se a inspeção revelar que algo está fora dos limites aceitáveis, o processo
    ou o produto deve ser ajustado.

### Como Utilizar o Scrum Passo a Passo em um Projeto

```
Passo 0: A Preparação (Antes da Primeira Sprint)
```
1. Defina os Papéis:
o Product Owner (PO): Identifique a pessoa que tem a visão do produto e a autoridade
    para tomar decisões sobre ele. Ela será responsável por criar e priorizar o Product
    Backlog.
o Equipe de Desenvolvimento (Dev Team): Reúna a equipe multifuncional
    (desenvolvedores, QAs, designers, etc.) que irá construir o produto. O tamanho ideal é
    entre 3 e 9 pessoas.
o Scrum Master: Defina quem irá desempenhar este papel (no caso, você), garantindo
    que o time entenda e siga o Scrum.
2. Crie o Product Backlog Inicial:
o O PO, com a ajuda da equipe e stakeholders, realiza um brainstorming para listar todas
    as funcionalidades, requisitos e melhorias desejadas para o produto. Cada item é uma
    entrada no Product Backlog (geralmente no formato de User Stories).
o O PO então prioriza essa lista, colocando os itens de maior valor para o negócio no
    topo.
3. Defina a "Definição de Pronto" (Definition of Done - DoD):
o A equipe inteira deve criar um checklist compartilhado do que significa um trabalho
    estar "Pronto". Isso garante a qualidade e a transparência. Exemplos: "Código revisado",
    "Testes automatizados passaram", "Funcionalidade documentada".

```
Passo 1: A Sprint Planning (O Início do Ciclo)
```
```
A Sprint é o coração do Scrum, um ciclo de tempo fixo (geralmente de 1 a 4 semanas)
onde a equipe trabalha para criar um incremento de produto "Pronto".
```

1. O "Quê?": O PO apresenta os itens do topo do Product Backlog para a equipe. A
    Equipe de Desenvolvimento seleciona a quantidade de trabalho que acredita poder
    concluir dentro da Sprint.
2. O "Como?": A equipe quebra os itens selecionados em tarefas menores e cria um
    plano de como irá realizar o trabalho.
3. A Saída: O resultado da reunião é o Sprint Backlog (a lista de itens e tarefas para a
    Sprint) e a Meta da Sprint (um objetivo único que resume o propósito da Sprint).

```
Passo 2: O Trabalho na Sprint (O Dia a Dia)
```
1. Daily Scrum:
o Todos os dias, a Equipe de Desenvolvimento se reúne por no máximo 15 minutos.

o Cada membro responde: O que fiz ontem? O que farei hoje? Há algum impedimento?

o O objetivo é sincronizar o trabalho e identificar bloqueios, que o Scrum Master deve
ajudar a remover.

2. O Trabalho Flui:
o A equipe trabalha nas tarefas do Sprint Backlog. O quadro de tarefas (Kanban board)
    torna o progresso visível para todos.

o O Scrum Master protege a equipe de interrupções e garante que o processo Scrum esteja
sendo seguido.

o O PO está disponível para tirar dúvidas sobre os requisitos.

```
Passo 3: A Sprint Review (Inspeção do Produto)
```
1. Apresentação: Ao final da Sprint, a equipe apresenta o Incremento de produto que foi
    construído para o PO e os stakeholders. Não é uma apresentação formal com slides, mas
    uma demonstração funcional.
2. Feedback: O principal objetivo é coletar feedback sobre o produto. O que os
    stakeholders gostaram? O que pode ser melhorado?
3. Adaptação: Com base no feedback, o PO pode ajustar o Product Backlog, adicionando,
    removendo ou repriorizando itens.

```
Passo 4: A Sprint Retrospective (Inspeção do Processo)
```
1. Reflexão: Após a Review, a equipe (Scrum Master e Equipe de Desenvolvimento) se
    reúne para refletir sobre a Sprint que acabou.
2. Discussão: A equipe discute o que correu bem, o que não correu tão bem e o que pode
    ser melhorado no processo de trabalho, nas ferramentas ou na colaboração.
3. Plano de Ação: A retrospectiva termina com um ou dois itens de melhoria concretos
    que a equipe se compromete a implementar na próxima Sprint.

```
Passo 5: Repetir o Ciclo
```
```
Imediatamente após a Retrospectiva, o ciclo recomeça com a Sprint Planning da
próxima Sprint. Este ciclo de Planejar - > Executar - > Inspecionar - > Adaptar é o
que permite que as equipes ágeis entreguem valor de forma consistente e melhorem
continuamente.
