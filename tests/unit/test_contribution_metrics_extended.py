import silver.contribution_metrics as cm

def test_process_contribution_metrics_empty(monkeypatch):
    def fake_load(_): return []
    saved = {}
    def fake_save(data, path):
        saved[path] = data
        return path
    monkeypatch.setattr(cm, 'load_json_data', fake_load)
    monkeypatch.setattr(cm, 'save_json_data', fake_save)

    generated = cm.process_contribution_metrics()
    assert "data/silver/contribution_metrics.json" in generated
    contrib_saved = saved["data/silver/contribution_metrics.json"]
    assert contrib_saved == []  # sem usuários
    # repository_metrics deve estar, mas possivelmente vazio
    repo_saved = saved["data/silver/repository_metrics.json"]
    assert repo_saved == []

def test_process_contribution_metrics_multiple_events(monkeypatch):
    issues = [
        {'repo_name': 'r1', 'user': {'login': 'alice'}, 'assignee': {'login': 'bob'}},
        {'repo_name': 'r1', 'user': {'login': 'carol'}, 'assignee': None},
    ]
    prs = [{'repo_name': 'r1', 'user': {'login': 'alice'}}]
    commits = [{'repo_name': 'r1', 'author': {'login': 'carol'}}]
    events = [
        {'repo_name': 'r1', 'actor': {'login': 'alice'}, 'event': 'commented'},
        {'repo_name': 'r1', 'actor': {'login': 'alice'}, 'event': 'reviewed'},
    ]

    def fake_load(path):
        if 'issues_all.json' in path: return issues
        if 'prs_all.json' in path: return prs
        if 'commits_all.json' in path: return commits
        if 'issue_events_all.json' in path: return events
        return []

    saved = {}
    def fake_save(data, path):
        saved[path] = data
        return path

    monkeypatch.setattr(cm, 'load_json_data', fake_load)
    monkeypatch.setattr(cm, 'save_json_data', fake_save)

    generated = cm.process_contribution_metrics()
    contrib_list = saved["data/silver/contribution_metrics.json"]
    alice_metrics = next(c for c in contrib_list if c['user'] == 'alice')
    assert alice_metrics['issues_created'] == 1
    assert alice_metrics['prs_authored'] == 1
    assert alice_metrics['comments'] == 1
    assert alice_metrics['prs_reviewed'] == 1
    assert alice_metrics['total_contributions'] == (
        alice_metrics['issues_created'] +
        alice_metrics['issues_assigned'] +
        alice_metrics['prs_authored'] +
        alice_metrics['prs_reviewed'] +
        alice_metrics['commits'] +
        alice_metrics['comments']
    )