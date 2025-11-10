import silver.contribution_metrics as cm

def test_process_contribution_metrics(monkeypatch):
    # dados de exemplo (pequeno conjunto)
    issues = [{'repo_name': 'r1', 'user': {'login': 'alice'}, 'assignee': {'login': 'bob'}}]
    prs = [{'repo_name': 'r1', 'user': {'login': 'alice'}}]
    commits = [{'repo_name': 'r1', 'author': {'login': 'carol'}}]
    events = [{'repo_name': 'r1', 'actor': {'login': 'dave'}, 'event': 'commented'}]

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
        # armazena o que foi salvo para asserções
        saved[path] = data
        return path

    monkeypatch.setattr(cm, 'load_json_data', fake_load)
    monkeypatch.setattr(cm, 'save_json_data', fake_save)

    generated = cm.process_contribution_metrics()

    assert "data/silver/contribution_metrics.json" in generated
    # Verifica que os dados salvos contêm o usuário 'alice'
    contrib = saved.get("data/silver/contribution_metrics.json")
    assert any(c['user'] == 'alice' for c in contrib)