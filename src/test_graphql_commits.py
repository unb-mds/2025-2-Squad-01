#!/usr/bin/env python3
"""
Script to test GraphQL commit extraction
Usage: python test_graphql_commits.py --token YOUR_TOKEN --owner OWNER --repo REPO
"""

import argparse
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_graphql import GitHubGraphQLClient


def main():
    parser = argparse.ArgumentParser(description='Test GraphQL commit extraction')
    parser.add_argument('--token', required=True, help='GitHub Personal Access Token')
    parser.add_argument('--owner', required=True, help='Repository owner (org or user)')
    parser.add_argument('--repo', required=True, help='Repository name')
    parser.add_argument('--branch', default='main', help='Branch name (default: main)')
    parser.add_argument('--max-commits', type=int, default=10, help='Max commits to fetch (default: 10)')
    
    args = parser.parse_args()
    
    print(f"Testing GraphQL commit extraction")
    print(f"Repository: {args.owner}/{args.repo}")
    print(f"Branch: {args.branch}")
    print(f"Started at: {datetime.now().isoformat()}\n")
    
    # Initialize GraphQL client
    client = GitHubGraphQLClient(args.token)
    
    try:
        # Fetch commits
        print(f"Fetching up to {args.max_commits} commits...\n")
        commits = client.get_all_repository_commits(
            owner=args.owner,
            repo_name=args.repo,
            branch=args.branch,
            max_total_commits=args.max_commits
        )
        
        if not commits:
            print("[ERROR] No commits found or error occurred")
            return
        
        print(f"\n{'='*80}")
        print(f"SUMMARY: Found {len(commits)} commits")
        print(f"{'='*80}\n")
        
        # Calculate statistics
        total_additions = sum(c.get('additions', 0) for c in commits)
        total_deletions = sum(c.get('deletions', 0) for c in commits)
        total_files = sum(c.get('changedFiles', 0) for c in commits)
        
        print("Statistics:")
        print(f"  Total lines added:   {total_additions:,}")
        print(f"  Total lines deleted: {total_deletions:,}")
        print(f"  Total files changed: {total_files:,}")
        print(f"  Average additions per commit: {total_additions / len(commits):.2f}")
        print(f"  Average deletions per commit: {total_deletions / len(commits):.2f}")
        
        # Display first few commits
        print(f"\n{'='*80}")
        print("First 5 commits:")
        print(f"{'='*80}\n")
        
        for i, commit in enumerate(commits[:5], 1):
            author = commit.get('author', {})
            author_name = author.get('name', 'Unknown')
            author_login = author.get('user', {}).get('login') if author.get('user') else None
            
            print(f"{i}. {commit.get('oid', 'N/A')[:8]}")
            print(f"   Author: {author_name}" + (f" (@{author_login})" if author_login else ""))
            print(f"   Date: {commit.get('committedDate', 'N/A')}")
            print(f"   Message: {commit.get('message', 'N/A').split(chr(10))[0][:70]}...")
            print(f"   Changes: +{commit.get('additions', 0)} -{commit.get('deletions', 0)} files:{commit.get('changedFiles', 0)}")
            print()
        
        print(f"{'='*80}")
        print("✓ Test completed successfully!")
        
    except Exception as e:
        print(f"\n[ERROR] Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
