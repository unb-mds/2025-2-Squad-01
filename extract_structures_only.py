#!/usr/bin/env python3
"""
Extract repository structures only (fast extraction without commits/issues)
"""

import sys
import os
import argparse
from pathlib import Path

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from bronze.repository_structure import extract_repository_structure
from utils.github_api import load_json_data, GitHubAPIClient

def main():
    parser = argparse.ArgumentParser(description='Extract repository structures only')
    parser.add_argument('--token', help='GitHub Personal Access Token')
    args = parser.parse_args()
    
    # Get token from argument or environment variable
    github_token = args.token or os.getenv('GITHUB_TOKEN')
    
    if not github_token:
        print("❌ Error: GitHub token not provided!")
        print("   Use: python extract_structures_only.py --token YOUR_TOKEN")
        print("   Or set environment variable: $env:GITHUB_TOKEN='YOUR_TOKEN'")
        sys.exit(1)
    
    # Initialize GitHub API client
    github_api = GitHubAPIClient(github_token)
    print("🌳 Starting structure extraction for all repositories...")
    
    # Load filtered repositories
    repos_file = "data/bronze/repositories_filtered.json"
    
    if not os.path.exists(repos_file):
        print(f"❌ Error: {repos_file} not found!")
        print("   Run: python src/bronze_extract.py first to get repository list")
        sys.exit(1)
    
    repos_data = load_json_data(repos_file)
    
    if not repos_data or not isinstance(repos_data, list):
        print(f"❌ Error: Invalid format in {repos_file}")
        sys.exit(1)
    
    # Filter out metadata objects
    repositories = [r for r in repos_data if 'name' in r and 'owner' in r]
    total = len(repositories)
    
    print(f"📊 Found {total} repositories to process\n")
    
    success_count = 0
    error_count = 0
    
    for idx, repo in enumerate(repositories, 1):
        repo_name = repo.get('name')
        owner = repo.get('owner', {}).get('login', 'unb-mds')
        
        # Check if structure already exists
        expected_file = f"data/bronze/structure_{repo_name}.json"
        if os.path.exists(expected_file):
            print(f"[{idx}/{total}] ⏭️  Skipping {repo_name} (already exists)")
            success_count += 1
            continue
        
        print(f"[{idx}/{total}] Extracting structure: {repo_name}...")
        
        try:
            structure_file = extract_repository_structure(github_api, owner, repo_name)
            
            if structure_file and os.path.exists(structure_file):
                print(f"  ✅ Structure saved: {structure_file}")
                success_count += 1
            else:
                print(f"  ⚠️  Structure extraction returned None or file not found")
                error_count += 1
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            error_count += 1
        
        print()
    
    print("=" * 60)
    print(f"✅ Structure extraction completed!")
    print(f"   Success: {success_count}/{total}")
    print(f"   Errors:  {error_count}/{total}")
    print("=" * 60)
    
    if success_count > 0:
        print("\n🔄 Next step: Run silver processing to generate language analysis")
        print("   python src/silver_process.py")

if __name__ == "__main__":
    main()
