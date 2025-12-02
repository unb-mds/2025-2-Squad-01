#!/usr/bin/env python3
"""
Test script for commit extraction with active branches support.
Tests the new functionality for extracting commits from unmerged branches.
"""

import sys
import os
from datetime import datetime

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from utils.github_api import GitHubAPIClient, OrganizationConfig
from bronze.commits import extract_commits

def test_commit_extraction():
    """Test commit extraction with different configurations."""
    
    # Get token from .secrets file
    token = None
    try:
        with open('.secrets', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GITHUB_TOKEN='):
                    # Extract value after '=', removing quotes if present
                    token = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
    except FileNotFoundError:
        print("Error: .secrets file not found")
        return False
    
    if not token:
        print("Error: GITHUB_TOKEN not found in .secrets file")
        print("Make sure .secrets contains a line like: GITHUB_TOKEN=your_token_here")
        return False
    
    print("="*80)
    print("COMMIT EXTRACTION TEST")
    print("="*80)
    print(f"Started at: {datetime.now().isoformat()}\n")
    
    # Initialize client
    client = GitHubAPIClient(token)
    config = OrganizationConfig('unb-mds')
    
    # Test 1: Default extraction (main branch only)
    print("\n" + "="*80)
    print("TEST 1: Extract commits from main branch only")
    print("="*80)
    try:
        files = extract_commits(
            client=client,
            config=config,
            use_cache=True,
            method='graphql',
            max_commits_per_repo=10,  # Limit for testing
            page_size=10,
            include_active_branches=False,
        )
        print(f"\n✓ Test 1 passed: Generated {len(files)} files")
    except Exception as e:
        print(f"\n✗ Test 1 failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 2: Extract with active branches (last 30 days)
    print("\n" + "="*80)
    print("TEST 2: Extract commits from main + active branches (last 30 days)")
    print("="*80)
    try:
        files = extract_commits(
            client=client,
            config=config,
            use_cache=True,
            method='graphql',
            max_commits_per_repo=20,  # Slightly more for branches
            page_size=10,
            include_active_branches=True,
            active_days=30,
        )
        print(f"\n✓ Test 2 passed: Generated {len(files)} files")
    except Exception as e:
        print(f"\n✗ Test 2 failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 3: Extract with active branches (last 7 days - more recent)
    print("\n" + "="*80)
    print("TEST 3: Extract commits from main + active branches (last 7 days)")
    print("="*80)
    try:
        files = extract_commits(
            client=client,
            config=config,
            use_cache=True,
            method='graphql',
            max_commits_per_repo=15,
            page_size=10,
            include_active_branches=True,
            active_days=7,
        )
        print(f"\n✓ Test 3 passed: Generated {len(files)} files")
    except Exception as e:
        print(f"\n✗ Test 3 failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "="*80)
    print("ALL TESTS PASSED ✓")
    print("="*80)
    print(f"Completed at: {datetime.now().isoformat()}")
    return True

def test_branch_detection():
    """Test the branch detection functionality independently."""
    
    # Get token from .secrets file
    token = None
    try:
        with open('.secrets', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GITHUB_TOKEN='):
                    # Extract value after '=', removing quotes if present
                    token = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
    except FileNotFoundError:
        print("Error: .secrets file not found")
        return False
    
    if not token:
        print("Error: GITHUB_TOKEN not found in .secrets file")
        return False
    
    print("\n" + "="*80)
    print("BRANCH DETECTION TEST")
    print("="*80)
    
    client = GitHubAPIClient(token)
    
    # Test on a known repository (this repo)
    test_repo = "2025-2-Squad-01"
    test_owner = "unb-mds"
    
    print(f"\nTesting branch detection on: {test_owner}/{test_repo}")
    print("-"*80)
    
    try:
        branches = client.get_active_unmerged_branches(
            owner=test_owner,
            repo=test_repo,
            days=30,
            use_cache=False,  # Force fresh check
        )
        
        if branches:
            print(f"\n✓ Found {len(branches)} active unmerged branches:")
            for branch in branches:
                print(f"  - {branch}")
        else:
            print("\n✓ No active unmerged branches found (all branches are merged or old)")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Branch detection failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("COMMIT EXTRACTION TEST SUITE")
    print("="*80)
    print("Testing new functionality for extracting commits from active branches")
    print("="*80 + "\n")
    
    # Test branch detection first
    if not test_branch_detection():
        print("\n⚠ Branch detection test failed, but continuing with commit extraction tests...")
    
    # Run commit extraction tests
    success = test_commit_extraction()
    
    if success:
        print("\n" + "="*80)
        print("🎉 ALL TESTS COMPLETED SUCCESSFULLY")
        print("="*80)
        sys.exit(0)
    else:
        print("\n" + "="*80)
        print("❌ SOME TESTS FAILED")
        print("="*80)
        sys.exit(1)

if __name__ == "__main__":
    main()
