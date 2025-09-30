# Documentação do Backend

## O que é Backend?

O **backend** é a parte de uma aplicação web responsável por toda a lógica de negócio, processamento de dados, autenticação, autorização e comunicação com o banco de dados. É a "parte invisível" da aplicação que funciona nos bastidores, processando as requisições enviadas pelo frontend e retornando as respostas apropriadas.

### Principais Responsabilidades do Backend:

- **Processamento de Dados**: Manipula, valida e processa informações da API do GitHub
- **Integração com APIs Externas**: Consome dados da API do GitHub em tempo real
- **Transformação de Dados**: Aplica arquitetura medalhão para estruturar dados (Bronze, Silver, Gold)
- **APIs REST**: Fornece endpoints para comunicação com o frontend
- **Lógica de Negócio**: Implementa as regras de análise de métricas de produtividade
- **Segurança**: Protege tokens de acesso e previne ataques
- **Performance**: Otimiza processamento de dados em memória para melhor desempenho

## Como Funciona o Backend?

O backend segue uma arquitetura baseada em **requisição-resposta** com processamento em tempo real:

1. **Recepção da Requisição**: O cliente (frontend) solicita dados de métricas do GitHub
2. **Roteamento**: O sistema identifica qual endpoint foi chamado
3. **Processamento**: A lógica de negócio é executada e dados são buscados da API do GitHub
4. **Transformação**: Os dados passam pela arquitetura medalhão (Bronze → Silver → Gold)
5. **Resposta**: O resultado processado é formatado e enviado de volta ao cliente


## Tecnologias Utilizadas

### 🐍 Django Framework

O **Django** é um framework web robusto para Python, ideal para projetos que exigem integração com APIs externas (como a do GitHub) e processamento avançado de dados em tempo real.

#### Vantagens para o Projeto:
- ✅ Agilidade na integração com APIs (GitHub)
- ✅ Estrutura flexível para processamento e exposição de métricas
- ✅ Facilidade para implementar autenticação com tokens de API
- ✅ Suporte nativo a tarefas assíncronas para processamento de dados
- ✅ Comunidade ativa e vasta documentação
- ✅ Modularidade para expandir funcionalidades conforme o projeto evolui

### � Processamento em Tempo Real

O projeto utiliza **processamento em memória** para análise de dados do GitHub, sem necessidade de persistência em banco de dados. Os dados são obtidos em tempo real da API do GitHub e processados através da arquitetura medalhão.

#### Vantagens para o Projeto:
- ✅ Dados sempre atualizados diretamente da fonte (GitHub)
- ✅ Menor complexidade de infraestrutura sem banco de dados
- ✅ Performance superior com processamento em memória
- ✅ Facilidade de manutenção e deploy
- ✅ Escalabilidade horizontal simples
- ✅ Redução de custos operacionais sem infraestrutura de banco

## Arquitetura do Backend do Projeto

### Arquitetura Medalhão (Bronze, Silver, Gold)

A arquitetura medalhão é um padrão moderno para processamento de dados que organiza o pipeline em três camadas hierárquicas, cada uma com responsabilidades específicas e níveis crescentes de qualidade e refinamento dos dados.

#### 1. Camada Bronze (Dados Brutos)
- **Responsabilidade:** Ingestão e armazenamento dos dados brutos exatamente como recebidos da API do GitHub.
- **Função:** Captura dados em tempo real sem transformações, mantendo a estrutura original da API.
- **Exemplo de uso:** Dados de commits, issues, pull requests, contribuidores diretamente da API GitHub.
- **Benefício:** Preserva a integridade dos dados originais e permite reprocessamento posterior se necessário.

#### 2. Camada Silver (Dados Limpos e Validados)
- **Responsabilidade:** Limpeza, validação e estruturação dos dados brutos da camada Bronze.
- **Função:** Aplica regras de negócio, remove inconsistências, padroniza formatos e enriquece os dados.
- **Exemplo de uso:** Normalização de datas, validação de tipos, agregação de métricas básicas, cálculo de estatísticas.
- **Benefício:** Dados confiáveis e estruturados, prontos para análises mais complexas.

#### 3. Camada Gold (Dados Analíticos)
- **Responsabilidade:** Criação de datasets otimizados para análise e apresentação, com métricas de alto nível.
- **Função:** Agrega dados da camada Silver em métricas de produtividade, KPIs e insights de negócio.
- **Exemplo de uso:** Métricas de produtividade da equipe, análise de padrões de contribuição, relatórios executivos.
- **Benefício:** Dados prontos para consumo direto pelo frontend, otimizados para performance e clareza.

