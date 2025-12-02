#!/usr/bin/env python3
"""
Script de teste para extrair commits de um único repositório.
Testa a extração paralela do REST API.
"""
import os
import sys
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from utils.github_api import GitHubAPIClient, save_json_data

def load_secrets():
    """Load credentials from .secrets file."""
    secrets = {}
    secrets_file = '.secrets'
    
    if not os.path.exists(secrets_file):
        return secrets
    
    with open(secrets_file, 'r') as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            # Parse KEY=VALUE format
            if '=' in line:
                key, value = line.split('=', 1)
                secrets[key.strip()] = value.strip()
    
    return secrets

def test_single_repo():
    """Test commit extraction for 2025-2-Squad-01 repository."""
    
    # Try to load token from .secrets file first, then from environment
    secrets = load_secrets()
    token = secrets.get('GITHUB_TOKEN') or os.getenv('GITHUB_TOKEN')
    
    if not token:
        print("ERROR: GITHUB_TOKEN not found")
        print("Please either:")
        print("  1. Create a .secrets file with: GITHUB_TOKEN=your_token")
        print("  2. Set environment variable: $env:GITHUB_TOKEN='your_token'")
        sys.exit(1)
    
    # Initialize client
    print("="*60)
    print("TESTING SINGLE REPO EXTRACTION")
    print("="*60)
    print(f"Repository: unb-mds/2025-2-Squad-01")
    print(f"Started at: {datetime.now().isoformat()}")
    print()
    
    client = GitHubAPIClient(token, cache_dir="cache")
    
    # Test parameters
    owner = "unb-mds"
    repo = "2025-2-Squad-01"
    page_size = 50
    
    print("Extracting commits with GraphQL + REST fallback...")
    print(f"Page size: {page_size}")
    print(f"REST parallel workers: 5")
    print(f"Cache: DISABLED (fresh extraction)")
    print()
    
    try:
        # Extract commits
        commits, rate_meta = client.graphql_commit_history(
            owner=owner,
            repo=repo,
            page_size=page_size,
            max_commits=None,  # Extract all
            since=None,
            until=None,
            use_cache=False,  # No cache for testing
            branches=None,  # Only default branch
            split_large_extractions=False,  # Don't split for testing
        )
        
        print()
        print("="*60)
        print("EXTRACTION COMPLETE")
        print("="*60)
        print(f"Total commits extracted: {len(commits)}")
        
        if rate_meta:
            print(f"Rate limit remaining: {rate_meta.get('remaining', 'Unknown')}")
            print(f"Rate limit total: {rate_meta.get('limit', 'Unknown')}")
        
        # Save to file
        output_file = f"data/test_commits_{repo}.json"
        save_json_data(commits, output_file)
        
        # Show sample commits
        if commits:
            print()
            print("Sample commits (first 5):")
            for i, commit in enumerate(commits[:5]):
                author = commit.get('author', {}).get('user', {}).get('login', 'Unknown')
                message = commit.get('messageHeadline', 'No message')
                additions = commit.get('additions', 0)
                deletions = commit.get('deletions', 0)
                print(f"{i+1}. {commit['oid'][:8]} | {author} | +{additions}/-{deletions} | {message[:50]}")
        
        print()
        print(f"Finished at: {datetime.now().isoformat()}")
        print("✓ Test completed successfully!")
        
    except Exception as e:
        print()
        print("="*60)
        print("ERROR DURING EXTRACTION")
        print("="*60)
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_single_repo()
