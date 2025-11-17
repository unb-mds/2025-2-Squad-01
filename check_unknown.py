#!/usr/bin/env python3

import json

# Verificar commits
with open('data/bronze/commits_all.json', 'r', encoding='utf-8') as f:
    commits = json.load(f)

print(f'Total commits: {len(commits)}')
if len(commits) > 0 and '_metadata' in commits[0]:
    commits = commits[1:]
    print(f'Após remover metadata: {len(commits)}')

unknown_authors = [c for c in commits if c.get('author') is None]
print(f'Commits com author=None: {len(unknown_authors)}')

no_login = [c for c in commits if c.get('author') and not c['author'].get('login')]
print(f'Commits com author mas sem login: {len(no_login)}')

# Amostra
if len(commits) > 1:
    sample = commits[1]
    print('\nAmostra de commit:')
    print(f"  repo_name: {sample.get('repo_name')}")
    print(f"  author: {sample.get('author')}")
    print(f"  commit.author: {sample.get('commit', {}).get('author')}")

# Verificar colaborações
print('\n--- Colaborações ---')
with open('data/silver/collaboration_edges.json', 'r', encoding='utf-8') as f:
    collab = json.load(f)

valid_collab = [c for c in collab if c.get('user1') and c.get('user2')]
print(f'Total colaborações válidas: {len(valid_collab)}')
unknown_collab = [c for c in valid_collab if c.get('user1') == 'unknown' or c.get('user2') == 'unknown']
print(f'Colaborações com unknown: {len(unknown_collab)}')

# Contar frequência de cada usuário
from collections import Counter
users = []
for c in valid_collab:
    users.append(c['user1'])
    users.append(c['user2'])
counter = Counter(users)
print(f'\nTop 10 colaboradores:')
for user, count in counter.most_common(10):
    print(f'  {user}: {count}')