---

### Fluxo de Processamento

```
API GitHub → Bronze → Silver → Gold → Frontend
```

1. **Bronze**: Dados brutos da API GitHub são coletados em tempo real
2. **Silver**: Dados são limpos, validados e estruturados
3. **Gold**: Métricas finais são calculadas e otimizadas para apresentação
4. **Frontend**: Consome dados da camada Gold via APIs REST

---

A arquitetura medalhão garante qualidade progressiva dos dados, facilita manutenção e permite que diferentes partes do sistema consumam dados no nível de refinamento adequado às suas necessidades.

### Exemplos Práticos com Django e Arquitetura Medalhão:

A seguir, veja como aplicar os conceitos do backend usando Django para processamento em tempo real com arquitetura medalhão, com explicações detalhadas e exemplos práticos:

#### 1. Uso de Variáveis de Ambiente (.env)
**O que é?**
Variáveis de ambiente são arquivos que armazenam informações sensíveis (como tokens de API, configurações de acesso) fora do código-fonte. O arquivo `.env` é lido pelo sistema e suas variáveis ficam disponíveis para o projeto.

**Por que usar .env?**
- **Segurança:** Evita expor dados sensíveis no código, protegendo contra vazamentos em repositórios públicos.
- **Facilidade de configuração:** Permite alterar configurações sem modificar o código.
- **Portabilidade:** Facilita o uso do mesmo código em diferentes ambientes (desenvolvimento, produção, testes) apenas trocando o arquivo `.env`.

**Exemplo de arquivo `.env`:**
```
GITHUB_TOKEN=seu_token_aqui
GITHUB_API_URL=https://api.github.com
```

**Como carregar no Django:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
github_token = os.getenv('GITHUB_TOKEN')
```

#### 2. Camada Bronze - Consumo de Dados Brutos
**O que é?**
A camada Bronze coleta dados brutos diretamente da API do GitHub sem transformações, mantendo a estrutura original.

**Para que serve?**
- Capturar dados em tempo real da fonte original
- Preservar integridade dos dados para posterior reprocessamento

**Exemplo:**
```python
import requests
from datetime import datetime

class GitHubBronzeLayer:
    def __init__(self, token):
        self.token = token
        self.headers = {'Authorization': f'token {token}'}
    
    def fetch_raw_commits(self, owner, repo):
        """Busca dados brutos de commits diretamente da API"""
        url = f"https://api.github.com/repos/{owner}/{repo}/commits"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return {
                'data': response.json(),
                'fetched_at': datetime.utcnow().isoformat(),
                'source': 'github_api'
            }
        return None
```

#### 3. Camada Silver - Limpeza e Estruturação
**O que é?**
A camada Silver processa os dados brutos da Bronze, aplicando limpeza, validação e estruturação.

**Para que serve?**
- Limpar e validar dados inconsistentes
- Padronizar formatos e estruturas
- Aplicar regras de negócio básicas

**Exemplo:**
```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class CleanCommit:
    sha: str
    author: str
    date: datetime
    message: str
    additions: int
    deletions: int

class GitHubSilverLayer:
    def clean_commits(self, bronze_data: dict) -> List[CleanCommit]:
        """Limpa e estrutura dados de commits da camada Bronze"""
        commits = []
        
        for commit_data in bronze_data.get('data', []):
            try:
                clean_commit = CleanCommit(
                    sha=commit_data['sha'][:7],  # Versão curta do SHA
                    author=commit_data['commit']['author']['name'],
                    date=datetime.fromisoformat(
                        commit_data['commit']['author']['date'].replace('Z', '+00:00')
                    ),
                    message=commit_data['commit']['message'].split('\n')[0],  # Primeira linha
                    additions=commit_data.get('stats', {}).get('additions', 0),
                    deletions=commit_data.get('stats', {}).get('deletions', 0)
                )
                commits.append(clean_commit)
            except (KeyError, ValueError) as e:
                print(f"Erro ao processar commit: {e}")
                continue
        
        return commits
```

#### 4. Camada Gold - Métricas e Insights
**O que é?**
A camada Gold agrega dados da Silver em métricas de alto nível e insights de negócio.

**Para que serve?**
- Calcular KPIs e métricas de produtividade
- Gerar insights para tomada de decisão
- Otimizar dados para apresentação no frontend

**Exemplo:**
```python
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class ProductivityMetrics:
    total_commits: int
    active_contributors: int
    average_commits_per_day: float
    top_contributors: List[tuple]
    commit_frequency: dict

