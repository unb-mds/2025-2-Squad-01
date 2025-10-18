
import os
from typing import List
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

def extract_issues(client: GitHubAPIClient, config: OrganizationConfig, use_cache: bool = True) -> List[str]:

    # Load filtered repositories
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        print("No repositories found. Run repository extraction first.")
        return []
    
    generated_files = []
    all_issues = []
    all_prs = []
    all_issue_events = []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0 and isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
        filtered_repos = filtered_repos[1:]
    
    # Extract issues from each repository
    for repo in filtered_repos:
        if not repo or not isinstance(repo, dict):
            print(f"Skipping invalid repo entry: {repo}")
            continue
            
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        
    print(f"Processing issues for: {repo_name}")
        
    # Get issues (includes PRs)
    issues_base = f"https://api.github.com/repos/{full_name}/issues?state=all"
    issues = client.get_paginated(issues_base, use_cache=use_cache, per_page=100)
        
    if issues:
            # Separate issues from PRs
            repo_issues = []
            repo_prs = []
            
            for issue in issues:
                if issue.get('pull_request'):
                    repo_prs.append({**issue, 'repo_name': repo_name})
                else:
                    repo_issues.append({**issue, 'repo_name': repo_name})
            
            all_issues.extend(repo_issues)
            all_prs.extend(repo_prs)
            
            # Save per-repo files
            if repo_issues:
                repo_issues_file = save_json_data(
                    repo_issues,
                    f"data/bronze/issues_{repo_name}.json"
                )
                generated_files.append(repo_issues_file)
            
            if repo_prs:
                repo_prs_file = save_json_data(
                    repo_prs,
                    f"data/bronze/prs_{repo_name}.json"
                )
                generated_files.append(repo_prs_file)
        
    # Get issue events
    events_base = f"https://api.github.com/repos/{full_name}/issues/events"
    events = client.get_paginated(events_base, use_cache=use_cache, per_page=100)
        
    if events:
            repo_events = [{**event, 'repo_name': repo_name} for event in events]
            all_issue_events.extend(repo_events)
            
            # Save per-repo events
            events_file = save_json_data(
                repo_events,
                f"data/bronze/issue_events_{repo_name}.json"
            )
            generated_files.append(events_file)
    
    # Save aggregated files
    if all_issues:
        all_issues_file = save_json_data(
            all_issues,
            "data/bronze/issues_all.json"
        )
        generated_files.append(all_issues_file)
    
    if all_prs:
        all_prs_file = save_json_data(
            all_prs,
            "data/bronze/prs_all.json"
        )
        generated_files.append(all_prs_file)
    
    if all_issue_events:
        all_events_file = save_json_data(
            all_issue_events,
            "data/bronze/issue_events_all.json"
        )
        generated_files.append(all_events_file)
    
    print(f"Extracted {len(all_issues)} issues, {len(all_prs)} PRs, {len(all_issue_events)} events")
    
    return generated_files