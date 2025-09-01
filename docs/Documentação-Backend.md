# Documentação do Backend

## O que é Backend?

O **backend** é a parte de uma aplicação web responsável por toda a lógica de negócio, processamento de dados, autenticação, autorização e comunicação com o banco de dados. É a "parte invisível" da aplicação que funciona nos bastidores, processando as requisições enviadas pelo frontend e retornando as respostas apropriadas.

### Principais Responsabilidades do Backend:

- **Processamento de Dados**: Manipula, valida e processa informações recebidas
- **Gerenciamento de Banco de Dados**: Realiza operações de CRUD (Create, Read, Update, Delete)
- **Autenticação e Autorização**: Controla acesso e permissões dos usuários
- **APIs REST**: Fornece endpoints para comunicação com o frontend
- **Lógica de Negócio**: Implementa as regras e processos específicos da aplicação
- **Segurança**: Protege dados sensíveis e previne ataques
- **Performance**: Otimiza consultas e processamento para melhor desempenho

## Como Funciona o Backend?

O backend segue uma arquitetura baseada em **requisição-resposta**:

1. **Recepção da Requisição**: O cliente (frontend/mobile) envia uma requisição HTTP
2. **Roteamento**: O sistema identifica qual endpoint foi chamado
3. **Processamento**: A lógica de negócio é executada
4. **Consulta ao Banco**: Se necessário, dados são buscados ou salvos no banco
5. **Resposta**: O resultado é formatado e enviado de volta ao cliente


## Tecnologias Utilizadas

### 🐍 Django Framework

O **Django** é um framework web robusto para Python, ideal para projetos que exigem integração com APIs externas (como a do GitHub) e manipulação avançada de dados para modelos de IA.

#### Vantagens para o Projeto:
- ✅ Agilidade na integração com APIs (GitHub, IA)
- ✅ Estrutura pronta para manipulação e exposição de métricas
- ✅ Facilidade para implementar autenticação e autorização
- ✅ Suporte nativo a tarefas assíncronas para processamento de dados
- ✅ Comunidade ativa e vasta documentação
- ✅ Modularidade para expandir funcionalidades conforme o projeto evolui

### 🐘 PostgreSQL Database

O **PostgreSQL** é um banco de dados relacional avançado, ideal para armazenar grandes volumes de métricas, dados históricos e resultados de modelos de IA.

#### Vantagens para o Projeto:
- ✅ Armazenamento eficiente de dados complexos e históricos
- ✅ Consultas otimizadas para análise de métricas e resultados de IA
- ✅ Suporte a extensões para machine learning e IA
- ✅ Facilidade de integração com Django ORM
- ✅ Escalabilidade para crescimento do volume de dados
- ✅ Ferramentas avançadas para backup, replicação e alta disponibilidade

## Arquitetura do Backend do Projeo

### Arquitetura MVC (Model-View-Controller)

O padrão MVC é uma arquitetura clássica e eficiente para organizar aplicações backend, separando responsabilidades em três camadas principais:

#### 1. Model 
- **Responsabilidade:** Representa a estrutura dos dados e as regras de negócio da aplicação.
- **Função:** Define os campos, tipos e validações dos dados que serão armazenados no banco.
- **Exemplo de uso:** Usuários, produtos, métricas, etc. Toda manipulação de dados (criação, leitura, atualização, exclusão) é feita através dos modelos.
- **Benefício:** Centraliza e organiza a lógica dos dados, facilitando manutenção e reuso.

#### 2. View 
- **Responsabilidade:** Gerencia a apresentação dos dados para o usuário ou para outras aplicações (como APIs).
- **Função:** Recebe requisições, processa dados vindos dos modelos e retorna respostas (HTML, JSON, etc.).
- **Exemplo de uso:** Endpoints de API, páginas web, respostas para o frontend.
- **Benefício:** Separa a lógica de apresentação da lógica de negócio, tornando o sistema mais flexível e testável.

#### 3. Controller 
- **Responsabilidade:** Coordena a interação entre Model e View, recebendo requisições, executando regras de negócio e decidindo quais dados apresentar.
- **Função:** Processa as requisições do usuário, chama os métodos dos modelos, aplica regras de negócio e retorna a resposta adequada pela View.
- **Exemplo de uso:** Funções que recebem dados do frontend, validam, salvam no banco e retornam o resultado.
- **Benefício:** Centraliza o fluxo da aplicação, facilitando o entendimento e manutenção do código.

