#!/usr/bin/env python3
"""
Bronze layer: Commits extraction using GraphQL
Extracts detailed commit information including code additions/deletions
"""

import os
from typing import List, Dict, Any, Optional
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data
from utils.github_graphql import GitHubGraphQLClient


def extract_commits_graphql(
    graphql_client: GitHubGraphQLClient,
    config: OrganizationConfig,
    max_commits_per_repo: Optional[int] = None
) -> List[str]:
    """
    Extract commits using GraphQL API to get detailed information
    including additions, deletions, and changed files
    
    Args:
        graphql_client: GitHub GraphQL client instance
        config: Organization configuration
        max_commits_per_repo: Maximum commits to fetch per repository (None = all)
        
    Returns:
        List of generated file paths
    """
    
    # Load filtered repositories
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        print("[ERROR] No repositories found. Run repository extraction first.")
        return []
    
    generated_files = []
    all_commits_detailed = []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0:
        if isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
            filtered_repos = filtered_repos[1:]
    
    # Extract commits from each repository
    for repo in filtered_repos:
        if not repo or not isinstance(repo, dict):
            print(f"[WARNING] Skipping invalid repo entry: {repo}")
            continue
            
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        default_branch = repo.get('default_branch', 'main')
        
        # Parse owner and repo name
        parts = full_name.split('/')
        if len(parts) != 2:
            print(f"[WARNING] Invalid full_name format: {full_name}")
            continue
        
        owner, repo_name_clean = parts
        
        print(f"\n[INFO] Processing commits for: {repo_name} (branch: {default_branch})")
        
        try:
            # Get commits using GraphQL
            commits = graphql_client.get_all_repository_commits(
                owner=owner,
                repo_name=repo_name_clean,
                branch=default_branch,
                max_total_commits=max_commits_per_repo
            )
            
            if commits:
                # Transform and enrich commit data
                processed_commits = []
                for commit in commits:
                    processed_commit = transform_graphql_commit(commit, repo_name, full_name)
                    processed_commits.append(processed_commit)
                
                all_commits_detailed.extend(processed_commits)
                
                # Save per-repo commits
                repo_commits_file = save_json_data(
                    processed_commits,
                    f"data/bronze/commits_graphql_{repo_name}.json"
                )
                generated_files.append(repo_commits_file)
                
                print(f"[SUCCESS] Extracted {len(commits)} commits from {repo_name}")
                print(f"  - Total additions: {sum(c.get('additions', 0) for c in processed_commits)}")
                print(f"  - Total deletions: {sum(c.get('deletions', 0) for c in processed_commits)}")
            else:
                print(f"[WARNING] No commits found in {repo_name}")
                
        except Exception as e:
            print(f"[ERROR] Failed to extract commits from {repo_name}: {str(e)}")
            continue
    
    # Save all commits
    if all_commits_detailed:
        all_commits_file = save_json_data(
            all_commits_detailed,
            "data/bronze/commits_graphql_all.json"
        )
        generated_files.append(all_commits_file)
        
        # Print summary statistics
        total_additions = sum(c.get('additions', 0) for c in all_commits_detailed)
        total_deletions = sum(c.get('deletions', 0) for c in all_commits_detailed)
        total_files_changed = sum(c.get('changed_files', 0) for c in all_commits_detailed)
        
        print(f"\n[SUCCESS] Total commits extracted: {len(all_commits_detailed)}")
        print(f"  - Total lines added: {total_additions}")
        print(f"  - Total lines deleted: {total_deletions}")
        print(f"  - Total files changed: {total_files_changed}")
    else:
        print("[WARNING] No commits were extracted")
    
    return generated_files


def transform_graphql_commit(commit: Dict[str, Any], repo_name: str, full_name: str) -> Dict[str, Any]:
    """
    Transform GraphQL commit response to a standardized format
    
    Args:
        commit: Raw commit data from GraphQL
        repo_name: Repository name
        full_name: Full repository name (owner/repo)
        
    Returns:
        Transformed commit dictionary
    """
    
    # Extract author information
    author_data = commit.get('author', {})
    author_user = author_data.get('user')
    
    # Extract committer information
    committer_data = commit.get('committer', {})
    committer_user = committer_data.get('user')
    
    # Get parent count (merge commits have multiple parents)
    parents_info = commit.get('parents', {})
    parent_count = parents_info.get('totalCount', 0)
    
    return {
        'sha': commit.get('oid'),
        'message': commit.get('message', ''),
        'committed_date': commit.get('committedDate'),
        'author': {
            'name': author_data.get('name'),
            'email': author_data.get('email'),
            'login': author_user.get('login') if author_user else None
        },
        'committer': {
            'name': committer_data.get('name'),
            'email': committer_data.get('email'),
            'login': committer_user.get('login') if committer_user else None
        },
        'additions': commit.get('additions', 0),
        'deletions': commit.get('deletions', 0),
        'changed_files': commit.get('changedFiles', 0),
        'total_changes': commit.get('additions', 0) + commit.get('deletions', 0),
        'is_merge': parent_count > 1,
        'parent_count': parent_count,
        'tree_sha': commit.get('tree', {}).get('oid'),
        'repo_name': repo_name,
        'full_name': full_name
    }


def extract_commits(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    use_cache: bool = True
) -> List[str]:
    """
    Original REST API based commit extraction (kept for compatibility)
    
    Args:
        client: GitHub REST API client
        config: Organization configuration
        use_cache: Whether to use cached data
        
    Returns:
        List of generated file paths
    """
    
    # Load filtered repositories
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        print("No repositories found. Run repository extraction first.")
        return []
    
    generated_files = []
    all_commits = []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0:
        if isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
            filtered_repos = filtered_repos[1:]
    
    # Extract commits from each repository
    for repo in filtered_repos:
        if not repo or not isinstance(repo, dict):
            print(f"Skipping invalid repo entry: {repo}")
            continue
            
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        
        print(f"Processing commits for: {repo_name}")
        
        # Get commits (paginated)
        commits_base = f"https://api.github.com/repos/{full_name}/commits"
        commits = client.get_paginated(commits_base, use_cache=use_cache, per_page=100)
        
        if commits:
            # Add repo context to each commit
            repo_commits = [{**commit, 'repo_name': repo_name} for commit in commits]
            all_commits.extend(repo_commits)
            
            # Save per-repo commits
            repo_commits_file = save_json_data(
                repo_commits,
                f"data/bronze/commits_{repo_name}.json"
            )
            generated_files.append(repo_commits_file)
            
            print(f"Found {len(commits)} commits in {repo_name}")
    
    # Save all commits
    if all_commits:
        all_commits_file = save_json_data(
            all_commits,
            "data/bronze/commits_all.json"
        )
        generated_files.append(all_commits_file)

        print(f"Total commits extracted: {len(all_commits)}")

    return generated_files
