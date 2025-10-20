#!/usr/bin/env python3

import os
import json
import time
import hashlib
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any

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
    
    def _get_cache_key(self, url: str) -> str:

        return hashlib.md5(url.encode()).hexdigest() + ".json"
    
    def _cache_get(self, url: str) -> Optional[Any]:
        """Get response from cache if exists"""
        cache_file = os.path.join(self.cache_dir, self._get_cache_key(url))
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def _cache_set(self, url: str, data: Any) -> None:

        cache_file = os.path.join(self.cache_dir, self._get_cache_key(url))
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def get_with_cache(self, url: str, use_cache: bool = True) -> Any:

        if use_cache:
            cached = self._cache_get(url)
            if cached is not None:
                print(f"✓ Using cached data for: {url}")
                return cached
        
        print(f"→ Fetching from API: {url}")
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
            else:
                print(f"[ERROR] API request failed: {response.status_code} - {response.text}")
                return None
        except requests.exceptions.Timeout:
            print(f"[ERROR] Request timeout for: {url}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Request error for {url}: {str(e)}")
            return None

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