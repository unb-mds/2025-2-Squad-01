#!/usr/bin/env python3

from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any
import sys
from pathlib import Path

# Adicionar diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.utils.github_api import save_json_data, load_json_data, parse_github_date

def process_members_statistics() -> List[str]:
    """
    Gera estatísticas individuais por membro, incluindo avg_weekly_activity.
    """
    
    # Carregar dados bronze
    issues_data = load_json_data("data/bronze/issues_all.json") or []
    prs_data = load_json_data("data/bronze/prs_all.json") or []
    commits_data = load_json_data("data/bronze/commits_all.json") or []
    issue_events_data = load_json_data("data/bronze/issue_events_all.json") or []
    
    # Remover metadata se existir
    for data_list in [issues_data, prs_data, commits_data, issue_events_data]:
        if isinstance(data_list, list) and len(data_list) > 0 and '_metadata' in data_list[0]:
            data_list = data_list[1:]
    
    generated_files = []
    
    # Estrutura para agregar eventos por membro
    members_data = defaultdict(lambda: {
        'name': None,
        'events': [],
        'total_commits': 0,
        'total_issues_created': 0,
        'total_issues_closed': 0,
        'total_prs_created': 0,
        'total_prs_closed': 0,
        'total_comments': 0,
        'repos': set(),
        'first_activity': None,
        'last_activity': None
    })
    
    # Processar commits
    for commit in commits_data:
        commit_date = None
        commit_obj = commit.get('commit') or {}
        author_obj = commit_obj.get('author') or {}
        if author_obj.get('date'):
            commit_date = parse_github_date(author_obj['date'])
        
        if commit_date:
            # Obter identificador do usuário (prioridade: login > name)
            user_identifier = 'unknown'
            
            if author_obj.get('login'):
                user_identifier = author_obj['login']
            elif commit.get('author', {}) and commit['author'].get('login'):
                user_identifier = commit['author']['login']
            elif author_obj.get('name'):
                user_identifier = author_obj['name']
            
            if user_identifier != 'unknown' and 'bot]' not in user_identifier:
                member = members_data[user_identifier]
                member['name'] = user_identifier
                member['events'].append({
                    'date': commit_date,
                    'type': 'commit',
                    'repo': commit.get('repo_name', 'unknown')
                })
                member['total_commits'] += 1
                member['repos'].add(commit.get('repo_name', 'unknown'))
                
                # Atualizar first/last activity
                if member['first_activity'] is None or commit_date < member['first_activity']:
                    member['first_activity'] = commit_date
                if member['last_activity'] is None or commit_date > member['last_activity']:
                    member['last_activity'] = commit_date
    
    # Processar issues
    for issue in issues_data:
        user = issue.get('user') or {}
        user_identifier = user.get('login') or user.get('name') or 'unknown'
        
        if user_identifier != 'unknown' and 'bot]' not in user_identifier:
            # Issue criada
            created_at = parse_github_date(issue.get('created_at'))
            if created_at:
                member = members_data[user_identifier]
                member['name'] = user_identifier
                member['events'].append({
                    'date': created_at,
                    'type': 'issue_created',
                    'repo': issue.get('repo_name', 'unknown')
                })
                member['total_issues_created'] += 1
                member['repos'].add(issue.get('repo_name', 'unknown'))
                
                if member['first_activity'] is None or created_at < member['first_activity']:
                    member['first_activity'] = created_at
                if member['last_activity'] is None or created_at > member['last_activity']:
                    member['last_activity'] = created_at
            
            # Issue fechada
            if issue.get('state') == 'closed':
                closed_at = parse_github_date(issue.get('closed_at', issue.get('updated_at')))
                if closed_at:
                    member = members_data[user_identifier]
                    member['events'].append({
                        'date': closed_at,
                        'type': 'issue_closed',
                        'repo': issue.get('repo_name', 'unknown')
                    })
                    member['total_issues_closed'] += 1
                    
                    if member['first_activity'] is None or closed_at < member['first_activity']:
                        member['first_activity'] = closed_at
                    if member['last_activity'] is None or closed_at > member['last_activity']:
                        member['last_activity'] = closed_at
    
    # Processar PRs
    for pr in prs_data:
        user = pr.get('user') or {}
        user_identifier = user.get('login') or user.get('name') or 'unknown'
        
        if user_identifier != 'unknown' and 'bot]' not in user_identifier:
            # PR criada
            created_at = parse_github_date(pr.get('created_at'))
            if created_at:
                member = members_data[user_identifier]
                member['name'] = user_identifier
                member['events'].append({
                    'date': created_at,
                    'type': 'pr_created',
                    'repo': pr.get('repo_name', 'unknown')
                })
                member['total_prs_created'] += 1
                member['repos'].add(pr.get('repo_name', 'unknown'))
                
                if member['first_activity'] is None or created_at < member['first_activity']:
                    member['first_activity'] = created_at
                if member['last_activity'] is None or created_at > member['last_activity']:
                    member['last_activity'] = created_at
            
            # PR fechada
            if pr.get('state') == 'closed':
                closed_at = parse_github_date(pr.get('closed_at', pr.get('updated_at')))
                if closed_at:
                    member = members_data[user_identifier]
                    member['events'].append({
                        'date': closed_at,
                        'type': 'pr_closed',
                        'repo': pr.get('repo_name', 'unknown')
                    })
                    member['total_prs_closed'] += 1
                    
                    if member['first_activity'] is None or closed_at < member['first_activity']:
                        member['first_activity'] = closed_at
                    if member['last_activity'] is None or closed_at > member['last_activity']:
                        member['last_activity'] = closed_at
    
    # Processar eventos de issues (comments, etc)
    for event in issue_events_data:
        actor = event.get('actor') or {}
        user_identifier = actor.get('login') or actor.get('name') or 'unknown'
        
        if user_identifier != 'unknown' and 'bot]' not in user_identifier:
            event_date = parse_github_date(event.get('created_at'))
            if event_date:
                member = members_data[user_identifier]
                member['name'] = user_identifier
                
                event_type = event.get('event', 'unknown')
                if 'comment' in event_type.lower():
                    member['total_comments'] += 1
                
                member['events'].append({
                    'date': event_date,
                    'type': f"event_{event_type}",
                    'repo': event.get('repo_name', 'unknown')
                })
                member['repos'].add(event.get('repo_name', 'unknown'))
                
                if member['first_activity'] is None or event_date < member['first_activity']:
                    member['first_activity'] = event_date
                if member['last_activity'] is None or event_date > member['last_activity']:
                    member['last_activity'] = event_date
    
    # Calcular estatísticas finais para cada membro
    members_statistics = []
    
    for username, data in members_data.items():
        if data['first_activity'] and data['last_activity']:
            # Calcular período de atividade
            activity_period_days = (data['last_activity'] - data['first_activity']).days
            activity_period_weeks = activity_period_days / 7.0
            
            # Evitar divisão por zero
            if activity_period_weeks < 0.1:
                activity_period_weeks = 0.1
            
            # Calcular total de eventos
            total_events = len(data['events'])
            
            # Calcular avg_weekly_activity
            avg_weekly_activity = total_events / activity_period_weeks
            
            # Calcular avg_daily_activity
            avg_daily_activity = total_events / max(1, activity_period_days)
            
            # Calcular médias específicas por tipo
            avg_commits = data['total_commits'] / activity_period_weeks
            avg_prs = (data['total_prs_created'] + data['total_prs_closed']) / activity_period_weeks
            avg_issues = (data['total_issues_created'] + data['total_issues_closed']) / activity_period_weeks
            
            member_stats = {
                'name': username,
                'total_events': total_events,
                'total_commits': data['total_commits'],
                'total_issues_created': data['total_issues_created'],
                'total_issues_closed': data['total_issues_closed'],
                'total_prs_created': data['total_prs_created'],
                'total_prs_closed': data['total_prs_closed'],
                'total_comments': data['total_comments'],
                'repos': list(data['repos']),
                'repos_count': len(data['repos']),
                'activity_period': {
                    'first_activity': data['first_activity'].isoformat(),
                    'last_activity': data['last_activity'].isoformat(),
                    'days': activity_period_days,
                    'weeks': round(activity_period_weeks, 2)
                },
                'avg_weekly_activity': round(avg_weekly_activity, 2),
                'avg_daily_activity': round(avg_daily_activity, 2),
                'avg_commits_per_week': round(avg_commits, 2),
                'avg_prs_per_week': round(avg_prs, 2),
                'avg_issues_per_week': round(avg_issues, 2)
            }
            
            members_statistics.append(member_stats)
    
    # Ordenar por avg_weekly_activity (decrescente)
    members_statistics.sort(key=lambda x: x['avg_weekly_activity'], reverse=True)
    
    # Salvar arquivo
    stats_file = save_json_data(
        members_statistics,
        "data/silver/members_statistics.json"
    )
    generated_files.append(stats_file)
    
    print(f"Processed member statistics: {len(members_statistics)} members")
    
    return generated_files


if __name__ == "__main__":
    process_members_statistics()
