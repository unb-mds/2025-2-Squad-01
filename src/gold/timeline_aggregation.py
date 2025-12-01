#!/usr/bin/env python3

from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any
from utils.github_api import save_json_data, load_json_data, parse_github_date

def process_timeline_aggregation() -> List[str]:
    """
    Generate timeline aggregations from daily_activity_summary:
    - Last 7 days activity
    - Last 12 months activity
    """
    
    # Load the daily activity summary and temporal events (for repo mapping)
    daily_summary = load_json_data("data/silver/daily_activity_summary.json") or []
    temporal_events = load_json_data("data/silver/temporal_events.json") or []
    
    if isinstance(daily_summary, list) and len(daily_summary) > 0 and '_metadata' in daily_summary[0]:
        daily_summary = daily_summary[1:]
    
    if isinstance(temporal_events, list) and len(temporal_events) > 0 and '_metadata' in temporal_events[0]:
        temporal_events = temporal_events[1:]
    
    generated_files = []
    
    if not daily_summary:
        print("No daily activity summary data found")
        return generated_files
    
    # Build author-to-repos mapping from temporal events
    author_repos_map = defaultdict(set)
    for event in temporal_events:
        author = event.get('user')
        repo = event.get('repo')
        if author and repo:
            author_repos_map[author].add(repo)
    
    # Get current date (use the most recent date in data as reference)
    dates = [datetime.fromisoformat(day['date']) for day in daily_summary if day.get('date')]
    if not dates:
        print("No valid dates found in daily summary")
        return generated_files
    
    most_recent_date = max(dates)
    
    # === Last 7 Days Aggregation ===
    seven_days_ago = most_recent_date - timedelta(days=6)  # Including today = 7 days
    
    last_7_days = []
    for day in daily_summary:
        day_date = datetime.fromisoformat(day['date'])
        if seven_days_ago <= day_date <= most_recent_date:
            # Add repository information to each author
            day_copy = day.copy()
            if 'authors' in day_copy:
                authors_with_repos = []
                for author in day_copy['authors']:
                    author_copy = author.copy()
                    author_name = author['name']
                    author_copy['repositories'] = sorted(list(author_repos_map.get(author_name, [])))
                    authors_with_repos.append(author_copy)
                day_copy['authors'] = authors_with_repos
            last_7_days.append(day_copy)
    
    # Sort by date (most recent last)
    last_7_days.sort(key=lambda x: x['date'])
    
    seven_days_file = save_json_data(
        last_7_days,
        "data/gold/timeline_last_7_days.json"
    )
    generated_files.append(seven_days_file)
    
    # === Last 12 Months Aggregation ===
    twelve_months_ago = most_recent_date.replace(day=1) - timedelta(days=1)  # Last day of previous month
    twelve_months_ago = twelve_months_ago.replace(day=1)  # First day of that month
    # Go back 11 more months
    for _ in range(11):
        twelve_months_ago = twelve_months_ago.replace(day=1) - timedelta(days=1)
        twelve_months_ago = twelve_months_ago.replace(day=1)
    
    # Group daily data by month
    monthly_activity = defaultdict(lambda: {
        'date': None,
        'total_events': 0,
        'issues_created': 0,
        'issues_closed': 0,
        'prs_created': 0,
        'prs_closed': 0,
        'commits': 0,
        'comments': 0,
        'unique_users': set(),
        'unique_repos': set(),
        'authors': defaultdict(lambda: {
            'commits': 0,
            'issues_created': 0,
            'issues_closed': 0,
            'prs_created': 0,
            'prs_closed': 0,
            'comments': 0
        })
    })
    
    for day in daily_summary:
        day_date = datetime.fromisoformat(day['date'])
        
        if day_date >= twelve_months_ago:
            # Create month key (YYYY-MM format)
            month_key = day_date.strftime('%Y-%m')
            month_data = monthly_activity[month_key]
            
            month_data['date'] = month_key
            month_data['total_events'] += day.get('total_events', 0)
            month_data['issues_created'] += day.get('issues_created', 0)
            month_data['issues_closed'] += day.get('issues_closed', 0)
            month_data['prs_created'] += day.get('prs_created', 0)
            month_data['prs_closed'] += day.get('prs_closed', 0)
            month_data['commits'] += day.get('commits', 0)
            month_data['comments'] += day.get('comments', 0)
            
            # Aggregate unique users and repos
            # Note: These are already counts in daily_summary, not sets
            if isinstance(day.get('unique_users'), int):
                month_data['unique_users'].add(day.get('unique_users'))  # Track daily counts
            if isinstance(day.get('unique_repos'), int):
                month_data['unique_repos'].add(day.get('unique_repos'))  # Track daily counts
            
            # Aggregate author activities
            for author in day.get('authors', []):
                author_name = author['name']
                month_data['authors'][author_name]['commits'] += author.get('commits', 0)
                month_data['authors'][author_name]['issues_created'] += author.get('issues_created', 0)
                month_data['authors'][author_name]['issues_closed'] += author.get('issues_closed', 0)
                month_data['authors'][author_name]['prs_created'] += author.get('prs_created', 0)
                month_data['authors'][author_name]['prs_closed'] += author.get('prs_closed', 0)
                month_data['authors'][author_name]['comments'] += author.get('comments', 0)
    
    # Convert to list and prepare for JSON serialization
    last_12_months = []
    for month_key, data in sorted(monthly_activity.items()):
        # For unique_users and unique_repos, we'll take the max daily count as approximation
        # (since we can't reconstruct the actual unique set from aggregated daily counts)
        data['unique_users'] = max(data['unique_users']) if data['unique_users'] else 0
        data['unique_repos'] = max(data['unique_repos']) if data['unique_repos'] else 0
        
        # Convert authors dict to list
        authors_list = []
        for author_name, stats in data['authors'].items():
            authors_list.append({
                'name': author_name,
                'commits': stats['commits'],
                'issues_created': stats['issues_created'],
                'issues_closed': stats['issues_closed'],
                'prs_created': stats['prs_created'],
                'prs_closed': stats['prs_closed'],
                'comments': stats['comments'],
                'repositories': sorted(list(author_repos_map.get(author_name, [])))
            })
        data['authors'] = authors_list
        
        last_12_months.append(data)
    
    twelve_months_file = save_json_data(
        last_12_months,
        "data/gold/timeline_last_12_months.json"
    )
    generated_files.append(twelve_months_file)
    
    print(f"Generated timeline aggregations: {len(last_7_days)} days, {len(last_12_months)} months")
    return generated_files
