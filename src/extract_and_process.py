"""
Extract commits with additions/deletions using GraphQL and process into Silver layer.
This script combines Bronze extraction (GraphQL) and Silver processing.
"""

import sys
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.github_graphql import GitHubGraphQLClient
from silver.commits_by_author import aggregate_commits_by_author
from datetime import datetime


def extract_and_process_commits(token: str, owner: str, repo: str, output_dir: str = "data"):
    """
    Extract commits via GraphQL and process into Silver layer by author.
    
    Args:
        token: GitHub Personal Access Token
        owner: Repository owner (e.g., 'unb-mds')
        repo: Repository name (e.g., '2025-2-Squad-01')
        output_dir: Base output directory
    """
    print("=" * 80)
    print("COMMIT EXTRACTION AND PROCESSING PIPELINE")
    print("=" * 80)
    
    # Step 1: Extract commits via GraphQL
    print("\n[1/3] Extracting commits via GraphQL...")
    print(f"  Owner: {owner}")
    print(f"  Repo: {repo}")
    
    bronze_dir = Path(output_dir) / "bronze"
    bronze_dir.mkdir(parents=True, exist_ok=True)
    bronze_file = bronze_dir / f"commits_{repo}_graphql.json"
    
    try:
        # Create GraphQL client
        client = GitHubGraphQLClient(token)
        
        # Get all commits for the repository
        print("  Fetching commits...")
        commits = client.get_all_repository_commits(owner, repo)
        
        print(f"✓ Extracted {len(commits)} commits")
        
        # Add metadata
        commits_data = [
            {
                "_metadata": {
                    "extracted_at": datetime.now().isoformat(),
                    "file_path": str(bronze_file),
                    "record_count": len(commits),
                    "source": "GraphQL API"
                }
            }
        ] + commits
        
        # Save to bronze
        with open(bronze_file, 'w', encoding='utf-8') as f:
            json.dump(commits_data, f, indent=2, ensure_ascii=False)
        
        print(f"  Saved to: {bronze_file}")
        
    except Exception as e:
        print(f"✗ Error during extraction: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Step 2: Process by author
    print("\n[2/3] Processing commits by author...")
    
    author_metrics = aggregate_commits_by_author(commits_data)
    
    silver_dir = Path(output_dir) / "silver"
    silver_dir.mkdir(parents=True, exist_ok=True)
    silver_file = silver_dir / f"commits_by_author_{repo}_graphql.json"
    
    # Calculate summary statistics
    total_commits = sum(
        sum(week['commits'] for week in metrics)
        for metrics in author_metrics.values()
    )
    total_additions = sum(
        sum(week['additions'] for week in metrics)
        for metrics in author_metrics.values()
    )
    total_deletions = sum(
        sum(week['deletions'] for week in metrics)
        for metrics in author_metrics.values()
    )
    
    output_data = {
        '_metadata': {
            'repository': repo,
            'owner': owner,
            'processed_at': datetime.now().isoformat(),
            'source': 'GraphQL API',
            'total_authors': len(author_metrics),
            'total_commits': total_commits,
            'total_additions': total_additions,
            'total_deletions': total_deletions,
            'authors': list(author_metrics.keys()),
        },
        'authors': author_metrics
    }
    
    with open(silver_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Processed {len(author_metrics)} authors")
    print(f"  Total commits: {total_commits}")
    print(f"  Total additions: +{total_additions:,}")
    print(f"  Total deletions: -{total_deletions:,}")
    print(f"  Saved to: {silver_file}")
    
    # Step 3: Copy to frontend
    print("\n[3/3] Copying to frontend...")
    
    frontend_file = Path("front-end/public") / f"commits_by_author_{repo}_graphql.json"
    frontend_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(frontend_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Copied to: {frontend_file}")
    
    print("\n" + "=" * 80)
    print("✓ PIPELINE COMPLETE!")
    print("=" * 80)
    print(f"\nNext steps:")
    print(f"1. Update frontend to use: /2025-2-Squad-01/commits_by_author_{repo}_graphql.json")
    print(f"2. Reload the page to see real additions/deletions data")
    print(f"\nAuthors found: {', '.join(list(author_metrics.keys())[:5])}...")
    
    return True


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Extract commits via GraphQL and process by author',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python src/extract_and_process.py --token ghp_xxx --owner unb-mds --repo 2025-2-Squad-01
  
  # With custom output directory
  python src/extract_and_process.py --token ghp_xxx --owner unb-mds --repo 2025-2-Squad-01 --output data
        """
    )
    
    parser.add_argument('--token', required=True, help='GitHub Personal Access Token')
    parser.add_argument('--owner', required=True, help='Repository owner (e.g., unb-mds)')
    parser.add_argument('--repo', required=True, help='Repository name (e.g., 2025-2-Squad-01)')
    parser.add_argument('--output', default='data', help='Output directory (default: data)')
    
    args = parser.parse_args()
    
    success = extract_and_process_commits(
        token=args.token,
        owner=args.owner,
        repo=args.repo,
        output_dir=args.output
    )
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
