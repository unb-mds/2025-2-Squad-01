"""
Silver layer processing for commit metrics by author.
Aggregates commit data by author and time period.
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List, Any


def parse_date(date_str: str) -> datetime:
    """Parse ISO 8601 date string to datetime."""
    return datetime.fromisoformat(date_str.replace('Z', '+00:00'))


def get_week_key(dt: datetime) -> str:
    """Get week identifier (YYYY-MM-DD of Monday)."""
    days_since_monday = dt.weekday()
    monday = dt - timedelta(days=days_since_monday)
    return monday.strftime('%Y-%m-%d')


def aggregate_commits_by_author(commits: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Aggregate commit data by author and week.
    
    Returns dictionary with author names as keys and weekly metrics as values.
    """
    author_data = defaultdict(lambda: defaultdict(lambda: {
        'commits': 0,
        'additions': 0,
        'deletions': 0,
        'changedFiles': 0,
    }))
    
    # Skip metadata entry
    data_commits = [c for c in commits if 'sha' in c]
    
    for commit in data_commits:
        try:
            # Get author name
            author_name = commit['commit']['author']['name']
            
            # Get commit date
            commit_date_str = commit['commit']['author']['date']
            commit_date = parse_date(commit_date_str)
            week_key = get_week_key(commit_date)
            
            # Aggregate data
            author_data[author_name][week_key]['commits'] += 1
            
            # Check if we have stats (from GraphQL or REST API with stats)
            stats = commit.get('stats', {})
            if stats:
                author_data[author_name][week_key]['additions'] += stats.get('additions', 0)
                author_data[author_name][week_key]['deletions'] += stats.get('deletions', 0)
            
            # Changed files count
            files = commit.get('files', [])
            if files:
                author_data[author_name][week_key]['changedFiles'] += len(files)
                
        except (KeyError, ValueError) as e:
            print(f"Warning: Error processing commit {commit.get('sha', 'unknown')}: {e}")
            continue
    
    # Process each author's data
    result = {}
    for author, weekly_data in author_data.items():
        sorted_weeks = sorted(weekly_data.items())
        total_lines = 0
        author_metrics = []
        
        for week_key, data in sorted_weeks:
            # Calculate cumulative total lines
            total_lines += (data['additions'] - data['deletions'])
            
            # Calculate changes per commit
            changes_per_commit = (
                (data['additions'] + data['deletions']) / data['commits']
                if data['commits'] > 0 else 0
            )
            
            author_metrics.append({
                'date': week_key,
                'commits': data['commits'],
                'additions': data['additions'],
                'deletions': data['deletions'],
                'changedFiles': data['changedFiles'],
                'totalLines': max(0, total_lines),
                'changesPerCommit': round(changes_per_commit, 1),
            })
        
        result[author] = author_metrics
    
    return result


def process_repository_commits_by_author(repo_name: str, bronze_dir: Path, output_dir: Path) -> Dict[str, Any]:
    """
    Process commits for a repository and generate weekly metrics by author.
    
    Args:
        repo_name: Repository name (e.g., '2025-2-Squad-01')
        bronze_dir: Directory containing bronze layer data
        output_dir: Directory to save processed data
    
    Returns:
        Dictionary with processing metadata
    """
    # Read bronze data
    bronze_file = bronze_dir / f"commits_{repo_name}.json"
    
    if not bronze_file.exists():
        raise FileNotFoundError(f"Bronze file not found: {bronze_file}")
    
    print(f"Reading {bronze_file}")
    with open(bronze_file, 'r', encoding='utf-8') as f:
        commits_data = json.load(f)
    
    # Process data by author
    print(f"Processing {len(commits_data)} entries by author...")
    author_metrics = aggregate_commits_by_author(commits_data)
    
    # Prepare output
    output_file = output_dir / f"commits_by_author_{repo_name}.json"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Calculate summary statistics
    total_commits = sum(
        sum(week['commits'] for week in metrics)
        for metrics in author_metrics.values()
    )
    
    output_data = {
        '_metadata': {
            'repository': repo_name,
            'processed_at': datetime.now().isoformat(),
            'source_file': str(bronze_file),
            'total_authors': len(author_metrics),
            'total_commits': total_commits,
            'authors': list(author_metrics.keys()),
        },
        'authors': author_metrics
    }
    
    # Save processed data
    print(f"Saving to {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Processed {len(author_metrics)} authors")
    print(f"  Total commits: {total_commits}")
    print(f"  Authors: {', '.join(list(author_metrics.keys())[:5])}{'...' if len(author_metrics) > 5 else ''}")
    
    return output_data['_metadata']


def main():
    """Main processing function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Process commit data by author into weekly metrics')
    parser.add_argument('--repo', required=True, help='Repository name')
    parser.add_argument('--bronze-dir', default='data/bronze', help='Bronze data directory')
    parser.add_argument('--output-dir', default='data/silver', help='Output directory')
    
    args = parser.parse_args()
    
    bronze_dir = Path(args.bronze_dir)
    output_dir = Path(args.output_dir)
    
    metadata = process_repository_commits_by_author(args.repo, bronze_dir, output_dir)
    
    print("\n✓ Processing complete!")
    print(f"Output file: data/silver/commits_by_author_{args.repo}.json")


if __name__ == '__main__':
    main()
