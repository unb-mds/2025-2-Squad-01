#!/usr/bin/env python3

from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any
from utils.github_api import save_json_data, load_json_data

def process_contribution_metrics() -> List[str]:
    
    
    issues_data = load_json_data("data/bronze/issues_all.json") or []
    prs_data = load_json_data("data/bronze/prs_all.json") or []
    commits_data = load_json_data("data/bronze/commits_all.json") or []
    issue_events_data = load_json_data("data/bronze/issue_events_all.json") or []
    
   
    for data_list in [issues_data, prs_data, commits_data, issue_events_data]:
        if isinstance(data_list, list) and len(data_list) > 0 and '_metadata' in data_list[0]:
            data_list = data_list[1:]
    
    
    contributions = defaultdict(lambda: {
        'issues_created': 0,
        'issues_assigned': 0,
        'prs_authored': 0,
        'prs_reviewed': 0,
        'commits': 0,
        'comments': 0,
        'total_contributions': 0
    })
    


    contribution_list = []
    for user, contrib in contributions.items():
        contrib['user'] = user
        contrib['total_contributions'] = sum([
            contrib['issues_created'],
            contrib['issues_assigned'],
            contrib['prs_authored'],
            contrib['prs_reviewed'],
            contrib['commits'],
            contrib['comments']
        ])
        contrib['has_contributed'] = contrib['total_contributions'] > 0
        contribution_list.append(contrib)
    

    contribution_list.sort(key=lambda x: x['total_contributions'], reverse=True)
    
    generated_files = []

    contrib_file = save_json_data(
        contribution_list,
        "data/silver/contribution_metrics.json"
    )
    generated_files.append(contrib_file)
    

    repo_metrics = defaultdict(lambda: {
        'issues': 0,
        'prs': 0,
        'commits': 0,
        'comments': 0,
        'total_activity': 0
    })
    
    for issue in issues_data:
        repo = issue.get('repo_name', 'unknown')
        repo_metrics[repo]['issues'] += 1
    
    for pr in prs_data:
        repo = pr.get('repo_name', 'unknown')
        repo_metrics[repo]['prs'] += 1
    
    for commit in commits_data:
        repo = commit.get('repo_name', 'unknown')
        repo_metrics[repo]['commits'] += 1
    
    for event in issue_events_data:
        repo = event.get('repo_name', 'unknown')
        if event.get('event') in ['commented', 'issue_comment']:
            repo_metrics[repo]['comments'] += 1
    
  
    repo_list = []
    for repo, metrics in repo_metrics.items():
        metrics['repo'] = repo
        metrics['total_activity'] = sum([
            metrics['issues'],
            metrics['prs'], 
            metrics['commits'],
            metrics['comments']
        ])
        repo_list.append(metrics)
    
    repo_list.sort(key=lambda x: x['total_activity'], reverse=True)
    
    
    repo_file = save_json_data(
        repo_list,
        "data/silver/repository_metrics.json"
    )
    generated_files.append(repo_file)
    
  
    total_contributors = len([c for c in contribution_list if c['has_contributed']])
    non_contributors = len([c for c in contribution_list if not c['has_contributed']])
    
    if total_contributors > 0:
        contrib_values = [c['total_contributions'] for c in contribution_list if c['has_contributed']]
        
        distribution_analysis = {
            'total_contributors': total_contributors,
            'non_contributors': non_contributors,
            'top_10_percent': len([c for c in contrib_values if c >= sorted(contrib_values, reverse=True)[max(0, int(len(contrib_values) * 0.1) - 1)]]),
            'avg_contributions': sum(contrib_values) / len(contrib_values) if contrib_values else 0,
            'median_contributions': sorted(contrib_values)[len(contrib_values) // 2] if contrib_values else 0,
            'max_contributions': max(contrib_values) if contrib_values else 0,
            'min_contributions': min([c for c in contrib_values if c > 0]) if contrib_values else 0
        }
        
        distribution_file = save_json_data(
            distribution_analysis,
            "data/silver/contribution_distribution.json"
        )
        generated_files.append(distribution_file)
    
    print(f"Processed contributions for {len(contribution_list)} users across {len(repo_list)} repositories")
    return generated_files