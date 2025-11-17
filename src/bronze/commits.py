import os
from typing import List, Dict, Any, Optional
from utils.github_api import GitHubAPIClient, OrganizationConfig, save_json_data, load_json_data

def extract_commits(
    client: GitHubAPIClient,
    config: OrganizationConfig,
    use_cache: bool = True,
    method: str = "rest",
    since: Optional[str] = None,
    until: Optional[str] = None,
    max_commits_per_repo: Optional[int] = None,
    page_size: int = 50,
) -> List[str]:
    
    # Load filtered repositories
    filtered_repos = load_json_data("data/bronze/repositories_filtered.json")
    if not filtered_repos:
        print("No repositories found. Run repository extraction first.")
        return []
    
    generated_files = []
    all_commits: List[Dict[str, Any]] = []
    
    # Skip metadata if present
    if isinstance(filtered_repos, list) and len(filtered_repos) > 0 and isinstance(filtered_repos[0], dict) and '_metadata' in filtered_repos[0]:
        filtered_repos = filtered_repos[1:]
    
    # Extract commits from each repository
    for repo in filtered_repos:
        if not repo or not isinstance(repo, dict):
            print(f"Skipping invalid repo entry: {repo}")
            continue
            
        repo_name = repo.get('name', 'unknown')
        full_name = repo.get('full_name', repo_name)
        owner = full_name.split('/')[0] if '/' in full_name else None
        name_only = full_name.split('/')[1] if '/' in full_name else full_name
        
        print(f"Processing commits for: {repo_name}")
        
        # Choose extraction method
        data_commits: List[Dict[str, Any]] = []
        if method.lower() == "graphql":
            if not owner:
                print(f"[WARN] Skipping {full_name}: cannot determine owner/name for GraphQL")
                continue
            nodes, meta = client.graphql_commit_history(
                owner=owner,
                repo=name_only,
                page_size=page_size,
                max_commits=max_commits_per_repo,
                since=since,
                until=until,
                use_cache=use_cache,
            )

            for n in nodes:
                # Map GraphQL fields to a REST-like structure to preserve downstream compatibility
                sha = n.get('oid')
                author = n.get('author') or {}
                committer = n.get('committer') or {}
                committed_date = n.get('committedDate')
                message = n.get('messageHeadline')
                additions = n.get('additions')
                deletions = n.get('deletions')
                changed_files = n.get('changedFiles')
                total_changes = (additions or 0) + (deletions or 0) if (additions is not None and deletions is not None) else None

                data_commits.append({
                    'sha': sha,
                    'html_url': n.get('url'),
                    'commit': {
                        'author': {
                            'name': author.get('name'),
                            'email': author.get('email'),
                            'date': author.get('date') or committed_date,
                            'login': (author.get('user') or {}).get('login') if isinstance(author.get('user'), dict) else None,
                        },
                        'committer': {
                            'name': committer.get('name'),
                            'email': committer.get('email'),
                            'date': committer.get('date') or committed_date,
                            'login': (committer.get('user') or {}).get('login') if isinstance(committer.get('user'), dict) else None,
                        },
                        'message': message,
                    },
                    'additions': additions,
                    'deletions': deletions,
                    'total_changes': total_changes,
                    'repo_name': repo_name,
                })

            if not nodes:
                print(f"[WARN] GraphQL returned no commits for {repo_name}. Falling back to REST.")
                # Fallback to REST list + details to avoid data gaps
                commits_base = f"https://api.github.com/repos/{full_name}/commits"
                if since or until:
                    sep = '&' if ('?' in commits_base) else '?'
                    if since:
                        commits_base = f"{commits_base}{sep}since={since}"
                        sep = '&'
                    if until:
                        commits_base = f"{commits_base}{sep}until={until}"
                commits = client.get_paginated(commits_base, use_cache=use_cache, per_page=100)
                for commit in commits or []:
                    sha = commit.get('sha')
                    additions = None
                    deletions = None
                    total_changes = None
                    if sha:
                        details_url = f"https://api.github.com/repos/{full_name}/commits/{sha}"
                        details = client.get_with_cache(details_url, use_cache)
                        if details and isinstance(details, dict):
                            stats = details.get('stats') or {}
                            additions = stats.get('additions')
                            deletions = stats.get('deletions')
                            total_changes = stats.get('total')
                    
                    # Ensure commit.commit.author.login is populated from commit.author.login if available
                    commit_data = {**commit}
                    if 'commit' in commit_data and 'author' in commit_data['commit']:
                        # If commit.author.login exists at root level, copy it to commit.commit.author.login
                        if 'author' in commit_data and isinstance(commit_data['author'], dict) and 'login' in commit_data['author']:
                            commit_data['commit']['author']['login'] = commit_data['author']['login']
                    
                    data_commits.append({
                        **commit_data,
                        'repo_name': repo_name,
                        'additions': additions,
                        'deletions': deletions,
                        'total_changes': total_changes,
                    })
                print(f"Found {len(data_commits)} commits in {repo_name} via REST fallback")
            else:
                print(f"Found {len(nodes)} commits in {repo_name} via GraphQL")
        else:
            # REST fallback (existing behavior): list commits, then fetch details per commit to get stats
            commits_base = f"https://api.github.com/repos/{full_name}/commits"
            # Apply since/until filters when available to reduce pages
            if since or until:
                sep = '&' if ('?' in commits_base) else '?'
                if since:
                    commits_base = f"{commits_base}{sep}since={since}"
                    sep = '&'
                if until:
                    commits_base = f"{commits_base}{sep}until={until}"
            commits = client.get_paginated(commits_base, use_cache=use_cache, per_page=page_size)
            if commits:
                for commit in commits:
                    sha = commit.get('sha')
                    additions = None
                    deletions = None
                    total_changes = None
                    if sha:
                        details_url = f"https://api.github.com/repos/{full_name}/commits/{sha}"
                        details = client.get_with_cache(details_url, use_cache)
                        if details and isinstance(details, dict):
                            stats = details.get('stats') or {}
                            additions = stats.get('additions')
                            deletions = stats.get('deletions')
                            total_changes = stats.get('total')
                    
                    # Ensure commit.commit.author.login is populated from commit.author.login if available
                    commit_data = {**commit}
                    if 'commit' in commit_data and 'author' in commit_data['commit']:
                        # If commit.author.login exists at root level, copy it to commit.commit.author.login
                        if 'author' in commit_data and isinstance(commit_data['author'], dict) and 'login' in commit_data['author']:
                            commit_data['commit']['author']['login'] = commit_data['author']['login']
                    
                    # Merge original commit with stats and repo context
                    data_commits.append({
                        **commit_data,
                        'repo_name': repo_name,
                        'additions': additions,
                        'deletions': deletions,
                        'total_changes': total_changes,
                    })

                print(f"Found {len(commits)} commits in {repo_name} via REST")

        if data_commits:
            # Add to global list
            all_commits.extend(data_commits)

            # Save per-repo commits
            repo_commits_file = save_json_data(
                data_commits,
                f"data/bronze/commits_{repo_name}.json"
            )
            generated_files.append(repo_commits_file)
    
    # Save all commits (always save, even if empty, to ensure files exist)
    all_commits_file = save_json_data(
        all_commits,
        "data/bronze/commits_all.json"
    )
    generated_files.append(all_commits_file)

    print(f"Total commits extracted: {len(all_commits)}")

    return generated_files