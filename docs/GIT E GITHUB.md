
## 1. O que é Git?

- Git é um **sistema de controle de versão**.
    
- Ele permite acompanhar todas as alterações feitas em arquivos de um projeto.
    
- Funciona como um “histórico infinito”, no qual podemos voltar a versões anteriores, comparar mudanças e trabalhar em paralelo sem perder informações.
    
- É uma ferramenta essencial para **colaboração em equipe**, pois garante que várias pessoas possam contribuir no mesmo projeto sem sobrescrever o trabalho umas das outras.
    

---

## 2. O que é GitHub?

- GitHub é uma **plataforma online** que hospeda repositórios Git.
    
- Pode ser comparado a um **Google Drive para código**, mas com funções adicionais:
    
    - Organização de projetos.
        
    - Controle de acesso.
        
    - Revisão de código.
        
    - Discussões e acompanhamento de tarefas.
        
- Ele conecta o repositório local (no meu computador) ao repositório remoto (na nuvem).
    

---

## 3. Fluxo de Trabalho

Com o Git/GitHub, aprendi a utilizar o fluxo básico que a maioria das equipes segue:

1. **Clonar um repositório**  
    Baixar uma cópia do projeto para o computador.
    
    `git clone URL`
    
2. **Criar um branch**  
    Criar uma “linha de trabalho” separada para não atrapalhar o código principal.
    
    `git checkout -b nome-do-branch`
    
3. **Fazer alterações**  
    Editar, adicionar arquivos ou atualizar documentação.
    
4. **Adicionar e salvar mudanças**
    
    `git add . git commit -m "Mensagem explicando a alteração"`
    
5. **Enviar para o GitHub**
    
    `git push origin nome-do-branch`
    
6. **Abrir um Pull Request**  
    No GitHub, comparar o branch criado com o branch principal (`main`) e pedir revisão da equipe antes de integrar a mudança.
    

---

## 4. Principais Comandos 

- `git status` → verificar o estado do repositório.
    
- `git clone` → baixar o projeto.
    
- `git checkout -b` → criar um novo branch.
    
- `git add .` → preparar os arquivos alterados.
    
- `git commit -m "mensagem"` → salvar mudanças no histórico.
    
- `git push origin branch` → enviar alterações para o GitHub.
    
- `git pull origin main` → atualizar minha cópia com a versão mais recente.
    

---

## 5. Boas Práticas 

- Nunca trabalhar direto no branch principal (`main`).
    
- Criar branches específicos para cada tarefa.
    
- Escrever mensagens de commit claras e descritivas.
    
- Manter a pasta de assets organizada no repositório.
    
- Documentar links, instruções e informações relevantes no `README.md`.
    


