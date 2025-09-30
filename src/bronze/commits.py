
import os
from typing import List
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

def extract_commits(client: GitHubAPIClient, config: OrganizationConfig, use_cache: bool = True) -> List[str]:
    
    # Load filtered repositories
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        print("No repositories found. Run repository extraction first.")
        return []
    
    generated_files = []
    all_commits = []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0 and isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
        filtered_repos = filtered_repos[1:]
    
    # Extract commits from each repository
    for repo in filtered_repos[:5]:  # LIMITE DE 5 REPOS
        if not repo or not isinstance(repo, dict):
            print(f"Skipping invalid repo entry: {repo}")
            continue
            
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        
        print(f"Processing commits for: {repo_name}")
        
        # Get commits
        commits_url = f"https://api.github.com/repos/{full_name}/commits?per_page=100"
        commits = client.get_with_cache(commits_url, use_cache)
        
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