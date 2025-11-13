import silver.collaboration_networks as cn

def test_process_collaboration_networks_basic(monkeypatch):
    # Dados simulados
    issues = [{'repo_name': 'repoA', 'user': {'login': 'alice'}, 'assignee': {'login': 'bob'}}]
    prs = [{'repo_name': 'repoA', 'user': {'login': 'carol'}}]
    commits = [{'repo_name': 'repoA', 'author': {'login': 'dave'}}]
    events = [{'repo_name': 'repoA', 'actor': {'login': 'erin'}, 'event': 'commented'}]

    def fake_load(path):
        if 'issues_all.json' in path:
            return issues
        if 'prs_all.json' in path:
            return prs
        if 'commits_all.json' in path:
            return commits
        if 'issue_events_all.json' in path:
            return events
        return []

    saved = {}
    def fake_save(data, path):
        saved[path] = data
        return path

    monkeypatch.setattr(cn, 'load_json_data', fake_load)
    monkeypatch.setattr(cn, 'save_json_data', fake_save)

    generated = cn.process_collaboration_networks()
    assert "data/silver/collaboration_edges.json" in generated
    assert "data/silver/user_collaboration_metrics.json" in generated
    # Deve haver pelo menos algumas conexões geradas
    edges = saved["data/silver/collaboration_edges.json"]
    assert len(edges) >= 1
    # Usuários devem estar nos metrics
    metrics = saved["data/silver/user_collaboration_metrics.json"]
    users_list = [m['user'] for m in metrics]
    assert 'alice' in users_list

def test_process_collaboration_networks_cross_repo(monkeypatch):
    # Usuário participa de dois repositórios → deve aparecer em cross_repository_hubs
    issues = [{'repo_name': 'repoA', 'user': {'login': 'alice'}},
              {'repo_name': 'repoB', 'user': {'login': 'alice'}}]
    prs = []
    commits = []
    events = []

    def fake_load(path):
        if 'issues_all.json' in path:
            return issues
        if 'prs_all.json' in path:
            return prs
        if 'commits_all.json' in path:
            return commits
        if 'issue_events_all.json' in path:
            return events
        return []

    saved = {}
    def fake_save(data, path):
        saved[path] = data
        return path

    monkeypatch.setattr(cn, 'load_json_data', fake_load)
    monkeypatch.setattr(cn, 'save_json_data', fake_save)

    generated = cn.process_collaboration_networks()
    assert "data/silver/cross_repository_hubs.json" in generated
    hubs = saved["data/silver/cross_repository_hubs.json"]
    assert any(h['user'] == 'alice' and h['repo_count'] == 2 for h in hubs)