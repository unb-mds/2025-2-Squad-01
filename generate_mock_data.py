"""
Generate realistic mock data with additions/deletions based on actual commit counts.
"""

import json
from pathlib import Path

# Load actual commit data
with open('data/silver/commits_by_author_2025-2-Squad-01.json', 'r', encoding='utf-8') as f:
    actual_data = json.load(f)

# Estimate additions/deletions based on typical patterns
# Average: ~60 additions and ~12 deletions per commit for new features
# Variation based on commit count
authors_with_mock = {}

for author, weeks in actual_data['authors'].items():
    author_weeks = []
    for week in weeks:
        commits = week['commits']
        # Estimate based on commit count (more commits = more changes)
        estimated_additions = commits * 60  # avg 60 lines added per commit
        estimated_deletions = commits * 12  # avg 12 lines deleted per commit
        
        # Add some variation
        import random
        random.seed(hash(week['date'] + author))  # Deterministic
        variation = random.uniform(0.7, 1.3)
        
        author_weeks.append({
            'date': week['date'],
            'commits': commits,
            'additions': int(estimated_additions * variation),
            'deletions': int(estimated_deletions * variation),
            'changedFiles': week['changedFiles'],
            'totalLines': 0,  # Will be recalculated
            'changesPerCommit': 0,  # Will be recalculated
        })
    
    # Recalculate cumulative metrics
    total_lines = 0
    for week in author_weeks:
        total_lines += (week['additions'] - week['deletions'])
        week['totalLines'] = max(0, total_lines)
        if week['commits'] > 0:
            week['changesPerCommit'] = round((week['additions'] + week['deletions']) / week['commits'], 1)
    
    authors_with_mock[author] = author_weeks

# Calculate totals
total_commits = sum(sum(w['commits'] for w in weeks) for weeks in authors_with_mock.values())
total_additions = sum(sum(w['additions'] for w in weeks) for weeks in authors_with_mock.values())
total_deletions = sum(sum(w['deletions'] for w in weeks) for weeks in authors_with_mock.values())

output = {
    '_metadata': {
        'repository': '2025-2-Squad-01',
        'processed_at': actual_data['_metadata']['processed_at'],
        'source': 'Mock data based on actual commits (estimated additions/deletions)',
        'total_authors': len(authors_with_mock),
        'total_commits': total_commits,
        'total_additions': total_additions,
        'total_deletions': total_deletions,
        'authors': list(authors_with_mock.keys()),
    },
    'authors': authors_with_mock
}

# Save
output_file = Path('front-end/public/commits_by_author_2025-2-Squad-01.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✓ Generated mock data for {len(authors_with_mock)} authors")
print(f"  Total commits: {total_commits}")
print(f"  Total additions: +{total_additions:,}")
print(f"  Total deletions: -{total_deletions:,}")
print(f"  Saved to: {output_file}")
