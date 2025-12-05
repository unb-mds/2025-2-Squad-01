import os
import sys
from typing import List
from pathlib import Path

# Adicionar raiz ao path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data

def extract_repositories(client: GitHubAPIClient, config: OrganizationConfig, use_cache: bool = True) -> List[str]:  
    
    repos_url = f"https://api.github.com/orgs/{config.org_name}/repos"
    raw_repos = client.get_paginated(repos_url, use_cache=use_cache, per_page=300)
    
    if not raw_repos:
        print("ERROR: Failed to fetch repositories")
        return []
    
   
    filtered_repos = []
    for repo in raw_repos:
        if not config.should_skip_repo(repo):
            filtered_repos.append(repo)
        else:
            print(f"Skipping repository: {repo.get('name', 'unknown')} (blacklisted/fork)")

    print(f"Found {len(filtered_repos)} repositories (filtered from {len(raw_repos)})")

    generated_files = []

    repos_file = save_json_data(
        raw_repos, 
        "data/bronze/repositories_raw.json"
    )
    generated_files.append(repos_file)

    # Filter repositories and save
    filtered_file = save_json_data(
        filtered_repos,
        "data/bronze/repositories_filtered.json"
    )
    generated_files.append(filtered_file)
    
    # Save individual repositories
    repo_details = []
    for repo in filtered_repos:
        repo_detail_url = f"https://api.github.com/repos/{repo['full_name']}"
        detail = client.get_with_cache(repo_detail_url, use_cache)
        if detail:
            repo_details.append(detail)
            
            # Save individual repo detail
            repo_file = save_json_data(
                detail,
                f"data/bronze/repo_{repo['name']}.json"
            )
            generated_files.append(repo_file)
    
    if repo_details:
        details_file = save_json_data(
            repo_details,
            "data/bronze/repositories_detailed.json"
        )
        generated_files.append(details_file)
    
    return generated_files