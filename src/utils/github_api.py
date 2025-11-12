#!/usr/bin/env python3

import os
import json
import time
import hashlib
import requests
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
                        # After sleep, continue loop to retry
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
    def graphql(self, query: str, variables: Optional[Dict[str, Any]] = None, use_cache: bool = True, retries: int = 3, backoff_base: float = 1.0) -> Any:
        """Execute a GraphQL query against GitHub's v4 API with optional caching."""
        payload = {"query": query, "variables": variables or {}}

        # Build a deterministic cache key based on query + variables
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
                # Fallback to no-cache if serialization fails
                cache_key = None

        headers = dict(self.headers)
        headers["Content-Type"] = "application/json"

        attempt = 0
        while attempt < retries:
            try:
                # Throttle GraphQL calls to avoid secondary rate limits and API bursts
                time.sleep(0.5)

                response = requests.post(self.graphql_url, headers=headers, json=payload, timeout=60)
                if response.status_code == 200:
                    data = response.json()
                    if "errors" in data:
                        print(f"[ERROR] GraphQL returned errors: {data['errors']}")
                        # GraphQL 'errors' are not retriable in general; stop
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
                # No default branch or repo not found
                break

            target = repo_data["defaultBranchRef"].get("target", {})
            history = target.get("history") if isinstance(target, dict) else None
            if not history:
                break

            nodes = history.get("nodes", [])
            # Enforce optional max_commits limit across pages
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

    def graphql_repository_tree(
        self,
        owner: str,
        repo: str,
        branch: str = "main",
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Extrai a árvore completa de arquivos e diretórios usando GraphQL.
        Retorna uma estrutura hierárquica onde diretórios são objetos pai
        e arquivos são objetos filho.
        """
        
        def build_tree_recursive(path: str = "") -> List[Dict[str, Any]]:
            """Função recursiva para construir a árvore de arquivos."""
            expression = f"{branch}:{path}" if path else f"{branch}:"
            
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
            
            result = self.graphql(query, variables, use_cache=use_cache)
            
            if not result or 'data' not in result:
                return []
            
            repo_obj = result.get('data', {}).get('repository', {})
            if not repo_obj:
                return []
            
            tree_obj = repo_obj.get('object', {})
            if not tree_obj:
                return []
            
            entries = tree_obj.get('entries', [])
            
            tree_structure = []
            
            for entry in entries:
                entry_type = entry.get('type')
                entry_name = entry.get('name')
                entry_path = entry.get('path')
                
                if entry_type == 'tree':
                    # É um diretório - objeto pai
                    print(f"  Processing directory: {entry_path}")
                    directory_node = {
                        'name': entry_name,
                        'path': entry_path,
                        'type': 'directory',
                        'children': build_tree_recursive(entry_path)
                    }
                    tree_structure.append(directory_node)
                    
                elif entry_type == 'blob':
                    # É um arquivo - objeto filho
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
                    tree_structure.append(file_node)
            
            return tree_structure
        
        print(f"Building repository tree for {owner}/{repo} (branch: {branch})")
        tree = build_tree_recursive("")
        
        return {
            'owner': owner,
            'repository': repo,
            'branch': branch,
            'tree': tree,
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
        Stops when a page returns fewer than per_page results or when max_pages is reached.
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
                # Non-list response; stop paging
                break
            page += 1
        return results
    
    def _log_rate_limit(self, response: requests.Response) -> None:

        remaining = response.headers.get('X-RateLimit-Remaining', 'Unknown')
        limit = response.headers.get('X-RateLimit-Limit', 'Unknown')
        reset_time = response.headers.get('X-RateLimit-Reset', 'Unknown')
        
        if reset_time != 'Unknown':
            reset_datetime = datetime.fromtimestamp(int(reset_time))
            print(f"Rate limit: {remaining}/{limit}, resets at {reset_datetime}")
        else:
            print(f"Rate limit: {remaining}/{limit}")

def save_json_data(data: Any, filepath: str, timestamp: bool = True) -> str:
 
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
   
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def update_data_registry(layer: str, entity: str, files: List[str]) -> None:
    
    registry_path = f"data/{layer}/registry.json"
    
    registry = load_json_data(registry_path) or {}
    
    if entity not in registry:
        registry[entity] = {}
    
    registry[entity]['files'] = files
    registry[entity]['updated_at'] = datetime.now().isoformat()
    registry[entity]['layer'] = layer
    
    save_json_data(registry, registry_path, timestamp=False)

class OrganizationConfig:
    
    def __init__(self, org_name: str):
        self.org_name = org_name
        # Allow full extraction by default (no blacklist)
        self.repo_blacklist: List[str] = []
    
    def should_skip_repo(self, repo: Dict[str, Any]) -> bool:
        
        # Do not skip any repository to enable full extraction
        return False
    
def graphql_repository_tree(
    self,
    owner: str,
    repo: str,
    branch: str = "main",
    use_cache: bool = True
) -> Dict[str, Any]:
    """
    Extrai a árvore completa de arquivos e diretórios usando GraphQL.
    Retorna uma estrutura hierárquica onde diretórios são objetos pai
    e arquivos são objetos filho.
    """
    
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
                ... on Tree {
                  entries {
                    name
                    type
                    mode
                    path
                    extension
                  }
                }
                ... on Blob {
                  byteSize
                  text
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
        "expression": f"{branch}:"
    }
    
    # Função recursiva para construir a árvore
    def build_tree_recursive(owner: str, repo: str, path: str = "", use_cache: bool = True) -> List[Dict[str, Any]]:
        expression = f"{branch}:{path}" if path else f"{branch}:"
        
        query_recursive = """
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
        
        vars_recursive = {
            "owner": owner,
            "repo": repo,
            "expression": expression
        }
        
        result = self.graphql_query(query_recursive, vars_recursive, use_cache=use_cache)
        
        if not result or 'data' not in result:
            return []
        
        entries = result.get('data', {}).get('repository', {}).get('object', {}).get('entries', [])
        
        tree_structure = []
        
        for entry in entries:
            entry_type = entry.get('type')
            entry_name = entry.get('name')
            entry_path = entry.get('path')
            
            if entry_type == 'tree':
                # É um diretório - objeto pai
                directory_node = {
                    'name': entry_name,
                    'path': entry_path,
                    'type': 'directory',
                    'children': build_tree_recursive(owner, repo, entry_path, use_cache)
                }
                tree_structure.append(directory_node)
                
            elif entry_type == 'blob':
                # É um arquivo - objeto filho
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
                tree_structure.append(file_node)
        
        return tree_structure
    
    # Construir a árvore completa
    tree = build_tree_recursive(owner, repo, "", use_cache)
    
    return {
        'owner': owner,
        'repository': repo,
        'branch': branch,
        'tree': tree,
        'extracted_at': datetime.now().isoformat()
    }