---
O padrão MVC torna o backend mais organizado, modular e fácil de manter, sendo ideal para projetos que precisam de clareza na separação de responsabilidades e escalabilidade.

### Exemplos Práticos com Django:

A seguir, veja como aplicar os conceitos do backend usando Django, PostgreSQL e integração com APIs externas, com explicações detalhadas e exemplos simples para quem está começando:

#### 1. Uso de Variáveis de Ambiente (.env)
**O que é?**
Variáveis de ambiente são arquivos que armazenam informações sensíveis (como senhas, tokens de API, configurações de banco de dados) fora do código-fonte. O arquivo `.env` é lido pelo sistema e suas variáveis ficam disponíveis para o projeto.

**Por que usar .env?**
- **Segurança:** Evita expor dados sensíveis no código, protegendo contra vazamentos em repositórios públicos.
- **Facilidade de configuração:** Permite alterar configurações sem modificar o código.
- **Portabilidade:** Facilita o uso do mesmo código em diferentes ambientes (desenvolvimento, produção, testes) apenas trocando o arquivo `.env`.

**Exemplo de arquivo `.env`:**
```
GITHUB_TOKEN=seu_token_aqui
DB_PASSWORD=sua_senha_aqui
```

**Como carregar no Django:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
github_token = os.getenv('GITHUB_TOKEN')
```

#### 2. Modelo
**O que é?**
O modelo representa uma tabela do banco de dados. Ele define os campos e tipos de dados que serão armazenados. No Django, cada modelo é uma classe Python que herda de `models.Model`.

**Para que serve?**
- Estruturar e organizar os dados da aplicação
- Facilitar operações de CRUD (criar, ler, atualizar, deletar)

**Exemplo:**
```python
from django.db import models

class Usuario(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
```

#### 3. Serializer
**O que é?**
Serializers transformam os dados dos modelos em formatos que podem ser enviados ou recebidos por APIs (geralmente JSON). Eles também validam dados recebidos antes de salvar no banco.

**Para que serve?**
- Converter dados do banco para JSON
- Validar dados recebidos via API

**Exemplo:**
```python
from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email']
```

#### 4. ViewSet
**O que é?**
ViewSets são classes que controlam as operações de leitura, criação, atualização e exclusão dos dados via API. Eles facilitam a criação de endpoints RESTful.

**Para que serve?**
- Centralizar a lógica de acesso aos dados
- Expor operações CRUD via API

**Exemplo:**
```python
from rest_framework import viewsets
from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
```

#### 5. Routes/Urls
**O que é?**
Routes ou rotas definem os caminhos/endpoints que o frontend ou outros sistemas usam para acessar as APIs do backend.

**Para que serve?**
- Organizar e expor os serviços da aplicação
- Permitir que clientes acessem dados e funcionalidades

**Exemplo:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

#### 6. Consumo de APIs Externas
**O que é?**
Consiste em buscar dados de outros sistemas (como o GitHub) usando requisições HTTP. No Python, o pacote mais comum é o `requests`.

**Para que serve?**
- Integrar dados de fontes externas
- Enriquecer a aplicação com informações de outros serviços

**Exemplo:**
```python
import requests

def buscar_usuario_github(username):
    url = f"https://api.github.com/users/{username}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None
```

#### 7. Salvando Dados no Banco
**O que é?**
Processo de armazenar dados recebidos de APIs externas ou do frontend no banco de dados usando os modelos do Django.

**Para que serve?**
- Persistir informações para uso futuro
- Organizar dados de forma estruturada

**Exemplo:**
```python
user_data = buscar_usuario_github('octocat')
if user_data:
    Usuario.objects.create(nome=user_data['login'], email=user_data['email'] or '')
```

#### 8. Expondo Dados via API
**O que é?**
Permitir que o frontend ou outros sistemas acessem os dados salvos no backend por meio de endpoints definidos.

**Para que serve?**
- Compartilhar informações com outras aplicações
- Permitir visualização e manipulação dos dados

**Exemplo:**
O frontend pode acessar os dados salvos usando o endpoint `/api/usuarios/`.

---
Esses exemplos mostram o fluxo básico de um backend com Django: buscar dados externos, salvar no banco, e expor via API, usando boas práticas para segurança e organização do código. Cada conceito é explicado para facilitar o entendimento de quem está começando.

