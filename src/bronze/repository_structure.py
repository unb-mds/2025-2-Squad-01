#!/usr/bin/env python3

import os
from typing import List, Dict, Any
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

def extract_repository_structure(
    client: GitHubAPIClient, 
    config: OrganizationConfig, 
    use_cache: bool = True
) -> List[str]:
    
    # Load filtered repos
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        print("No repositories found. Run repository extraction first.")
        return []
    
    generated_files = []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0 and isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
        filtered_repos = filtered_repos[1:]
    
    # Processar cada repositório
    for repo in filtered_repos:
        if not repo or not isinstance(repo, dict):
            print(f"Skipping invalid repo entry: {repo}")
            continue
            
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        owner = full_name.split('/')[0] if '/' in full_name else None
        name_only = full_name.split('/')[1] if '/' in full_name else full_name
        default_branch = repo.get('default_branch', 'main')
        
        if not owner:
            print(f"Skipping {full_name}: cannot determine owner")
            continue
        
        print(f"Processing repository structure for: {repo_name}")
        
        # Extract structure using GraphQL
        structure = client.graphql_repository_tree(
            owner=owner,
            repo=name_only,
            branch=default_branch,
            use_cache=use_cache
        )
        
        if structure:
            # Save structure of repo
            structure_file = save_json_data(
                structure,
                f"data/bronze/structure_{repo_name}.json"
            )
            generated_files.append(structure_file)
            print(f"  ✓ Extracted structure for {repo_name}")
        else:
            print(f"  ✗ Failed to extract structure for {repo_name}")
    
    print(f"\nStructure extraction completed! Generated {len(generated_files)} files")
    return generated_files