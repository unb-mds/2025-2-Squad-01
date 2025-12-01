#!/usr/bin/env python3

import os
import json
import time
import hashlib
import requests
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

class GitHubAPIClient:
    def __init__(self, token: str, cache_dir: str = "cache"):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json"
        }
        self.cache_dir = cache_dir
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
        # GraphQL endpoint
        self.graphql_url = "https://api.github.com/graphql"
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
    
    def _get_cache_key(self, key: str) -> str:
        """Create a stable cache key from an arbitrary string."""
        return hashlib.md5(key.encode()).hexdigest() + ".json"
    
    def _cache_get(self, cache_key: str) -> Optional[Any]:
        """Get response from cache if exists"""
        cache_file = os.path.join(self.cache_dir, self._get_cache_key(cache_key))
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def _cache_set(self, cache_key: str, data: Any) -> None:
        cache_file = os.path.join(self.cache_dir, self._get_cache_key(cache_key))
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def _check_rate_limit_proactive(self) -> Optional[str]:
        """Verifica rate limit ANTES de fazer requisições pesadas."""
        try:
            response = requests.get(
                "https://api.github.com/rate_limit",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                graphql_limit = data.get('resources', {}).get('graphql', {})
                remaining = graphql_limit.get('remaining', 0)
                limit = graphql_limit.get('limit', 0)
                reset_time = graphql_limit.get('reset', 0)
                
                if remaining < 10:  # Menos de 10 requests restantes
                    reset_dt = datetime.fromtimestamp(reset_time)
                    wait_seconds = (reset_dt - datetime.now()).total_seconds()
                    if wait_seconds > 0:
                        print(f"[WARN] Low rate limit: {remaining}/{limit} - waiting {wait_seconds:.0f}s")
                        time.sleep(wait_seconds + 5)  # +5s de margem
                        return f"Waited for rate limit reset"
                
                return f"{remaining}/{limit} requests remaining"
        except Exception as e:
            # Não falhar se verificação falhar
            return None
        return None
    
    def get_with_cache(self, url: str, use_cache: bool = True, retries: int = 3, backoff_base: float = 1.0) -> Any:
        if use_cache:
            cached = self._cache_get(url)
            if cached is not None:
                print(f"✓ Using cached data for: {url}")
                return cached
        
        print(f"→ Fetching from API: {url}")
        attempt = 0
        while attempt < retries:
            try:
                response = requests.get(url, headers=self.headers, timeout=30)

                if response.status_code == 200:
                    data = response.json()
                    if use_cache:
                        self._cache_set(url, data)
                    self._log_rate_limit(response)
                    return data
                elif response.status_code == 403:
                    print(f"[ERROR] API request forbidden (403) - might be private or rate limited: {response.text}")
                    if "rate limit" in response.text.lower():
                        print("Rate limit exceeded. Waiting 60 seconds...")
                        time.sleep(60)
                    else:
                        print("Access forbidden - resource might be private or require different permissions")
                        return None
                elif response.status_code == 404:
                    print(f"[ERROR] Resource not found (404): {url}")
                    return None
                elif 500 <= response.status_code < 600:
                    attempt += 1
                    wait = backoff_base * (2 ** (attempt - 1))
                    print(f"[WARN] API {response.status_code} - retrying in {wait:.1f}s (attempt {attempt}/{retries})")
                    time.sleep(wait)
                    continue
                else:
                    print(f"[ERROR] API request failed: {response.status_code} - {response.text}")
                    return None
            except requests.exceptions.Timeout:
                attempt += 1
                wait = backoff_base * (2 ** (attempt - 1))
                print(f"[ERROR] Request timeout for: {url} - retrying in {wait:.1f}s (attempt {attempt}/{retries})")
                time.sleep(wait)
                continue
            except requests.exceptions.RequestException as e:
                print(f"[ERROR] Request error for {url}: {str(e)}")
                return None
        print(f"[ERROR] Exhausted retries for: {url}")
        return None

    # ----------------------
    # GraphQL support (API v4)
    # ----------------------
    def graphql(self, query: str, variables: Optional[Dict[str, Any]] = None, use_cache: bool = True, retries: int = 2, backoff_base: float = 1.0) -> Any:
        """Execute a GraphQL query against GitHub's v4 API with optional caching."""
        payload = {"query": query, "variables": variables or {}}

        cache_key = None
        if use_cache:
            try:
                cache_key = "graphql:" + hashlib.md5(
                    (query + "::" + json.dumps(payload["variables"], sort_keys=True, ensure_ascii=False)).encode("utf-8")
                ).hexdigest()
                cached = self._cache_get(cache_key)
                if cached is not None:
                    print("✓ Using cached GraphQL response")
                    return cached
            except Exception:
                cache_key = None

        headers = dict(self.headers)
        headers["Content-Type"] = "application/json"

        attempt = 0
        while attempt < retries:
            try:
                # Throttle GraphQL calls - 0.6s balanceado para performance
                time.sleep(0.6)

                response = requests.post(self.graphql_url, headers=headers, json=payload, timeout=60)
                if response.status_code == 200:
                    data = response.json()
                    if "errors" in data:
                        print(f"[ERROR] GraphQL returned errors: {data['errors']}")
                        return None
                    if use_cache and cache_key:
                        self._cache_set(cache_key, data)
                    self._log_rate_limit(response)
                    return data
                elif response.status_code == 403:
                    # Secondary rate limit - aguardar antes de retry
                    attempt += 1
                    if "secondary rate limit" in response.text.lower():
                        wait = 60  # 1 minuto para secondary rate limit
                        print(f"[WARN] Secondary rate limit hit - waiting {wait}s (attempt {attempt}/{retries})")
                        print(f"       Response: {response.text[:200]}")
                    else:
                        wait = 30  # 30s para outros 403
                        print(f"[ERROR] GraphQL forbidden (403) - waiting {wait}s (attempt {attempt}/{retries})")
                    time.sleep(wait)
                    if attempt >= retries:
                        print(f"[ERROR] Exhausted retries after 403 errors")
                        return None
                    continue
                elif 500 <= response.status_code < 600:
                    attempt += 1
                    wait = backoff_base * (2 ** (attempt - 1))
                    print(f"[WARN] GraphQL {response.status_code} - retrying in {wait:.1f}s (attempt {attempt}/{retries})")
                    time.sleep(wait)
                    continue
                else:
                    print(f"[ERROR] GraphQL request failed: {response.status_code} - {response.text}")
                    return None
            except requests.exceptions.Timeout:
                attempt += 1
                wait = backoff_base * (2 ** (attempt - 1))
                print(f"[ERROR] GraphQL request timeout - retrying in {wait:.1f}s (attempt {attempt}/{retries})")
                time.sleep(wait)
                continue
            except requests.exceptions.RequestException as e:
                print(f"[ERROR] GraphQL request error: {str(e)}")
                return None
        print("[ERROR] Exhausted GraphQL retries")
        return None

    def graphql_commit_history(
        self,
        owner: str,
        repo: str,
        page_size: int = 50,
        max_pages: Optional[int] = None,
        max_commits: Optional[int] = None,
        since: Optional[str] = None,
        until: Optional[str] = None,
        use_cache: bool = True,
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        commits: List[Dict[str, Any]] = []
        cursor: Optional[str] = None
        pages = 0
        rate_meta: Dict[str, Any] = {}

        query = """
        query($owner: String!, $name: String!, $pageSize: Int!, $cursor: String, $since: GitTimestamp, $until: GitTimestamp) {
          repository(owner: $owner, name: $name) {
            name
            defaultBranchRef {
              name
              target {
                ... on Commit {
                  history(first: $pageSize, after: $cursor, since: $since, until: $until) {
                    pageInfo { hasNextPage endCursor }
                    nodes {
                      oid
                      messageHeadline
                      committedDate
                      pushedDate
                      url
                      author { name email date user { login } }
                      committer { name email date user { login } }
                      additions
                      deletions
                    }
                  }
                }
              }
            }
          }
          rateLimit { remaining resetAt limit cost }
        }
        """

        while True:
            if max_pages is not None and pages >= max_pages:
                break

            variables = {
                "owner": owner,
                "name": repo,
                "pageSize": page_size,
                "cursor": cursor,
                "since": since,
                "until": until,
            }
            data = self.graphql(query, variables, use_cache=use_cache)
            if not data:
                break

            repo_data = data.get("data", {}).get("repository")
            rate_meta = data.get("data", {}).get("rateLimit", {}) or {}
            if not repo_data or not repo_data.get("defaultBranchRef"):
                break

            target = repo_data["defaultBranchRef"].get("target", {})
            history = target.get("history") if isinstance(target, dict) else None
            if not history:
                break

            nodes = history.get("nodes", [])
            if max_commits is not None and max_commits >= 0:
                remaining = max_commits - len(commits)
                if remaining <= 0:
                    break
                commits.extend(nodes[:remaining])
            else:
                commits.extend(nodes)

            page_info = history.get("pageInfo", {})
            has_next = page_info.get("hasNextPage")
            cursor = page_info.get("endCursor")
            pages += 1
            if not has_next:
                break

        return commits, rate_meta

    def rest_repository_tree(
        self,
        owner: str,
        repo: str,
        branch: str = "main",
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Extrai a árvore completa de arquivos usando REST API git/trees.
        
        MUITO MAIS EFICIENTE que GraphQL!
        - 1 requisição vs centenas
        - 30 segundos vs 3 horas
        - Sem secondary rate limits
        
        Baseado em: https://github.com/githubocto/repo-visualizer
        API Docs: https://docs.github.com/en/rest/git/trees
        
        Args:
            owner: Proprietário do repositório
            repo: Nome do repositório
            branch: Branch a ser analisado (padrão: 'main')
            use_cache: Se deve usar cache
        
        Returns:
            Dicionário com estrutura hierárquica de arquivos e diretórios
        """
        logger = logging.getLogger(__name__)
        logger.info(f"Fetching repository tree for {owner}/{repo} (branch: {branch}) using REST API")
        
        # Primeiro, obter SHA do branch
        branch_url = f"https://api.github.com/repos/{owner}/{repo}/branches/{branch}"
        branch_data = self.get_with_cache(branch_url, use_cache=use_cache)
        
        if not branch_data or 'commit' not in branch_data:
            logger.error(f"Failed to get branch info for {owner}/{repo}:{branch}")
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': [],
                'error': 'Failed to get branch information',
                'extracted_at': datetime.now().isoformat()
            }
        
        tree_sha = branch_data['commit']['commit']['tree']['sha']
        
        # Buscar árvore recursivamente - A MÁGICA ESTÁ AQUI!
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1"
        tree_data = self.get_with_cache(tree_url, use_cache=use_cache)
        
        if not tree_data or 'tree' not in tree_data:
            logger.error(f"Failed to get tree data for {owner}/{repo}")
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': [],
                'error': 'Failed to get tree data',
                'extracted_at': datetime.now().isoformat()
            }
        
        # Converter formato REST para nosso formato hierárquico
        def build_hierarchy(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
            """
            Converte lista flat da API REST em estrutura hierárquica.
            
            REST retorna:
            [{"path": "src/main.py", "type": "blob", ...}, ...]
            
            Precisamos transformar em:
            [{"name": "src", "type": "directory", "children": [...]}]
            """
            root: List[Dict[str, Any]] = []
            path_map: Dict[str, Dict[str, Any]] = {}
            
            # Primeiro, criar todos os nós
            for item in items:
                path = item.get('path', '')
                item_type = item.get('type', '')
                size = item.get('size', 0)
                
                # Extrair nome do arquivo/diretório
                parts = path.split('/')
                name = parts[-1]
                
                # Detectar extensão
                extension = ''
                if item_type == 'blob' and '.' in name:
                    extension = '.' + name.split('.')[-1]
                
                node = {
                    'name': name,
                    'path': path,
                    'type': 'file' if item_type == 'blob' else 'directory',
                }
                
                if item_type == 'blob':
                    node['extension'] = extension
                    node['size'] = size
                    node['is_binary'] = False  # REST não retorna isso, assumir False
                else:
                    node['children'] = []
                
                path_map[path] = node
            
            # Depois, construir hierarquia
            for path, node in path_map.items():
                parts = path.split('/')
                
                if len(parts) == 1:
                    # Item raiz
                    root.append(node)
                else:
                    # Item aninhado - encontrar pai
                    parent_path = '/'.join(parts[:-1])
                    parent = path_map.get(parent_path)
                    
                    if parent and 'children' in parent:
                        parent['children'].append(node)
                    else:
                        # Pai não existe (não deveria acontecer), adicionar à raiz
                        root.append(node)
            
            return root
        
        try:
            tree = build_hierarchy(tree_data['tree'])
            
            logger.info(f"Successfully built tree with {len(tree_data['tree'])} items")
            
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': tree,
                'total_items': len(tree_data['tree']),
                'truncated': tree_data.get('truncated', False),
                'extracted_at': datetime.now().isoformat(),
                'method': 'rest_git_trees'  # Identificar método usado
            }
        except Exception as e:
            logger.error(f"Failed to build hierarchy: {str(e)}")
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': [],
                'error': str(e),
                'extracted_at': datetime.now().isoformat()
            }

    def get_paginated(
        self,
        base_url: str,
        use_cache: bool = True,
        per_page: int = 100,
        start_page: int = 1,
        max_pages: Optional[int] = None,
    ) -> List[Any]:
        """
        Fetch all pages for list endpoints that support per_page & page params.
        
        Args:
            base_url: URL base do endpoint
            use_cache: Se deve usar cache
            per_page: Itens por página
            start_page: Página inicial
            max_pages: Número máximo de páginas
        
        Returns:
            Lista agregada de todos os resultados
        """
        results: List[Any] = []
        page = start_page
        while True:
            if max_pages is not None and page > max_pages:
                break
            sep = '&' if ('?' in base_url) else '?'
            url = f"{base_url}{sep}per_page={per_page}&page={page}"
            data = self.get_with_cache(url, use_cache)
            if data is None:
                break
            if isinstance(data, list):
                results.extend(data)
                if len(data) < per_page:
                    break
            else:
                break
            page += 1
        return results
    
    def _log_rate_limit(self, response: requests.Response) -> None:
        """Log rate limit info and warn if getting low."""
        remaining = response.headers.get('X-RateLimit-Remaining', 'Unknown')
        limit = response.headers.get('X-RateLimit-Limit', 'Unknown')
        reset_time = response.headers.get('X-RateLimit-Reset', 'Unknown')
        
        if reset_time != 'Unknown':
            reset_datetime = datetime.fromtimestamp(int(reset_time))
            
            # Warning se rate limit está baixo
            if remaining != 'Unknown':
                remaining_int = int(remaining)
                if remaining_int < 100:
                    print(f"⚠️  LOW RATE LIMIT: {remaining}/{limit}, resets at {reset_datetime}")
                elif remaining_int < 500:
                    print(f"Rate limit: {remaining}/{limit}, resets at {reset_datetime}")
            else:
                print(f"Rate limit: {remaining}/{limit}, resets at {reset_datetime}")
        else:
            print(f"Rate limit: {remaining}/{limit}")


# ============================================================================
# FUNÇÕES AUXILIARES (FORA DA CLASSE)
# ============================================================================

def save_json_data(data: Any, filepath: str, timestamp: bool = True) -> str:
    """
    Salva dados em arquivo JSON com metadados opcionais.
    
    Args:
        data: Dados a serem salvos
        filepath: Caminho do arquivo
        timestamp: Se deve adicionar timestamp
    
    Returns:
        Caminho do arquivo salvo
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    if timestamp:
        now = datetime.now().isoformat()
        if isinstance(data, dict):
            data['_metadata'] = {
                'extracted_at': now,
                'file_path': filepath
            }
        elif isinstance(data, list) and len(data) > 0:
            metadata = {
                '_metadata': {
                    'extracted_at': now,
                    'file_path': filepath,
                    'record_count': len(data)
                }
            }
            data = [metadata] + data
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved data to: {filepath}")
    return filepath

def load_json_data(filepath: str) -> Any:
    """
    Carrega dados de arquivo JSON.
    
    Args:
        filepath: Caminho do arquivo
    
    Returns:
        Dados carregados ou None se arquivo não existir
    """
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def update_data_registry(layer: str, entity: str, files: List[str]) -> None:
    """
    Atualiza registro de arquivos gerados por camada.
    
    Args:
        layer: Camada (bronze, silver, gold)
        entity: Entidade (repositories, commits, etc.)
        files: Lista de arquivos gerados
    """
    registry_path = f"data/{layer}/registry.json"
    
    registry = load_json_data(registry_path) or {}
    
    if entity not in registry:
        registry[entity] = {}
    
    registry[entity]['files'] = files
    registry[entity]['updated_at'] = datetime.now().isoformat()
    registry[entity]['layer'] = layer
    
    save_json_data(registry, registry_path, timestamp=False)

def parse_github_date(date_str: str) -> Optional[datetime]:
    """
    Parse GitHub API date strings in various formats.
    Handles both UTC (Z) and timezone offset formats.
    
    Args:
        date_str: Date string from GitHub API
        
    Returns:
        datetime object or None if parsing fails
    """
    if not date_str:
        return None
    
    date_str = str(date_str).strip()
    
    # Try multiple date formats that GitHub uses
    formats = [
        '%Y-%m-%dT%H:%M:%SZ',  # UTC format: 2025-09-21T17:13:42Z
        '%Y-%m-%dT%H:%M:%S',    # Without timezone
    ]
    
    # Handle ISO 8601 format with timezone offset (e.g., 2025-09-21T17:13:42-03:00)
    if '+' in date_str or (date_str.count('-') > 2):  # Check for timezone offset
        try:
            # Extract the base datetime part (YYYY-MM-DDTHH:MM:SS)
            # Remove timezone suffix like -03:00 or +05:30
            base_date_str = date_str[:19]  # First 19 chars: YYYY-MM-DDTHH:MM:SS
            return datetime.strptime(base_date_str, '%Y-%m-%dT%H:%M:%S')
        except (ValueError, IndexError):
            pass
    
    # Try standard formats
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    # If all parsing fails, return None
    return None


class OrganizationConfig:
    """
    Configuração de organização para filtragem de repositórios.
    """
    def __init__(self, org_name: str):
        self.org_name = org_name
        self.repo_blacklist: List[str] = []
    
    def should_skip_repo(self, repo: Dict[str, Any]) -> bool:
        """
        Verifica se um repositório deve ser ignorado.
        
        # Do not skip any repository to enable full extraction
        return False
    
