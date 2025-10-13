# Documentação de Testes e Análise da API do GitHub

## Objetivo
Este documento descreve como testar a **API do GitHub** utilizando ferramentas como o [Postman](https://www.postman.com/) ou **cURL**, além de como realizar uma análise básica das respostas retornadas.

---

## Pré-requisitos
Antes de iniciar os testes, você precisará de:

- Conta no [GitHub](https://github.com/)  
- Token de acesso pessoal (PAT) para autenticação (opcional, mas recomendado)  
- Postman instalado **ou** terminal com `cURL` disponível  

---

## Endpoints Utilizados

1. **Listar repositórios públicos de um usuário**
   ```http
   GET https://api.github.com/users/{username}/repos
2. **Listar commits de um repositório**
   ```http
   GET https://api.github.com/repos/{owner}/{repo}/commits
3. **Listar branches de um repositório**
   ```http
   GET https://api.github.com/repos/{owner}/{repo}/branches
4. **Buscar informações de um usuário**
   ```http
  GET https://api.github.com/users/{username}

# 🧪 Testando no Postman

1. Abra o **Postman**  
2. Crie uma **nova requisição**  
3. Defina o método HTTP (`GET`)  
4. Insira a URL do endpoint (exemplo):  
https://api.github.com/users/octocat/repos

5. Clique em **Send** para executar a requisição  
6. Analise o **JSON** retornado  

> **Dica**: Se o JSON for muito grande, use a aba **Pretty** do Postman ou o atalho `Ctrl + F` para procurar campos específicos.

---

# Testando com cURL

```bash
# Listar repositórios de um usuário
curl https://api.github.com/users/octocat/repos

# Listar commits de um repositório
curl https://api.github.com/repos/octocat/Hello-World/commits

Quando tiver um token do github:
curl -H "Authorization: token SEU_TOKEN_AQUI" https://api.github.com/user

# 📊 Como Analisar a API

## 1. Estrutura da Resposta
- A resposta geralmente é em **JSON**  
- Identifique os principais campos de cada endpoint (ex: `name`, `full_name`, `html_url` em repositórios; `commit.message` em commits)  

## 2. Status Code
- `200 OK` → requisição bem-sucedida  
- `404 Not Found` → usuário/repos não existe  
- `403 Forbidden` → limite de requisições excedido (rate limit)  

## 3. Paginação
- Muitos endpoints retornam resultados paginados  
- Verifique os headers da resposta:  
Link: https://api.github.com/user/repos?page=2
; rel="next"


## 4. Rate Limit
- Para usuários não autenticados: **60 requisições/hora**  
- Para usuários autenticados (com token): **5000 requisições/hora**  

Verificar com:
```bash
curl https://api.github.com/rate_limit


