# Manual Completo de Git e GitHub: Um

# Tutorial Prático

## 1. Conceitos Fundamentais: O que é Git e GitHub?

 Git: É um sistema de controle de versão distribuído, o que significa que ele rastreia
todas as alterações feitas nos seus arquivos ao longo do tempo. Cada desenvolvedor tem
uma cópia completa do histórico do projeto, permitindo trabalhar de forma
independente e depois juntar as alterações.
 GitHub: É uma plataforma online que hospeda seus repositórios Git. Ele adiciona uma
camada de colaboração sobre o Git, com ferramentas para revisão de código (Pull
Requests), gerenciamento de tarefas (Issues) e muito mais.

## 2. Configuração Inicial

```
Antes de tudo, você precisa ter o Git instalado e se apresentar a ele.
```
1. Instale o Git: Baixe e instale o Git a partir do site oficial.
2. Configure sua Identidade: Abra o terminal (ou Git Bash no Windows) e execute os
    comandos abaixo. Essas informações serão gravadas em cada alteração que você fizer.
3. # Define seu nome de usuário globalmente
4. git config --global user.name "Seu Nome Completo"
5.
6. # Define seu e-mail globalmente
7. git config --global user.email "seu-email@exemplo.com"

## 3. O Fluxo de Trabalho Básico: Do Local para o

## Repositório

```
O Git trabalha com três "áreas" principais na sua máquina:
```
1. Working Directory (Diretório de Trabalho): A pasta do seu projeto, onde você edita
    os arquivos.
2. Staging Area (Área de Preparação): Uma área intermediária onde você agrupa as
    alterações que deseja salvar juntas.
3. Repository (Repositório Local - **.git** ): Onde o Git armazena permanentemente o
    histórico de todas as suas alterações salvas (commits).

### Comandos Essenciais do Dia a Dia

 git init
o O que faz: Inicia um novo repositório Git na pasta atual.
o Quando usar: No início de um projeto novo que ainda não está sob controle de versão.
 git clone [URL_DO_REPOSITORIO]
o O que faz: Cria uma cópia exata de um repositório que já existe no GitHub (ou outro
servidor remoto) para a sua máquina.


o Quando usar: Quando você quer começar a trabalhar em um projeto que já existe.
 git status
o O que faz: Mostra o estado atual do seu repositório: quais arquivos foram modificados,
quais estão na Staging Area e quais não estão sendo rastreados.
o Quando usar: O tempo todo! É seu principal comando para entender o que está
acontecendo.
 git add [nome_do_arquivo]
o O que faz: Adiciona as alterações de um arquivo do seu Working Directory para a
Staging Area. Use git add. para adicionar todos os arquivos modificados de uma
vez.
o Quando usar: Depois de fazer alterações significativas em um ou mais arquivos e antes
de fazer um commit.
 git commit - m "Mensagem descritiva do que foi feito"
o O que faz: Salva permanentemente as alterações que estão na Staging Area no seu
repositório local. A mensagem é crucial para entender o histórico do projeto.
o Quando usar: Após adicionar todas as alterações relacionadas a uma tarefa específica
na Staging Area.

## 4. Branches: Trabalhando em Universos Paralelos

```
Conceito de Branch: Uma branch (ramificação) é uma linha de desenvolvimento
independente. Pense nela como uma cópia do seu projeto onde você pode trabalhar em
uma nova funcionalidade ou corrigir um bug sem afetar a versão principal e estável do
código (que geralmente fica na branch main ou master).
```
### Comandos para Gerenciar Branches

 git branch
o O que faz: Lista todas as branches locais. A branch com um * na frente é a que você
está usando no momento.
 git branch [nome-da-nova-branch]
o O que faz: Cria uma nova branch.
o Quando usar: Quando você quer criar uma nova linha de desenvolvimento, mas ainda
não quer mudar para ela.
 git checkout [nome-da-branch]
o O que faz: Muda o seu Working Directory para o estado da branch especificada.
o Quando usar: Para alternar entre as diferentes linhas de desenvolvimento.
 git checkout - b [nome-da-nova-branch]
