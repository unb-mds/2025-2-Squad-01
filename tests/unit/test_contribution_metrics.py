import silver.contribution_metrics as contrib

def test_process_contribution_metrics_empty(monkeypatch):
    """Testa processamento com dados vazios"""
    def fake_load(path: str):
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    assert any(f.endswith("contribution_metrics.json") for f in files)
    metrics = saved["data/silver/contribution_metrics.json"]
    assert isinstance(metrics, list)
    assert len(metrics) == 0
    # Apenas 2 arquivos: contribution_metrics e repository_metrics (sem distribution)
    assert len(files) == 2

def test_process_contribution_metrics_repository_data(monkeypatch):
    """Testa processamento de métricas por repositório"""
    issues = [{"repo_name": "r1"}, {"repo_name": "r1"}, {"repo_name": "r2"}]
    prs = [{"repo_name": "r1"}]
    commits = [{"repo_name": "r2"}]
    events = [{"repo_name": "r1", "event": "commented"}, {"repo_name": "r2", "event": "commented"}]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        if path.endswith("prs_all.json"):
            return prs
        if path.endswith("commits_all.json"):
            return commits
        if path.endswith("issue_events_all.json"):
            return events
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    assert any(f.endswith("repository_metrics.json") for f in files)

    repos = saved["data/silver/repository_metrics.json"]
    r1 = next(r for r in repos if r["repo"] == "r1")
    assert r1["issues"] == 2
    assert r1["prs"] == 1
    assert r1["comments"] == 1
    assert r1["total_activity"] == 4

    r2 = next(r for r in repos if r["repo"] == "r2")
    assert r2["issues"] == 1
    assert r2["commits"] == 1
    assert r2["comments"] == 1
    assert r2["total_activity"] == 3

def test_process_contribution_metrics_metadata_removal(monkeypatch):
    """Testa remoção de metadata dos dados"""
    issues = [
        {"_metadata": {"timestamp": "2024-01-01"}},
        {"repo_name": "r1"},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    repos = saved["data/silver/repository_metrics.json"]
    r1 = next((r for r in repos if r["repo"] == "r1"), None)
    assert r1 is not None
    # Metadata foi removida, então apenas 1 issue (não 2)
    assert r1["issues"] == 1

def test_process_contribution_metrics_repository_sorting(monkeypatch):
    """Testa ordenação de repositórios por total_activity"""
    issues = [
        {"repo_name": "r1"},
        {"repo_name": "r1"},
        {"repo_name": "r1"},
        {"repo_name": "r2"},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    repos = saved["data/silver/repository_metrics.json"]
    
    # r1 deve vir primeiro (mais atividade)
    assert repos[0]["repo"] == "r1"
    assert repos[0]["total_activity"] == 3
    assert repos[1]["repo"] == "r2"
    assert repos[1]["total_activity"] == 1

def test_process_contribution_metrics_unknown_repo(monkeypatch):
    """Testa tratamento de repositório desconhecido"""
    issues = [
        {"user": {"login": "alice"}},  # Sem repo_name
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    repos = saved["data/silver/repository_metrics.json"]
    
    # Deve ter um repo 'unknown'
    unknown = next((r for r in repos if r["repo"] == "unknown"), None)
    assert unknown is not None
    assert unknown["issues"] == 1

def test_process_contribution_metrics_comment_events(monkeypatch):
    """Testa contagem de diferentes tipos de eventos de comentário"""
    events = [
        {"repo_name": "r1", "event": "commented"},
        {"repo_name": "r1", "event": "issue_comment"},
        {"repo_name": "r1", "event": "labeled"},  # Não é comentário
    ]

    def fake_load(path: str):
        if path.endswith("issue_events_all.json"):
            return events
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    repos = saved["data/silver/repository_metrics.json"]
    r1 = next((r for r in repos if r["repo"] == "r1"), None)
    assert r1 is not None
    # Apenas 'commented' e 'issue_comment' contam
    assert r1["comments"] == 2

def test_process_contribution_metrics_multiple_repos(monkeypatch):
    """Testa processamento de múltiplos repositórios"""
    issues = [{"repo_name": "repo1"}, {"repo_name": "repo2"}, {"repo_name": "repo3"}]
    prs = [{"repo_name": "repo1"}, {"repo_name": "repo2"}]
    commits = [{"repo_name": "repo1"}]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        if path.endswith("prs_all.json"):
            return prs
        if path.endswith("commits_all.json"):
            return commits
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    repos = saved["data/silver/repository_metrics.json"]
    
    assert len(repos) == 3
    
    repo1 = next(r for r in repos if r["repo"] == "repo1")
    assert repo1["total_activity"] == 3  # 1 issue + 1 pr + 1 commit
    
    repo2 = next(r for r in repos if r["repo"] == "repo2")
    assert repo2["total_activity"] == 2  # 1 issue + 1 pr
    
    repo3 = next(r for r in repos if r["repo"] == "repo3")
    assert repo3["total_activity"] == 1  # 1 issue

def test_process_contribution_metrics_total_activity_calculation(monkeypatch):
    """Testa cálculo correto de total_activity"""
    issues = [{"repo_name": "r1"}]
    prs = [{"repo_name": "r1"}]
    commits = [{"repo_name": "r1"}, {"repo_name": "r1"}]
    events = [
        {"repo_name": "r1", "event": "commented"},
        {"repo_name": "r1", "event": "issue_comment"}
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        if path.endswith("prs_all.json"):
            return prs
        if path.endswith("commits_all.json"):
            return commits
        if path.endswith("issue_events_all.json"):
            return events
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    repos = saved["data/silver/repository_metrics.json"]
    r1 = repos[0]
    
    # 1 issue + 1 pr + 2 commits + 2 comments = 6
    assert r1["total_activity"] == 6
    assert r1["issues"] == 1
    assert r1["prs"] == 1
    assert r1["commits"] == 2
    assert r1["comments"] == 2

def test_process_contribution_metrics_empty_contributions_list(monkeypatch):
    """Testa que contribution_metrics sempre é uma lista vazia (código não popula usuários)"""
    issues = [{"repo_name": "r1", "user": {"login": "alice"}}]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(contrib, "load_json_data", fake_load)
    monkeypatch.setattr(contrib, "save_json_data", fake_save)

    files = contrib.process_contribution_metrics()
    
    metrics = saved["data/silver/contribution_metrics.json"]
    
    # O código nunca popula contributions, então sempre vazio
    assert metrics == []
    
    # Não gera distribution_analysis porque não há contribuidores
    assert not any("contribution_distribution.json" in f for f in files)