class GitHubGoldLayer:
    def calculate_productivity_metrics(self, silver_commits: List[CleanCommit]) -> ProductivityMetrics:
        """Calcula métricas de produtividade da camada Silver"""
        
        # Análise de contribuidores
        contributor_commits = defaultdict(int)
        daily_commits = defaultdict(int)
        
        for commit in silver_commits:
            contributor_commits[commit.author] += 1
            day = commit.date.date()
            daily_commits[day] += 1
        
        # Top 5 contribuidores
        top_contributors = sorted(
            contributor_commits.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5]
        
        # Média de commits por dia
        total_days = len(daily_commits) if daily_commits else 1
        avg_commits_per_day = len(silver_commits) / total_days
        
        return ProductivityMetrics(
            total_commits=len(silver_commits),
            active_contributors=len(contributor_commits),
            average_commits_per_day=round(avg_commits_per_day, 2),
            top_contributors=top_contributors,
            commit_frequency=dict(daily_commits)
        )
```

#### 5. Serializer para APIs
**O que é?**
Serializers transformam os dados processados das camadas medalhão em formatos JSON para APIs.

**Para que serve?**
- Converter dados Python para JSON
- Validar dados recebidos via API

**Exemplo:**
```python
from rest_framework import serializers

class ProductivityMetricsSerializer(serializers.Serializer):
    total_commits = serializers.IntegerField()
    active_contributors = serializers.IntegerField()
    average_commits_per_day = serializers.FloatField()
    top_contributors = serializers.ListField(
        child=serializers.ListField(child=serializers.CharField())
    )
    commit_frequency = serializers.DictField()
```

#### 6. ViewSet para Exposição de Dados
**O que é?**
ViewSets controlam o acesso aos dados processados através de endpoints REST.

**Para que serve?**
- Expor métricas da camada Gold via API
- Orquestrar o pipeline Bronze → Silver → Gold em tempo real

**Exemplo:**
```python
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

class GitHubMetricsViewSet(viewsets.ViewSet):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bronze_layer = GitHubBronzeLayer(os.getenv('GITHUB_TOKEN'))
        self.silver_layer = GitHubSilverLayer()
        self.gold_layer = GitHubGoldLayer()
    
    @action(detail=False, methods=['get'])
    def productivity_metrics(self, request):
        """Endpoint para obter métricas de produtividade em tempo real"""
        owner = request.query_params.get('owner')
        repo = request.query_params.get('repo')
        
        if not owner or not repo:
            return Response({'error': 'owner and repo parameters are required'}, status=400)
        
        # Pipeline Bronze → Silver → Gold
        bronze_data = self.bronze_layer.fetch_raw_commits(owner, repo)
        if not bronze_data:
            return Response({'error': 'Failed to fetch data from GitHub'}, status=500)
        
        silver_commits = self.silver_layer.clean_commits(bronze_data)
        gold_metrics = self.gold_layer.calculate_productivity_metrics(silver_commits)
        
        serializer = ProductivityMetricsSerializer(gold_metrics)
        return Response(serializer.data)
```

#### 7. Routes/Urls
**O que é?**
Routes definem os endpoints que o frontend usa para acessar as métricas processadas.

**Para que serve?**
- Organizar e expor os serviços de métricas
- Permitir acesso aos dados das diferentes camadas

**Exemplo:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GitHubMetricsViewSet

router = DefaultRouter()
router.register(r'github-metrics', GitHubMetricsViewSet, basename='github-metrics')

urlpatterns = [
    path('api/', include(router.urls)),
]
```

#### 8. Exemplo de Uso no Frontend
**O que é?**
Como o frontend pode consumir as métricas processadas pela arquitetura medalhão.

**Para que serve?**
- Apresentar dados de produtividade em tempo real
- Permitir análise visual das métricas

**Exemplo de chamada:**
```javascript
// Frontend consumindo métricas de produtividade
fetch('/api/github-metrics/productivity_metrics/?owner=microsoft&repo=vscode')
  .then(response => response.json())
  .then(data => {
    console.log('Métricas de produtividade:', data);
    // Exibir métricas no dashboard
  });
```

---
Esses exemplos mostram o fluxo completo da arquitetura medalhão: Bronze (dados brutos da API), Silver (dados limpos e estruturados), Gold (métricas finais), e exposição via API para consumo do frontend, tudo processado em tempo real sem necessidade de banco de dados.