o O que faz: Um atalho poderoso que cria uma nova branch e muda para ela em um
único comando.
o Quando usar: É a forma mais comum de iniciar o trabalho em uma nova tarefa. Ex:
git checkout - b feature/tela-de-login.


## 5. Conectando com o Remoto: Push e Pull

```
Conceito de Push e Pull: Seu repositório local e o repositório no GitHub são duas
entidades separadas. Para mantê-los sincronizados, você usa os comandos push e pull.
```
 Push (Empurrar): Envia seus commits locais para o GitHub.
 Pull (Puxar): Traz os commits do GitHub para o seu repositório local.

### Comandos para Sincronização

 git push origin [nome-da-branch]
o O que faz: Envia todos os commits da sua branch local para a branch de mesmo nome
no repositório remoto (chamado por padrão de origin).
o Quando usar: Quando você finaliza uma parte do trabalho localmente e quer salvá-la
no GitHub ou compartilhá-la com a equipe.
 git pull origin [nome-da-branch]
o O que faz: Baixa as atualizações da branch remota e as mescla (faz o merge) com a sua
branch local.
o Quando usar: Antes de começar a trabalhar, para garantir que você tenha a versão mais
recente do código, ou para receber atualizações feitas por outros membros da equipe.

## 6. Integrando Alterações: Merge vs. Rebase

```
Quando você termina o trabalho em uma branch, precisa integrar essas alterações de
volta na branch principal (main). Existem duas formas principais de fazer isso:
```
### Merge (Mesclar)

 Conceito: git merge une o histórico de duas branches. Ele cria um novo commit,
chamado de "merge commit", que tem dois "pais" e une as duas linhas de
desenvolvimento.
 Como funciona:

1. git checkout main (Vá para a branch que vai receber as alterações)
2. git pull origin main (Garanta que ela está atualizada)
3. git merge feature/tela-de-login (Traga as alterações da sua branch)
 Vantagem: Preserva o histórico exatamente como ele aconteceu, mostrando quando e
    como as branches foram unidas. É considerado mais seguro porque não reescreve o
    histórico.

### Rebase (Rebasear)

 Conceito: git rebase move a sua branch inteira para começar no "topo" da branch de
destino. Em vez de criar um "merge commit", ele reescreve o histórico do seu projeto,
aplicando seus commits um por um sobre o último commit da branch de destino,
criando um histórico linear e limpo.
 Como funciona:

1. git checkout feature/tela-de-login (Vá para a branch com suas alterações)
2. git rebase main (Mova sua branch para o topo da main)


 Vantagem: O histórico fica muito mais limpo e fácil de ler, como se todo o trabalho
tivesse sido feito em uma única linha reta.
 A Regra de Ouro do Rebase: Nunca use rebase em branches públicas/compartilhadas
(como a main). Como ele reescreve o histórico, isso pode causar enormes problemas
para outros desenvolvedores que já têm cópias daquele histórico. Use rebase apenas
nas suas branches locais, antes de compartilhá-las.

## 7. Comandos Úteis Adicionais

 git log
o O que faz: Mostra o histórico de commits. Use git log --oneline --graph --
decorate para uma visualização mais limpa e gráfica.
 git diff
o O que faz: Mostra as diferenças entre o que está no seu Working Directory e o que está
na Staging Area ou no último commit.
o Quando usar: Para revisar suas alterações antes de adicioná-las com git add.
 git stash
o O que faz: Salva temporariamente suas alterações não commitadas, limpando seu
Working Directory.
o Quando usar: Quando você precisa mudar de branch rapidamente, mas não quer fazer
um commit do trabalho incompleto que está fazendo. Use git stash pop para trazer as
alterações de volta.
 git reset [arquivo]
o O que faz: Tira um arquivo da Staging Area (git reset HEAD [arquivo]) ou desfaz
commits (cuidado com esta opção!).
o Quando usar: Quando você adicionou um arquivo à Staging Area por engano.
 .gitignore
o O que é: Um arquivo de texto onde você lista arquivos e pastas que o Git deve ignorar
completamente (ex: arquivos de configuração de IDE, dependências de projeto como
node_modules).

