#!/usr/bin/env python3

from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any
from utils.github_api import save_json_data, load_json_data

def parse_github_date(date_str: str) -> datetime:

    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%SZ')
    except:
        return None

def process_temporal_analysis() -> List[str]:

    

    issues_data = load_json_data("data/bronze/issues_all.json") or []
    prs_data = load_json_data("data/bronze/prs_all.json") or []
    commits_data = load_json_data("data/bronze/commits_all.json") or []
    issue_events_data = load_json_data("data/bronze/issue_events_all.json") or []
    

    for data_list in [issues_data, prs_data, commits_data, issue_events_data]:
        if isinstance(data_list, list) and len(data_list) > 0 and '_metadata' in data_list[0]:
            data_list = data_list[1:]
    
    generated_files = []
    

    all_events = []
    

    for issue in issues_data:
        created_at = parse_github_date(issue.get('created_at'))
        if created_at:
            all_events.append({
                'date': created_at,
                'type': 'issue_created',
                'repo': issue.get('repo_name', 'unknown'),
                'user': issue.get('user', {}).get('login', 'unknown')
            })
        
        updated_at = parse_github_date(issue.get('updated_at'))
        if updated_at and issue.get('state') == 'closed':
            all_events.append({
                'date': updated_at,
                'type': 'issue_closed',
                'repo': issue.get('repo_name', 'unknown'),
                'user': issue.get('user', {}).get('login', 'unknown')
            })
    

    for pr in prs_data:
        created_at = parse_github_date(pr.get('created_at'))
        if created_at:
            all_events.append({
                'date': created_at,
                'type': 'pr_created',
                'repo': pr.get('repo_name', 'unknown'),
                'user': pr.get('user', {}).get('login', 'unknown')
            })
        
        updated_at = parse_github_date(pr.get('updated_at'))
        if updated_at and pr.get('state') == 'closed':
            all_events.append({
                'date': updated_at,
                'type': 'pr_closed',
                'repo': pr.get('repo_name', 'unknown'),
                'user': pr.get('user', {}).get('login', 'unknown')
            })
    

    for commit in commits_data:
        commit_date = None
        if commit.get('commit', {}).get('author', {}).get('date'):
            commit_date = parse_github_date(commit['commit']['author']['date'])
        
        if commit_date:
            all_events.append({
                'date': commit_date,
                'type': 'commit',
                'repo': commit.get('repo_name', 'unknown'),
                'user': commit.get('author', {}).get('login', 'unknown') if commit.get('author') else 'unknown'
            })
    

    for event in issue_events_data:
        event_date = parse_github_date(event.get('created_at'))
        if event_date:
            all_events.append({
                'date': event_date,
                'type': f"event_{event.get('event', 'unknown')}",
                'repo': event.get('repo_name', 'unknown'),
                'user': event.get('actor', {}).get('login', 'unknown') if event.get('actor') else 'unknown'
            })

    all_events.sort(key=lambda x: x['date'])

    events_file = save_json_data(
        [{**event, 'date': event['date'].isoformat()} for event in all_events],
        "data/silver/temporal_events.json"
    )
    generated_files.append(events_file)

    daily_activity = defaultdict(lambda: {
        'date': None,
        'total_events': 0,
        'issues_created': 0,
        'issues_closed': 0,
        'prs_created': 0,
        'prs_closed': 0,
        'commits': 0,
        'comments': 0,
        'unique_users': set(),
        'unique_repos': set()
    })
    
    for event in all_events:
        date_key = event['date'].date().isoformat()
        day_data = daily_activity[date_key]
        
        day_data['date'] = date_key
        day_data['total_events'] += 1
        day_data['unique_users'].add(event['user'])
        day_data['unique_repos'].add(event['repo'])
        
        if event['type'] == 'issue_created':
            day_data['issues_created'] += 1
        elif event['type'] == 'issue_closed':
            day_data['issues_closed'] += 1
        elif event['type'] == 'pr_created':
            day_data['prs_created'] += 1
        elif event['type'] == 'pr_closed':
            day_data['prs_closed'] += 1
        elif event['type'] == 'commit':
            day_data['commits'] += 1
        elif 'comment' in event['type']:
            day_data['comments'] += 1
    

    daily_summary = []
    for date_key, data in sorted(daily_activity.items()):
        data['unique_users'] = len(data['unique_users'])
        data['unique_repos'] = len(data['unique_repos'])
        daily_summary.append(data)
    
    daily_file = save_json_data(
        daily_summary,
        "data/silver/daily_activity_summary.json"
    )
    generated_files.append(daily_file)
    

    weekly_heatmap = defaultdict(lambda: defaultdict(int))
    
    for event in all_events:
        day_of_week = event['date'].weekday()  # 0=Monday, 6=Sunday
        hour = event['date'].hour
        weekly_heatmap[day_of_week][hour] += 1
    

    heatmap_data = []
    for day in range(7):  # Monday to Sunday
        for hour in range(24):
            heatmap_data.append({
                'day_of_week': day,
                'hour': hour,
                'activity_count': weekly_heatmap[day][hour]
            })
    
    heatmap_file = save_json_data(
        heatmap_data,
        "data/silver/activity_heatmap.json"
    )
    generated_files.append(heatmap_file)
    
 
    cycle_times = []
    

    for issue in issues_data:
        if issue.get('state') == 'closed':
            created = parse_github_date(issue.get('created_at'))
            closed = parse_github_date(issue.get('closed_at', issue.get('updated_at')))
            
            if created and closed and closed > created:
                cycle_time_days = (closed - created).total_seconds() / (24 * 3600)
                cycle_times.append({
                    'type': 'issue',
                    'repo': issue.get('repo_name', 'unknown'),
                    'number': issue.get('number'),
                    'created_at': created.isoformat(),
                    'closed_at': closed.isoformat(),
                    'cycle_time_days': cycle_time_days
                })
    

    for pr in prs_data:
        if pr.get('state') == 'closed':
            created = parse_github_date(pr.get('created_at'))
            closed = parse_github_date(pr.get('closed_at', pr.get('updated_at')))
            
            if created and closed and closed > created:
                cycle_time_days = (closed - created).total_seconds() / (24 * 3600)
                cycle_times.append({
                    'type': 'pr',
                    'repo': pr.get('repo_name', 'unknown'),
                    'number': pr.get('number'),
                    'created_at': created.isoformat(),
                    'closed_at': closed.isoformat(),
                    'cycle_time_days': cycle_time_days
                })
    
    if cycle_times:
        cycle_times_file = save_json_data(
            cycle_times,
            "data/silver/cycle_times.json"
        )
        generated_files.append(cycle_times_file)
    

    if all_events:
        min_date = min(event['date'] for event in all_events)
        max_date = max(event['date'] for event in all_events)
        
        temporal_stats = {
            'total_events': len(all_events),
            'date_range': {
                'start': min_date.isoformat(),
                'end': max_date.isoformat(),
                'days': (max_date - min_date).days
            },
            'events_by_type': {},
            'avg_daily_activity': len(all_events) / max(1, (max_date - min_date).days),
            'cycle_time_stats': {}
        }
        
     
        for event in all_events:
            event_type = event['type']
            temporal_stats['events_by_type'][event_type] = temporal_stats['events_by_type'].get(event_type, 0) + 1
        
       
        if cycle_times:
            cycle_time_values = [ct['cycle_time_days'] for ct in cycle_times]
            temporal_stats['cycle_time_stats'] = {
                'count': len(cycle_time_values),
                'avg_days': sum(cycle_time_values) / len(cycle_time_values),
                'median_days': sorted(cycle_time_values)[len(cycle_time_values) // 2],
                'min_days': min(cycle_time_values),
                'max_days': max(cycle_time_values)
            }
        
        stats_file = save_json_data(
            temporal_stats,
            "data/silver/temporal_statistics.json"
        )
        generated_files.append(stats_file)
    
    print(f"Processed temporal analysis: {len(all_events)} events, {len(daily_summary)} days")
    return generated_files