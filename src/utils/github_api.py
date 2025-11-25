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

    def graphql(self, query: str, variables: Optional[Dict[str, Any]] = None, use_cache: bool = True, retries: int = 3, backoff_base: float = 1.0) -> Any:
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
                time.sleep(0.5)

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
                    print(f"[ERROR] GraphQL forbidden (403): {response.text}")
                    return None
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

    def graphql_repository_tree_optimized(
        self,
        owner: str,
        repo: str,
        branch: str = "main",
        use_cache: bool = True,
        max_depth: int = 10
    ) -> Dict[str, Any]:
        """
        VERSÃO OTIMIZADA: Busca árvore completa em 1-3 requisições usando queries aninhadas.
        Reduz de 500+ requests para 1-3 requests (até 10x mais rápido)!
        
        Args:
            owner: Proprietário do repositório
            repo: Nome do repositório
            branch: Branch a ser analisada
            use_cache: Se deve usar cache
            max_depth: Profundidade máxima de aninhamento (até 10)
        
        Returns:
            Dicionário com a árvore hierárquica completa
        """
        logger = logging.getLogger(__name__)
        
        # ✅ QUERY COM 5 NÍVEIS DE PROFUNDIDADE ANINHADOS
        # Busca arquivos e diretórios até 5 níveis de profundidade de uma vez
        query = """
        query($owner: String!, $repo: String!, $expression: String!) {
        repository(owner: $owner, name: $repo) {
            object(expression: $expression) {
            ... on Tree {
                entries {
                name
                type
                path
                extension
                object {
                    ... on Blob {
                    byteSize
                    isBinary
                    oid
                    }
                    ... on Tree {
                    entries {
                        name
                        type
                        path
                        extension
                        object {
                        ... on Blob {
                            byteSize
                            isBinary
                            oid
                        }
                        ... on Tree {
                            entries {
                            name
                            type
                            path
                            extension
                            object {
                                ... on Blob {
                                byteSize
                                isBinary
                                oid
                                }
                                ... on Tree {
                                entries {
                                    name
                                    type
                                    path
                                    extension
                                    object {
                                    ... on Blob {
                                        byteSize
                                        isBinary
                                        oid
                                    }
                                    ... on Tree {
                                        entries {
                                        name
                                        type
                                        path
                                        extension
                                        object {
                                            ... on Blob {
                                            byteSize
                                            isBinary
                                            oid
                                            }
                                        }
                                        }
                                    }
                                    }
                                }
                                }
                            }
                            }
                        }
                        }
                    }
                    }
                }
                }
            }
            }
        }
        }
        """
        
        variables = {
            "owner": owner,
            "repo": repo,
            "expression": f"{branch}:"
        }
        
        logger.info(f"⚡ Fetching ENTIRE tree in ONE request for {owner}/{repo}")
        
        try:
            start_time = time.time()
            result = self.graphql(query, variables, use_cache=use_cache)
            elapsed = time.time() - start_time
            
            if not result or 'data' not in result:
                logger.error("No data returned from GraphQL")
                return self._empty_tree_response(owner, repo, branch, error="No data")
            
            repo_obj = result.get('data', {}).get('repository', {})
            if not repo_obj:
                logger.error("Repository not found")
                return self._empty_tree_response(owner, repo, branch, error="Repo not found")
            
            tree_obj = repo_obj.get('object', {})
            entries = tree_obj.get('entries', [])
            
            # ✅ Processar árvore aninhada recursivamente
            tree = self._process_nested_entries(entries)
            total_items = self._count_tree_items(tree)
            
            logger.info(f"✅ Fetched entire tree in {elapsed:.2f}s! Total items: {total_items}")
            
            # ✅ Verificar se precisa buscar diretórios mais profundos
            deep_dirs = self._find_incomplete_directories(tree, current_depth=5)
            
            if deep_dirs:
                logger.warning(f"⚠️  Found {len(deep_dirs)} directories deeper than 5 levels")
                logger.info(f"📁 Fetching deep directories: {deep_dirs[:3]}...")
                
                # Buscar diretórios profundos adicionais
                for dir_path in deep_dirs[:20]:  # Limitar a 20 diretórios extras
                    self._fetch_and_merge_directory(tree, owner, repo, branch, dir_path, use_cache)
            
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': tree,
                'extracted_at': datetime.now().isoformat(),
                'method': 'graphql_optimized',
                'total_items': self._count_tree_items(tree),
                'extraction_time_seconds': elapsed
            }
            
        except Exception as e:
            logger.error(f"Error in optimized extraction: {str(e)}")
            # Fallback para método antigo se falhar
            logger.warning("⚠️  Falling back to iterative method...")
            return self.graphql_repository_tree(owner, repo, branch, use_cache)

    def _process_nested_entries(self, entries: List[Dict[str, Any]], current_depth: int = 0) -> List[Dict[str, Any]]:
        """
        Processa entradas aninhadas da query GraphQL recursiva.
        
        Args:
            entries: Lista de entradas do GraphQL
            current_depth: Profundidade atual na árvore
        
        Returns:
            Lista de nós processados
        """
        if not entries:
            return []
        
        result = []
        
        for entry in entries:
            entry_type = entry.get('type')
            entry_name = entry.get('name')
            entry_path = entry.get('path')
            
            if not entry_name or not entry_path:
                continue
            
            if entry_type == 'tree':
                # É diretório - processar filhos recursivamente
                directory_node = {
                    'name': entry_name,
                    'path': entry_path,
                    'type': 'directory',
                    'children': [],
                    'depth': current_depth
                }
                
                # ✅ Buscar sub-entradas aninhadas
                obj = entry.get('object', {})
                sub_entries = obj.get('entries', [])
                
                if sub_entries:
                    directory_node['children'] = self._process_nested_entries(
                        sub_entries, 
                        current_depth + 1
                    )
                else:
                    # Marcar como incompleto se não tem filhos mas deveria ter
                    directory_node['incomplete'] = True
                
                result.append(directory_node)
                
            elif entry_type == 'blob':
                # É arquivo
                blob_info = entry.get('object', {})
                file_node = {
                    'name': entry_name,
                    'path': entry_path,
                    'type': 'file',
                    'extension': entry.get('extension', ''),
                    'size': blob_info.get('byteSize', 0),
                    'is_binary': blob_info.get('isBinary', False),
                    'oid': blob_info.get('oid', ''),
                    'depth': current_depth
                }
                result.append(file_node)
        
        return result

    def _count_tree_items(self, tree: List[Dict[str, Any]]) -> int:
        """
        Conta total de itens (arquivos + diretórios) na árvore.
        
        Args:
            tree: Árvore de arquivos
        
        Returns:
            Total de itens
        """
        count = 0
        for item in tree:
            count += 1
            if item.get('type') == 'directory' and 'children' in item:
                count += self._count_tree_items(item['children'])
        return count

    def _find_incomplete_directories(
        self, 
        tree: List[Dict[str, Any]], 
        current_depth: int = 0
    ) -> List[str]:
        """
        Encontra diretórios que podem estar incompletos (mais profundos que max_depth).
        
        Args:
            tree: Árvore de arquivos
            current_depth: Profundidade atual
        
        Returns:
            Lista de paths de diretórios incompletos
        """
        incomplete = []
        
        for item in tree:
            if item.get('type') == 'directory':
                if item.get('incomplete'):
                    incomplete.append(item['path'])
                
                if 'children' in item:
                    incomplete.extend(
                        self._find_incomplete_directories(
                            item['children'], 
                            current_depth + 1
                        )
                    )
        
        return incomplete

    def _fetch_and_merge_directory(
        self,
        tree: List[Dict[str, Any]],
        owner: str,
        repo: str,
        branch: str,
        dir_path: str,
        use_cache: bool
    ) -> None:
        """
        Busca conteúdo de um diretório específico e mescla na árvore existente.
        
        Args:
            tree: Árvore principal
            owner: Proprietário do repositório
            repo: Nome do repositório
            branch: Branch
            dir_path: Caminho do diretório a buscar
            use_cache: Se deve usar cache
        """
        logger = logging.getLogger(__name__)
        
        try:
            # Query simples para 1 diretório
            query = """
            query($owner: String!, $repo: String!, $expression: String!) {
            repository(owner: $owner, name: $repo) {
                object(expression: $expression) {
                ... on Tree {
                    entries {
                    name
                    type
                    path
                    extension
                    object {
                        ... on Blob {
                        byteSize
                        isBinary
                        oid
                        }
                    }
                    }
                }
                }
            }
            }
            """
            
            variables = {
                "owner": owner,
                "repo": repo,
                "expression": f"{branch}:{dir_path}"
            }
            
            result = self.graphql(query, variables, use_cache=use_cache)
            
            if not result or 'data' not in result:
                return
            
            repo_obj = result.get('data', {}).get('repository', {})
            tree_obj = repo_obj.get('object', {})
            entries = tree_obj.get('entries', [])
            
            if not entries:
                return
            
            # Processar entradas
            processed = self._process_nested_entries(entries)
            
            # Encontrar diretório na árvore e mesclar
            self._merge_into_tree(tree, dir_path, processed)
            
            logger.debug(f"   ✓ Merged {len(processed)} items into {dir_path}")
            
        except Exception as e:
            logger.error(f"   ❌ Error fetching directory {dir_path}: {str(e)}")

    def _merge_into_tree(
        self,
        tree: List[Dict[str, Any]],
        target_path: str,
        new_children: List[Dict[str, Any]]
    ) -> bool:
        """
        Mescla novos filhos em um diretório específico da árvore.
        
        Args:
            tree: Árvore principal
            target_path: Path do diretório alvo
            new_children: Novos filhos a adicionar
        
        Returns:
            True se mesclado com sucesso
        """
        for item in tree:
            if item.get('path') == target_path:
                # Encontrou o diretório alvo
                item['children'] = new_children
                item['incomplete'] = False
                return True
            
            if item.get('type') == 'directory' and 'children' in item:
                if self._merge_into_tree(item['children'], target_path, new_children):
                    return True
        
        return False

    def graphql_repository_tree(
        self,
        owner: str,
        repo: str,
        branch: str = "main",
        use_cache: bool = True,
        max_depth: int = 100
    ) -> Dict[str, Any]:
        """
        Extrai a árvore completa de arquivos e diretórios usando GraphQL.
        Usa abordagem iterativa com stack para evitar stack overflow.
        
        Args:
            owner: Proprietário do repositório
            repo: Nome do repositório
            branch: Branch a ser analisada (padrão: "main")
            use_cache: Se deve usar cache
            max_depth: Profundidade máxima (segurança contra loops)
        
        Returns:
            Dicionário com a árvore hierárquica de arquivos
        """
        logger = logging.getLogger(__name__)
        
        def build_tree_iterative(start_path: str = "") -> List[Dict[str, Any]]:
            """Constrói árvore usando stack ao invés de recursão."""
            root_tree = []
            stack = [(start_path, root_tree)]
            processed = set()
            
            while stack and len(processed) < max_depth:
                current_path, parent_list = stack.pop()
                
                if current_path in processed:
                    logger.warning(f"Skipping already processed path: {current_path}")
                    continue
                processed.add(current_path)
                
                expression = f"{branch}:{current_path}" if current_path else f"{branch}:"
                
                query = """
                query($owner: String!, $repo: String!, $expression: String!) {
                  repository(owner: $owner, name: $repo) {
                    object(expression: $expression) {
                      ... on Tree {
                        entries {
                          name
                          type
                          mode
                          path
                          extension
                          object {
                            ... on Blob {
                              byteSize
                              isBinary
                              oid
                            }
                          }
                        }
                      }
                    }
                  }
                }
                """
                
                variables = {
                    "owner": owner,
                    "repo": repo,
                    "expression": expression
                }
                
                try:
                    result = self.graphql(query, variables, use_cache=use_cache)
                    
                    if not result or 'data' not in result:
                        logger.warning(f"No data returned for path: {current_path}")
                        continue
                    
                    repo_obj = result.get('data', {}).get('repository', {})
                    if not repo_obj:
                        logger.warning(f"Repository not found for: {owner}/{repo}")
                        continue
                    
                    tree_obj = repo_obj.get('object', {})
                    if not tree_obj:
                        logger.debug(f"No tree object for path: {current_path}")
                        continue
                    
                    entries = tree_obj.get('entries', [])
                    
                    for entry in entries:
                        entry_type = entry.get('type')
                        entry_name = entry.get('name')
                        entry_path = entry.get('path')
                        
                        if entry_type == 'tree':
                            logger.debug(f"Processing directory: {entry_path}")
                            directory_node = {
                                'name': entry_name,
                                'path': entry_path,
                                'type': 'directory',
                                'children': []
                            }
                            parent_list.append(directory_node)
                            stack.append((entry_path, directory_node['children']))
                            
                        elif entry_type == 'blob':
                            blob_info = entry.get('object', {})
                            file_node = {
                                'name': entry_name,
                                'path': entry_path,
                                'type': 'file',
                                'extension': entry.get('extension', ''),
                                'size': blob_info.get('byteSize', 0),
                                'is_binary': blob_info.get('isBinary', False),
                                'oid': blob_info.get('oid', '')
                            }
                            parent_list.append(file_node)
                
                except Exception as e:
                    logger.error(f"Error processing path {current_path}: {str(e)}")
                    continue
            
            return root_tree
        
        logger.info(f"Building repository tree for {owner}/{repo} (branch: {branch})")
        
        try:
            tree = build_tree_iterative("")
            
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': tree,
                'extracted_at': datetime.now().isoformat(),
                'method': 'graphql'
            }
        except Exception as e:
            logger.error(f"Failed to build repository tree: {str(e)}")
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'tree': [],
                'error': str(e),
                'extracted_at': datetime.now().isoformat(),
                'method': 'graphql'
            }

    def get_repository_tree(
        self,
        owner: str,
        repo: str,
        branch: str = "main",
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Obtém árvore de arquivos usando REST API Git Trees como fallback.
        Se a árvore for truncada, automaticamente usa GraphQL.
        
        Args:
            owner: Proprietário do repositório
            repo: Nome do repositório
            branch: Branch a ser analisada
            use_cache: Se deve usar cache
        
        Returns:
            Dicionário com a árvore de arquivos
        """
        logger = logging.getLogger(__name__)
        
        try:
            # Passo 1: Obter SHA do branch
            branch_url = f"https://api.github.com/repos/{owner}/{repo}/branches/{branch}"
            branch_data = self.get_with_cache(branch_url, use_cache=use_cache)
            
            if not branch_data:
                logger.error(f"Branch {branch} not found for {owner}/{repo}")
                return self._empty_tree_response(owner, repo, branch, error="Branch not found")
            
            tree_sha = branch_data['commit']['sha']
            logger.info(f"Fetching tree for {owner}/{repo} (SHA: {tree_sha[:8]})")
            
            # Passo 2: Obter árvore recursiva
            tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{tree_sha}"
            tree_data = self.get_with_cache(
                f"{tree_url}?recursive=1",
                use_cache=use_cache
            )
            
            if not tree_data:
                logger.error(f"Failed to fetch tree for {owner}/{repo}")
                return self._empty_tree_response(owner, repo, branch, error="Tree fetch failed")
            
            is_truncated = tree_data.get('truncated', False)
            raw_tree = tree_data.get('tree', [])
            
            logger.info(f"  ├─ Items fetched: {len(raw_tree)}")
            logger.info(f"  ├─ Truncated: {is_truncated}")
            
            # Se truncado, tentar fallback com GraphQL
            if is_truncated:
                logger.warning(f"  ⚠️  Tree is truncated! Falling back to GraphQL...")
                return self.graphql_repository_tree(owner, repo, branch, use_cache)
            
            # Passo 3: Padronizar nós
            standardized_tree = []
            for item in raw_tree:
                node = self._standardize_tree_node(item)
                if node:
                    standardized_tree.append(node)
            
            return {
                'owner': owner,
                'repository': repo,
                'branch': branch,
                'sha': tree_sha,
                'tree': standardized_tree,
                'truncated': is_truncated,
                'extracted_at': datetime.now().isoformat(),
                'method': 'rest',
                'total_items': len(standardized_tree)
            }
            
        except Exception as e:
            logger.error(f"Error in get_repository_tree: {str(e)}")
            return self._empty_tree_response(owner, repo, branch, error=str(e))

    def _standardize_tree_node(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Padroniza formato de um nó da árvore (REST ou GraphQL).
        
        Args:
            item: Item bruto da API
        
        Returns:
            Nó padronizado ou None se inválido
        """
        node_type = item.get('type', '')
        path = item.get('path', '')
        
        if not path:
            return None
        
        name = path.split('/')[-1] if '/' in path else path
        
        if node_type == 'blob':
            file_type = 'file'
        elif node_type == 'tree':
            file_type = 'directory'
        else:
            file_type = node_type
        
        standardized = {
            'name': name,
            'path': path,
            'type': file_type,
            'sha': item.get('sha', item.get('oid', '')),
            'mode': item.get('mode', '')
        }
        
        if file_type == 'file':
            extension = ''
            if '.' in name:
                extension = '.' + name.rsplit('.', 1)[-1]
            
            standardized['extension'] = extension
            
            size = item.get('size')
            if size is None and 'object' in item:
                size = item['object'].get('byteSize', 0)
            
            standardized['size'] = size or 0
            standardized['is_binary'] = item.get('is_binary', False)
        
        elif file_type == 'directory':
            standardized['children'] = item.get('children', [])
        
        return standardized

    def _empty_tree_response(
        self,
        owner: str,
        repo: str,
        branch: str,
        error: str = ""
    ) -> Dict[str, Any]:
        """
        Retorna estrutura vazia em caso de erro.
        
        Args:
            owner: Proprietário do repositório
            repo: Nome do repositório
            branch: Branch
            error: Mensagem de erro
        
        Returns:
            Estrutura vazia padronizada
        """
        return {
            'owner': owner,
            'repository': repo,
            'branch': branch,
            'sha': '',
            'tree': [],
            'truncated': False,
            'extracted_at': datetime.now().isoformat(),
            'method': 'rest',
            'total_items': 0,
            'error': error
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
        """
        Loga informações sobre rate limit da API.
        
        Args:
            response: Resposta HTTP da API
        """
        remaining = response.headers.get('X-RateLimit-Remaining', 'Unknown')
        limit = response.headers.get('X-RateLimit-Limit', 'Unknown')
        reset_time = response.headers.get('X-RateLimit-Reset', 'Unknown')
        
        if reset_time != 'Unknown':
            reset_datetime = datetime.fromtimestamp(int(reset_time))
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
        
        Args:
            repo: Dados do repositório
        
        Returns:
            True se deve pular, False caso contrário
        """
        return False
