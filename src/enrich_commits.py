"""
Extract commit stats (additions/deletions) using REST API.
Alternative to GraphQL when it's unavailable.
"""

import requests
import json
import time
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any


def fetch_commit_with_stats(owner: str, repo: str, sha: str, token: str, session: requests.Session) -> Dict[str, Any]:
    """
    Fetch individual commit with stats from REST API.
    
    Args:
        owner: Repository owner
        repo: Repository name
        sha: Commit SHA
        token: GitHub token
        session: Requests session
    
    Returns:
        Commit data with stats
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    response = session.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"  [WARNING] Failed to fetch commit {sha[:7]}: {response.status_code}")
        return None


def enrich_commits_with_stats(
    owner: str,
    repo: str,
    token: str,
    input_file: str = "data/bronze/commits_2025-2-Squad-01.json",
    output_file: str = "data/bronze/commits_2025-2-Squad-01_with_stats.json"
):
    """
    Enrich existing commit data with stats from REST API.
    
    Args:
        owner: Repository owner
        repo: Repository name
        token: GitHub token
        input_file: Input JSON file with basic commit data
        output_file: Output JSON file with enriched data
    """
    print("=" * 80)
    print("ENRICHING COMMITS WITH STATS (REST API)")
    print("=" * 80)
    
    # Load existing commits
    print(f"\n[1/3] Loading existing commits from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        commits_data = json.load(f)
    
    # Separate metadata and commits
    metadata = commits_data[0] if '_metadata' in commits_data[0] else None
    commits = [c for c in commits_data if 'sha' in c]
    
    print(f"  Found {len(commits)} commits to enrich")
    
    # Fetch stats for each commit
    print(f"\n[2/3] Fetching stats for commits...")
    enriched_commits = []
    session = requests.Session()
    
    for i, commit in enumerate(commits, 1):
        sha = commit['sha']
        
        # Show progress every 10 commits
        if i % 10 == 0:
            print(f"  Progress: {i}/{len(commits)} commits processed...")
        
        # Check if already has stats
        if 'stats' in commit and commit['stats']:
            enriched_commits.append(commit)
            continue
        
        # Fetch detailed commit
        detailed = fetch_commit_with_stats(owner, repo, sha, token, session)
        
        if detailed and 'stats' in detailed:
            # Add stats to commit
            commit['stats'] = detailed['stats']
            commit['files'] = detailed.get('files', [])
            enriched_commits.append(commit)
        else:
            # Keep commit without stats
            enriched_commits.append(commit)
        
        # Rate limiting: wait a bit between requests
        time.sleep(0.1)
    
    print(f"  ✓ Processed {len(enriched_commits)} commits")
    
    # Count how many have stats
    with_stats = sum(1 for c in enriched_commits if 'stats' in c and c['stats'])
    print(f"  ✓ {with_stats} commits have stats")
    
    # Save enriched data
    print(f"\n[3/3] Saving enriched data...")
    
    output_data = []
    if metadata:
        metadata['enriched_at'] = datetime.now().isoformat()
        metadata['commits_with_stats'] = with_stats
        output_data.append(metadata)
    
    output_data.extend(enriched_commits)
    
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"  ✓ Saved to: {output_file}")
    
    print("\n" + "=" * 80)
    print("✓ ENRICHMENT COMPLETE!")
    print("=" * 80)
    print(f"\nCommits enriched: {with_stats}/{len(enriched_commits)}")
    
    return output_file


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Enrich commits with stats from REST API')
    parser.add_argument('--token', required=True, help='GitHub Personal Access Token')
    parser.add_argument('--owner', default='unb-mds', help='Repository owner')
    parser.add_argument('--repo', default='2025-2-Squad-01', help='Repository name')
    parser.add_argument('--input', default='data/bronze/commits_2025-2-Squad-01.json', help='Input file')
    parser.add_argument('--output', default='data/bronze/commits_2025-2-Squad-01_with_stats.json', help='Output file')
    
    args = parser.parse_args()
    
    enrich_commits_with_stats(
        owner=args.owner,
        repo=args.repo,
        token=args.token,
        input_file=args.input,
        output_file=args.output
    )
    
    print("\nNext step: Process with silver layer")
    print(f"  python src/silver/commits_by_author.py --repo 2025-2-Squad-01")


if __name__ == '__main__':
    main()
