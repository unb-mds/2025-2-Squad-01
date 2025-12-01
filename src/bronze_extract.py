#!/usr/bin/env python3

import argparse
import sys
import os
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.github_api import GitHubAPIClient, OrganizationConfig, update_data_registry

def main():
    parser = argparse.ArgumentParser(description='Extract GitHub organization data to Bronze layer')
    parser.add_argument('--token', required=True, help='GitHub Personal Access Token')
    parser.add_argument('--org', default='unb-mds', help='GitHub organization name')
    parser.add_argument('--cache', action='store_true', help='Use cached data when available')
    parser.add_argument('--commits-method', choices=['rest', 'graphql'], default='rest', 
                        help='Extraction method for commits (REST v3 or GraphQL v4)')
    parser.add_argument('--since', help='ISO-8601 timestamp (e.g., 2024-01-01T00:00:00Z) to limit commit extraction start')
    parser.add_argument('--until', help='ISO-8601 timestamp (e.g., 2024-12-31T23:59:59Z) to limit commit extraction end')
    parser.add_argument('--max-commits-per-repo', type=int, 
                        help='Optional hard cap of commits per repo to fetch (GraphQL only)')
    parser.add_argument('--commits-page-size', type=int, default=50, 
                        help='Commits page size for pagination (REST & GraphQL). Default: 50')
    
    args = parser.parse_args()
    
    print(f"🚀 Starting Bronze layer extraction for organization: {args.org}")
    print(f"⏰ Started at: {datetime.now().isoformat()}")
    print(f"📋 Configuration:")
    print(f"   - Commits method: {args.commits_method}")
    print(f"   - Structure method: graphql (fixed)")  # 👈 CORRIGIDO
    print(f"   - Cache enabled: {args.cache}")
    
    # Initialize API client and configuration
    client = GitHubAPIClient(args.token)
    config = OrganizationConfig(args.org)
    
    try:
        # Import individual extractors
        from bronze.repositories import extract_repositories
        from bronze.issues import extract_issues
        from bronze.commits import extract_commits
        from bronze.members import extract_members
        from bronze.repository_structure import extract_repository_structure
        
        # Extract data in dependency order
        print("\n" + "="*60)
        print("📦 STEP 1: Extracting repositories")
        print("="*60)
        repo_files = extract_repositories(client, config, use_cache=args.cache)
        print(f"✅ Generated {len(repo_files)} repository files")

        print("\n" + "="*60)
        print("🐛 STEP 2: Extracting issues and pull requests")
        print("="*60)
        issue_files = extract_issues(
            client, 
            config, 
            use_cache=args.cache,
            parallel=True,
            max_workers=3,
            max_events_per_repo=500
        )
        print(f"✅ Generated {len(issue_files)} issue files")

        print("\n" + "="*60)
        print("💾 STEP 3: Extracting commits")
        print("="*60)
        commit_files = extract_commits(
            client,
            config,
            use_cache=args.cache,
            method=args.commits_method,
            since=args.since,
            until=args.until,
            max_commits_per_repo=args.max_commits_per_repo,
            page_size=args.commits_page_size,
        )
        print(f"✅ Generated {len(commit_files)} commit files")

        print("\n" + "="*60)
        print("👥 STEP 4: Extracting organization members")
        print("="*60)
        member_files = extract_members(client, config, use_cache=args.cache)
        print(f"✅ Generated {len(member_files)} member files")
        
        print("\n[INFO]: Extracting repository structures...")
        structure_files = extract_repository_structure(client, config, use_cache=args.cache)

        # Update registry
        all_files = repo_files + issue_files + commit_files + member_files + structure_files
        update_data_registry('bronze', 'all_extractions', all_files)

        # Resumo final
        print("\n" + "="*60)
        print("🎉 BRONZE EXTRACTION COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"📊 Summary:")
        print(f"   - Repositories: {len(repo_files)} files")
        print(f"   - Issues: {len(issue_files)} files")
        print(f"   - Commits: {len(commit_files)} files")
        print(f"   - Members: {len(member_files)} files")
        print(f"   - Structures: {len(structure_files)} files")
        print(f"   - TOTAL: {len(all_files)} files")
        print(f"\n⏰ Completed at: {datetime.now().isoformat()}")
        print("="*60)
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Extraction interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ Error during bronze extraction: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()