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
                response = requests.get(url, headers=self.headers, timeout=10)

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
    def graphql(self, query: str, variables: Optional[Dict[str, Any]] = None, use_cache: bool = True, retries: int = 0, backoff_base: float = 2.0) -> Any:
        """Execute a GraphQL query against GitHub's v4 API with enhanced error handling and resilience."""
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
                # Adaptive throttling: increase delay after failures
                delay = 1.0 if attempt == 0 else backoff_base * (2 ** (attempt - 1))
                time.sleep(delay)

                response = requests.post(self.graphql_url, headers=headers, json=payload, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if "errors" in data:
                        # Check if errors are SERVICE_UNAVAILABLE (commit stats unavailable)
                        errors = data.get('errors', [])
                        has_stats_unavailable = any(
                            err.get('type') == 'SERVICE_UNAVAILABLE' and 
                            ('additions' in str(err.get('path', [])) or 'deletions' in str(err.get('path', [])))
                            for err in errors
                        )
                        
                        if has_stats_unavailable:
                            # Stats unavailable - treat as failure to trigger REST fallback
                            print(f"[WARN] Commit stats unavailable in GraphQL (SERVICE_UNAVAILABLE)")
                            print(f"[INFO] Will use REST API for reliable stats extraction")
                            return None  # Trigger REST fallback
                        else:
                            # Other critical errors
                            print(f"[ERROR] GraphQL returned errors: {data['errors']}")
                            return None
                    if use_cache and cache_key:
                        self._cache_set(cache_key, data)
                    self._log_rate_limit(response)
                    return data
                elif response.status_code == 403:
                    # Check if it's rate limit or permission issue
                    if "rate limit" in response.text.lower():
                        print(f"[WARN] GraphQL rate limit exceeded.")
                        return None  # Let circuit breaker or caller handle
                    else:
                        print(f"[ERROR] GraphQL forbidden (403): {response.text}")
                        return None
                elif response.status_code == 502:
                    # Bad Gateway - GitHub server overload, let circuit breaker handle retry
                    print(f"[WARN] GraphQL 502 (server overload) - will retry via circuit breaker")
                    return None  # Let circuit breaker handle retry
                elif 500 <= response.status_code < 600:
                    # Server error - let circuit breaker handle retry
                    print(f"[WARN] GraphQL {response.status_code} - will retry via circuit breaker")
                    return None  # Let circuit breaker handle retry
                else:
                    print(f"[ERROR] GraphQL request failed: {response.status_code} - {response.text}")
                    return None
            except requests.exceptions.Timeout:
                print(f"[ERROR] GraphQL timeout (10s) - will retry via circuit breaker")
                return None  # Let circuit breaker handle retry
            except requests.exceptions.RequestException as e:
                print(f"[ERROR] GraphQL request error: {str(e)}")
                return None
        print(f"[ERROR] Exhausted GraphQL retries after {retries} attempts")
        return None

    def _split_time_range(
        self,
        since: Optional[str],
        until: Optional[str],
        chunks: int = 3,
    ) -> List[Tuple[Optional[str], Optional[str]]]:
        """
        Split a time range into smaller chunks for efficient extraction.
        
        Args:
            since: Start date (ISO format) or None
            until: End date (ISO format) or None
            chunks: Number of chunks to split into (default: 3)
        
        Returns:
            List of (since, until) tuples representing time ranges
        """
        from datetime import datetime, timedelta, timezone
        
        # If no date range specified, return single range
        if not since and not until:
            return [(None, None)]
        
        # Parse dates
        try:
            if since:
                start_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
            else:
                # Default to 1 year ago if not specified
                start_dt = datetime.now(timezone.utc) - timedelta(days=365)
            
            if until:
                end_dt = datetime.fromisoformat(until.replace('Z', '+00:00'))
            else:
                end_dt = datetime.now(timezone.utc)
        except (ValueError, AttributeError):
            # If parsing fails, return single range
            return [(since, until)]
        
        # Calculate chunk duration
        total_duration = end_dt - start_dt
        chunk_duration = total_duration / chunks
        
        # Generate time ranges
        ranges = []
        for i in range(chunks):
            chunk_start = start_dt + (chunk_duration * i)
            chunk_end = start_dt + (chunk_duration * (i + 1))
            
            # Format as ISO strings
            ranges.append((
                chunk_start.isoformat().replace('+00:00', 'Z'),
                chunk_end.isoformat().replace('+00:00', 'Z')
            ))
        
        return ranges

    def get_active_unmerged_branches(
        self,
        owner: str,
        repo: str,
        days: int = 30,
        use_cache: bool = True,
    ) -> List[str]:
        """
        Get branches that were updated recently and have unmerged commits.
        Uses a single efficient query combining branch listing and comparison.
        
        Args:
            days: Consider branches updated in last N days
        
        Returns:
            List of branch names with unmerged commits
        """
        from datetime import datetime, timedelta, timezone
        
        # Get default branch first
        repo_info = self.get_with_cache(
            f"https://api.github.com/repos/{owner}/{repo}",
            use_cache=use_cache
        )
        default_branch = repo_info.get("default_branch", "main") if repo_info else "main"
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        cutoff_iso = cutoff_date.isoformat()
        
        # Single GraphQL query to get branches with commit info
        query = """
        query($owner: String!, $name: String!, $cursor: String) {
          repository(owner: $owner, name: $name) {
            refs(refPrefix: "refs/heads/", first: 100, after: $cursor, orderBy: {field: TAG_COMMIT_DATE, direction: DESC}) {
              pageInfo { hasNextPage endCursor }
              nodes {
                name
                target {
                  ... on Commit {
                    oid
                    committedDate
                  }
                }
              }
            }
          }
          rateLimit { remaining resetAt limit cost }
        }
        """
        
        active_branches = []
        cursor = None
        
        while True:
            variables = {"owner": owner, "name": repo, "cursor": cursor}
            data = self.graphql(query, variables, use_cache=use_cache)
            if not data:
                break
                
            repo_data = data.get("data", {}).get("repository")
            if not repo_data:
                break
                
            refs = repo_data.get("refs", {})
            nodes = refs.get("nodes", [])
            
            # Filter by date and exclude default branch
            for node in nodes:
                branch_name = node.get("name")
                if branch_name == default_branch:
                    continue
                
                # Skip gh-pages and similar branches
                if branch_name and branch_name.startswith("gh-pages"):
                    continue
                    
                target = node.get("target", {})
                commit_date = target.get("committedDate")
                
                if commit_date:
                    commit_dt = datetime.fromisoformat(commit_date.replace('Z', '+00:00'))
                    if commit_dt >= cutoff_date:
                        active_branches.append(branch_name)
            
            page_info = refs.get("pageInfo", {})
            if not page_info.get("hasNextPage"):
                break
            cursor = page_info.get("endCursor")
        
        if not active_branches:
            return []
        
        # Batch check which branches have unmerged commits (max 10 at a time to avoid rate limits)
        print(f"  Found {len(active_branches)} active branches (gh-pages excluded), checking merge status...")
        unmerged_branches = []
        batch_size = 10
        
        for i in range(0, len(active_branches), batch_size):
            batch = active_branches[i:i+batch_size]
            for branch in batch:
                # Use REST API compare endpoint (more efficient than GraphQL for this)
                compare_url = f"https://api.github.com/repos/{owner}/{repo}/compare/{default_branch}...{branch}"
                compare_data = self.get_with_cache(compare_url, use_cache=use_cache)
                
                if compare_data and isinstance(compare_data, dict):
                    ahead_by = compare_data.get("ahead_by", 0)
                    if ahead_by > 0:
                        unmerged_branches.append(branch)
                        print(f"    ✓ {branch}: {ahead_by} commits ahead")
            
            # Small delay between batches to respect rate limits
            if i + batch_size < len(active_branches):
                time.sleep(1)
        
        return unmerged_branches

    def graphql_commit_history(
        self,
        owner: str,
        repo: str,
        page_size: int,  
        max_pages: Optional[int] = None,
        max_commits: Optional[int] = None,
        since: Optional[str] = None,
        until: Optional[str] = None,
        use_cache: bool = True,
        branches: Optional[List[str]] = None,
        split_large_extractions: bool = True,
        time_chunks: int = 3,
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Fetch commit history with automatic REST fallback on GraphQL failures.
        
        Features:
        - Switches to REST after 16s timeout (2 failed attempts)
        - REST fallback extracts 50 commits, then retries GraphQL
        - Circuit breaker for repeated failures
        
        Args:
            branches: List of branch names to extract from. If None, uses default branch.
            split_large_extractions: If True, splits extraction into time chunks
            time_chunks: Number of time periods to split extraction into (default: 3)
        
        Returns:
            Tuple of (commits list, rate limit metadata)
        """
        commits_by_sha: Dict[str, Dict[str, Any]] = {}  # Deduplicate by SHA
        rate_meta: Dict[str, Any] = {}
        consecutive_502_errors = 0  # Track consecutive 502 errors
        max_502_before_rest_fallback = 2  # Fallback to REST after 16s (2×8s waits)
        rest_commits_before_retry = 50  # Try GraphQL again after 50 REST commits
        using_rest_fallback = False
        rest_commit_count = 0
        
        # Always include default branch, optionally add others
        branches_to_process = [None]  # None = default branch
        if branches:
            branches_to_process.extend(branches)
            print(f"  Processing {len(branches_to_process)} branches (main + {len(branches)} active)")
        
        # Determine if we should split by time
        time_ranges = [(since, until)]  # Default: single time range
        
        if split_large_extractions and (since or until):
            time_ranges = self._split_time_range(since, until, chunks=time_chunks)
            print(f"  Splitting extraction into {len(time_ranges)} time periods to avoid API overload")
        
        for branch in branches_to_process:
            branch_name = branch if branch else "default branch"
            print(f"    Extracting from: {branch_name}")
            
            # Process each time range for this branch
            for time_idx, (range_since, range_until) in enumerate(time_ranges):
                if len(time_ranges) > 1:
                    print(f"      Time period {time_idx + 1}/{len(time_ranges)}: {range_since} to {range_until}")
                
                if branch:
                    query = """
                    query($owner: String!, $name: String!, $branch: String!, $pageSize: Int!, $cursor: String, $since: GitTimestamp, $until: GitTimestamp) {
                      repository(owner: $owner, name: $name) {
                        ref(qualifiedName: $branch) {
                          target {
                            ... on Commit {
                              history(first: $pageSize, after: $cursor, since: $since, until: $until) {
                                pageInfo { hasNextPage endCursor }
                                nodes {
                                  oid
                                  messageHeadline
                                  committedDate
                                  author { user { login } }
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
                else:
                    query = """
                    query($owner: String!, $name: String!, $pageSize: Int!, $cursor: String, $since: GitTimestamp, $until: GitTimestamp) {
                      repository(owner: $owner, name: $name) {
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
                                  author { user { login } }
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
                
                cursor: Optional[str] = None
                pages = 0
                period_commits = 0
                rest_page = 1
                last_rest_commit_sha = None  # Track último commit processado via REST
                
                while True:
                    if max_pages is not None and pages >= max_pages:
                        break
                    if max_commits is not None and len(commits_by_sha) >= max_commits:
                        break

                    # 🔥 CIRCUIT BREAKER: Switch to REST API after timeout threshold
                    if consecutive_502_errors >= max_502_before_rest_fallback and not using_rest_fallback:
                        print(f"        [CIRCUIT BREAKER] GraphQL unstable after {consecutive_502_errors} failures (>16s timeout).")
                        print(f"        Switching to REST API fallback...")
                        using_rest_fallback = True
                        rest_commit_count = 0
                        consecutive_502_errors = 0  # Reset counter
                    
                    # 🔄 REST FALLBACK MODE
                    if using_rest_fallback:
                        # Build REST API URL
                        rest_url = f"https://api.github.com/repos/{owner}/{repo}/commits"
                        params = []
                        if branch:
                            params.append(f"sha={branch}")
                        if range_since:
                            params.append(f"since={range_since}")
                        if range_until:
                            params.append(f"until={range_until}")
                        params.append(f"per_page=100")
                        params.append(f"page={rest_page}")
                        
                        rest_url = f"{rest_url}?{'&'.join(params)}"
                        
                        print(f"        [REST] Fetching page {rest_page} via REST API...")
                        rest_data = self.get_with_cache(rest_url, use_cache=use_cache)
                        
                        if not rest_data or not isinstance(rest_data, list):
                            print(f"        [REST] No more commits available")
                            break
                        
                        # Convert REST commits to GraphQL-like format
                        for rest_commit in rest_data:
                            sha = rest_commit.get('sha')
                            if sha and sha not in commits_by_sha:
                                # Get detailed stats for this commit
                                commit_detail_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
                                commit_details = self.get_with_cache(commit_detail_url, use_cache=use_cache)
                                
                                stats = commit_details.get('stats', {}) if commit_details else {}
                                additions = stats.get('additions', 0)
                                deletions = stats.get('deletions', 0)
                                
                                # Extract author login
                                author_login = None
                                if rest_commit.get('author') and rest_commit['author'].get('login'):
                                    author_login = rest_commit['author']['login']
                                elif rest_commit.get('commit', {}).get('author', {}).get('name'):
                                    author_login = rest_commit['commit']['author']['name']
                                
                                commits_by_sha[sha] = {
                                    'oid': sha,
                                    'messageHeadline': rest_commit.get('commit', {}).get('message', '').split('\n')[0],
                                    'committedDate': rest_commit.get('commit', {}).get('author', {}).get('date'),
                                    'author': {
                                        'user': {
                                            'login': author_login
                                        }
                                    },
                                    'additions': additions,
                                    'deletions': deletions,
                                }
                                rest_commit_count += 1
                                period_commits += 1
                                last_rest_commit_sha = sha  # Salvar último SHA processado
                        
                        rest_page += 1
                        
                        # Check if we should retry GraphQL
                        if rest_commit_count >= rest_commits_before_retry:
                            if last_rest_commit_sha:
                                print(f"        [REST→GraphQL] Extracted {rest_commit_count} commits via REST (last: {last_rest_commit_sha[:8]}...)")
                                print(f"        GraphQL will continue from cursor position (deduplication prevents reprocessing)")
                            else:
                                print(f"        [REST→GraphQL] Extracted {rest_commit_count} commits via REST. Retrying GraphQL...")
                            using_rest_fallback = False
                            rest_commit_count = 0
                            consecutive_502_errors = 0
                            # cursor mantém sua posição - GraphQL continuará de onde parou
                            time.sleep(1)  # Cooldown before switching back
                            continue
                        
                        # If REST returned less than 100 commits, we're done
                        if len(rest_data) < 100:
                            print(f"        [REST] Reached end of commits")
                            break
                        
                        time.sleep(1)  # Rate limit protection for REST
                        continue
                    
                    # 🔵 GRAPHQL MODE (default)
                    variables = {
                        "owner": owner,
                        "name": repo,
                        "pageSize": page_size,
                        "cursor": cursor,
                        "since": range_since,
                        "until": range_until,
                    }
                    if branch:
                        variables["branch"] = f"refs/heads/{branch}"
                        
                    data = self.graphql(query, variables, use_cache=use_cache)
                    if not data:
                        consecutive_502_errors += 1
                        # Don't retry here - let circuit breaker at top of loop handle it
                        continue  # Circuit breaker will activate REST fallback if threshold reached

                    repo_data = data.get("data", {}).get("repository")
                    rate_meta = data.get("data", {}).get("rateLimit", {}) or {}
                    
                    # Success! Reset 502 counter
                    consecutive_502_errors = 0
                    
                    # Check rate limit and pause if needed
                    if rate_meta:
                        remaining = rate_meta.get("remaining", 0)
                        if remaining < 100:
                            print(f"        [WARN] Rate limit low ({remaining}). Pausing 30s...")
                            time.sleep(30)
                    
                    if not repo_data:
                        break
                    
                    # Extract history based on query type
                    if branch:
                        ref_data = repo_data.get("ref")
                        if not ref_data:
                            print(f"        Branch '{branch}' not found")
                            break
                        target = ref_data.get("target", {})
                    else:
                        default_ref = repo_data.get("defaultBranchRef")
                        if not default_ref:
                            break
                        target = default_ref.get("target", {})
                    
                    history = target.get("history") if isinstance(target, dict) else None
                    if not history:
                        break

                    nodes = history.get("nodes", [])
                    
                    # Add commits to dict (auto-deduplicates by SHA)
                    for node in nodes:
                        sha = node.get('oid')
                        if sha and sha not in commits_by_sha:
                            # Set additions/deletions to 0 if unavailable (SERVICE_UNAVAILABLE errors)
                            if node.get('additions') is None:
                                node['additions'] = 0
                            if node.get('deletions') is None:
                                node['deletions'] = 0
                            
                            commits_by_sha[sha] = node
                            period_commits += 1

                    page_info = history.get("pageInfo", {})
                    has_next = page_info.get("hasNextPage")
                    cursor = page_info.get("endCursor")
                    pages += 1
                    
                    # Adaptive delay between pages: longer for large repos
                    if has_next:
                        delay = 1 + (consecutive_502_errors * 0.2)  # 1s base, +0.2s per recent error
                        time.sleep(delay)
                    
                    if not has_next:
                        break
                
                if len(time_ranges) > 1 and period_commits > 0:
                    print(f"        Extracted {period_commits} unique commits from this period")
        
        commits = list(commits_by_sha.values())
        if branches:
            print(f"  Total unique commits across all branches: {len(commits)}")
        return commits, rate_meta

    def get_paginated(
        self,
        base_url: str,
        use_cache: bool = True,
        per_page: int = 200,
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