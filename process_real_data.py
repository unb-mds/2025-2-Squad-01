import json
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter

def get_week_key(dt_str):
    from datetime import datetime, timedelta
    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    days_since_monday = dt.weekday()
    monday = dt - timedelta(days=days_since_monday)
    return monday.strftime('%Y-%m-%d')

# Load enriched commits
with open('data/bronze/commits_2025-2-Squad-01_with_stats.json', 'r', encoding='utf-8') as f:
    commits_data = json.load(f)

commits = [c for c in commits_data if 'sha' in c]

# Aggregate by author and week
author_data = defaultdict(lambda: defaultdict(lambda: {
    'commits': 0, 'additions': 0, 'deletions': 0, 'changedFiles': 0
}))

for commit in commits:
    author = commit['commit']['author']['name']
    date = commit['commit']['author']['date']
    week = get_week_key(date)
    
    author_data[author][week]['commits'] += 1
    if 'stats' in commit:
        author_data[author][week]['additions'] += commit['stats'].get('additions', 0)
        author_data[author][week]['deletions'] += commit['stats'].get('deletions', 0)
    if 'files' in commit:
        author_data[author][week]['changedFiles'] += len(commit['files'])

# Process into final format
result = {}
for author, weeks_data in author_data.items():
    sorted_weeks = sorted(weeks_data.items())
    total_lines = 0
    metrics = []
    
    for week, data in sorted_weeks:
        total_lines += (data['additions'] - data['deletions'])
        changes_per_commit = (data['additions'] + data['deletions']) / data['commits'] if data['commits'] > 0 else 0
        
        metrics.append({
            'date': week,
            'commits': data['commits'],
            'additions': data['additions'],
            'deletions': data['deletions'],
            'changedFiles': data['changedFiles'],
            'totalLines': max(0, total_lines),
            'changesPerCommit': round(changes_per_commit, 1),
        })
    
    result[author] = metrics

# Calculate totals
total_commits = sum(sum(w['commits'] for w in m) for m in result.values())
total_add = sum(sum(w['additions'] for w in m) for m in result.values())
total_del = sum(sum(w['deletions'] for w in m) for m in result.values())

output = {
    '_metadata': {
        'repository': '2025-2-Squad-01',
        'processed_at': datetime.now().isoformat(),
        'source': 'REST API with real stats',
        'total_authors': len(result),
        'total_commits': total_commits,
        'total_additions': total_add,
        'total_deletions': total_del,
        'authors': list(result.keys()),
    },
    'authors': result
}

# Save
with open('front-end/public/commits_by_author_2025-2-Squad-01.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f'✓ Processed REAL data for {len(result)} authors')
print(f'  Total commits: {total_commits}')
print(f'  Total additions: +{total_add:,}')
print(f'  Total deletions: -{total_del:,}')
print(f'  Saved to: front-end/public/commits_by_author_2025-2-Squad-01.json')
