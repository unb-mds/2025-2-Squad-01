#!/usr/bin/env python3
# CODIGO PRINCIPAL PARA EXTRAÇÃO DE DADOS DO GITHUB PARA A CAMADA BRONZE

import argparse
import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_api import GitHubAPIClient, OrganizationConfig, update_data_registry

def main():
    parser = argparse.ArgumentParser(description='Extract GitHub organization data to Bronze layer')
    parser.add_argument('--token', required=True, help='GitHub Personal Access Token')
    parser.add_argument('--org', default='coops-org', help='GitHub organization name')
    parser.add_argument('--cache', action='store_true', help='Use cached data when available')
    parser.add_argument('--commits-method', choices=['rest', 'graphql'], default='rest', help='Extraction method for commits (REST v3 or GraphQL v4)')
    parser.add_argument('--since', help='ISO-8601 timestamp (e.g., 2024-01-01T00:00:00Z) to limit commit extraction start')
    parser.add_argument('--until', help='ISO-8601 timestamp (e.g., 2024-12-31T23:59:59Z) to limit commit extraction end')
    parser.add_argument('--max-commits-per-repo', type=int, help='Optional hard cap of commits per repo to fetch (GraphQL only)')
    parser.add_argument('--commits-page-size', type=int, default=50, help='Commits page size for pagination (REST & GraphQL). Default: 50')
    parser.add_argument('--include-active-branches', action='store_true', help='Include commits from recently active branches not merged to main (GraphQL only)')
    parser.add_argument('--active-days', type=int, default=30, help='Consider branches active if updated in last N days (default: 30)')
    parser.add_argument('--time-chunks', type=int, default=3, help='Split large extractions into N time periods to avoid API overload (default: 3)')
    
    args = parser.parse_args()
    
    print(f"Starting Bronze layer extraction for organization: {args.org}")
    print(f"Started at: {datetime.now().isoformat()}")
    
    # Initialize API client
    client = GitHubAPIClient(args.token)
    config = OrganizationConfig(args.org)
    
    try:
        # Import and run individual extractors
        from bronze.repositories import extract_repositories
        from bronze.issues import extract_issues
        from bronze.commits import extract_commits
        from bronze.members import extract_members
        
        # Extract data in dependency order

        print("\n[INFO]: Extracting repositories...")
        repo_files = extract_repositories(client, config, use_cache=args.cache)

        print("\n[INFO]: Extracting issues and pull requests...")
        issue_files = extract_issues(client, config, use_cache=args.cache)

        print("\n[INFO]: Extracting commits...")
        commit_files = extract_commits(
            client,
            config,
            use_cache=args.cache,
            method=args.commits_method,
            since=args.since,
            until=args.until,
            max_commits_per_repo=args.max_commits_per_repo,
            page_size=args.commits_page_size,
            include_active_branches=args.include_active_branches,
            active_days=args.active_days,
            time_chunks=args.time_chunks,
        )

        print("\n[INFO]: Extracting organization members...")
        member_files = extract_members(client, config, use_cache=args.cache)

        
        

        # Update registry
        all_files = repo_files + issue_files + commit_files + member_files
        update_data_registry('bronze', 'all_extractions', all_files)

        print(f"\n[SUCCESS] Bronze extraction completed successfully!")
        print(f"Generated {len(all_files)} files:")
        for file_path in all_files:
            print(f"   - {file_path}")
            
    except Exception as e:
        print(f"\n[ERROR] Error during bronze extraction: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()