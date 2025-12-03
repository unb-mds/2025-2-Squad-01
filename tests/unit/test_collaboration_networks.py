import silver.collaboration_networks as collab

def test_process_collaboration_networks_basic(monkeypatch, fake_io):
    """Testa processamento básico de redes de colaboração"""
    # Dados sintéticos
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}, "assignee": {"login": "carol"}},
    ]
    prs = [
        {"repo_name": "repo1", "user": {"login": "dave"}},
        {"repo_name": "repo2", "user": {"login": "alice"}},
    ]
    commits = [
        {"repo_name": "repo1", "author": {"login": "eve"}},
        {"repo_name": "repo2", "commit": {"author": {"login": "frank"}}},
    ]
    events = [
        {"repo_name": "repo1", "actor": {"login": "bob"}},
        {"repo_name": "repo2", "actor": {"login": "alice"}},
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

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    assert any(p.endswith("collaboration_edges.json") for p in files)

    edges = fake_io["data/silver/collaboration_edges.json"]
    assert len(edges) > 0
    # Verifica se pelo menos uma aresta contém usuários ordenados
    e0 = edges[0]
    assert "user1" in e0 and "user2" in e0

    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    # alice deveria aparecer (issues + prs + event)
    assert any(u["user"] == "alice" for u in user_metrics)

    repo_analysis = fake_io["data/silver/repository_collaboration_analysis.json"]
    assert any(r["repo"] == "repo1" for r in repo_analysis)

def test_process_collaboration_networks_empty_data(monkeypatch, fake_io):
    """Testa processamento com dados vazios"""
    def fake_load(path: str):
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    # Deve gerar 4 arquivos mesmo com dados vazios
    assert len(files) == 4
    
    edges = fake_io["data/silver/collaboration_edges.json"]
    assert edges == []
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    assert user_metrics == []

def test_process_collaboration_networks_metadata_removal(monkeypatch, fake_io):
    """Testa remoção de metadata dos dados"""
    issues = [
        {"_metadata": {"timestamp": "2024-01-01"}},  # Deve ser removido
        {"repo_name": "repo1", "user": {"login": "alice"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    assert len(user_metrics) == 0

def test_process_collaboration_networks_metadata_with_multiple_users(monkeypatch, fake_io):
    """Testa remoção de metadata com múltiplos usuários"""
    issues = [
        {"_metadata": {"timestamp": "2024-01-01"}},  # Deve ser removido
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    
    # Agora com alice e bob, deve haver colaboração
    assert len(user_metrics) == 2
    users = {u["user"] for u in user_metrics}
    assert "alice" in users
    assert "bob" in users

def test_process_collaboration_networks_issue_assignee(monkeypatch, fake_io):
    """Testa que assignees de issues são incluídos como colaboradores"""
    issues = [
        {
            "repo_name": "repo1",
            "user": {"login": "alice"},
            "assignee": {"login": "bob"}
        },
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    edges = fake_io["data/silver/collaboration_edges.json"]
    
    # Deve criar uma aresta entre alice e bob
    assert len(edges) == 1
    assert edges[0]["user1"] == "alice"
    assert edges[0]["user2"] == "bob"
    assert edges[0]["repo"] == "repo1"

def test_process_collaboration_networks_commit_author_priority(monkeypatch, fake_io):
    """Testa priorização de identificação de autor em commits"""
    commits = [
        {
            "repo_name": "repo1",
            "author": {"login": "alice"},  # Prioridade 1
        },
        {
            "repo_name": "repo1",
            "commit": {"author": {"login": "bob"}},  # Prioridade 2
        },
        {
            "repo_name": "repo3",
            "author": {"name": "Charlie"},  # Sem login, deve ser ignorado
        },
    ]

    def fake_load(path: str):
        if path.endswith("commits_all.json"):
            return commits
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    
    # Deve ter alice e bob, mas não Charlie (sem login)
    users = {u["user"] for u in user_metrics}
    assert "alice" in users
    assert "bob" in users
    assert "Charlie" not in users

     # Deve haver uma colaboração entre alice e bob
    edges = fake_io["data/silver/collaboration_edges.json"]
    assert len(edges) == 1
    assert edges[0]["user1"] == "alice"
    assert edges[0]["user2"] == "bob"

def test_process_collaboration_networks_event_actor(monkeypatch, fake_io):
    """Testa identificação de atores em eventos"""
    events = [
        {"repo_name": "repo1", "actor": {"login": "alice"}},
        {"repo_name": "repo1", "actor": {"name": "Charlie"}},  # Sem login, deve ser ignorado
        {"repo_name": "repo1", "actor": {"login": "bob"}}
    ]

    def fake_load(path: str):
        if path.endswith("issue_events_all.json"):
            return events
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    
    # Deve ter alice e bob (Charlie não tem login)
    assert len(user_metrics) == 2
    users = {u["user"] for u in user_metrics}
    assert "alice" in users
    assert "bob" in users
    assert "Charlie" not in users


def test_process_collaboration_networks_multiple_repos(monkeypatch, fake_io):
    """Testa colaboração em múltiplos repositórios"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},  # Adiciona colaborador no repo1
        {"repo_name": "repo2", "user": {"login": "alice"}},
        {"repo_name": "repo3", "user": {"login": "alice"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    # Verifica que cross_repository_hubs.json foi gerado
    assert len(files) >= 4
    
    # Alice contribuiu em 3 repositórios
    repo_analysis = fake_io["data/silver/repository_collaboration_analysis.json"]
    repos_with_alice = [r for r in repo_analysis if "alice" in r.get("contributors", [])]
    assert len(repos_with_alice) == 3
    
    # Verifica que alice aparece nas métricas
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    alice_metric = next((u for u in user_metrics if u["user"] == "alice"), None)
    assert alice_metric is not None
    assert alice_metric["repositories_contributed"] == 3

def test_process_collaboration_networks_user_metrics(monkeypatch, fake_io):
    """Testa métricas de colaboração por usuário"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
        {"repo_name": "repo1", "user": {"login": "charlie"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    
    # Cada usuário deve ter 2 colaboradores (os outros 2)
    for user_metric in user_metrics:
        assert user_metric["collaborator_count"] == 2
        assert user_metric["repositories_contributed"] == 1

def test_process_collaboration_networks_repo_analysis(monkeypatch, fake_io):
    """Testa análise de colaboração por repositório"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
        {"repo_name": "repo1", "user": {"login": "charlie"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    repo_analysis = fake_io["data/silver/repository_collaboration_analysis.json"]
    
    assert len(repo_analysis) == 1
    repo = repo_analysis[0]
    assert repo["repo"] == "repo1"
    assert repo["contributor_count"] == 3
    assert repo["potential_collaborations"] == 3  # C(3,2) = 3
    assert repo["actual_collaborations"] == 3
    assert repo["collaboration_density"] == 1.0  # 3/3

def test_process_collaboration_networks_network_stats(monkeypatch, fake_io):
    """Testa estatísticas gerais da rede"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
        {"repo_name": "repo2", "user": {"login": "charlie"}},
        {"repo_name": "repo2", "user": {"login": "dave"}},  # Adiciona colaborador para charlie
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    stats = fake_io["data/silver/network_statistics.json"]
    
    assert stats["total_users"] == 4
    assert stats["total_repositories"] == 2
    assert stats["total_collaborations"] == 2  # alice-bob e charlie-dave
    assert stats["cross_repo_contributors"] == 0  # Ninguém contribuiu em múltiplos repos

def test_process_collaboration_networks_edge_sorting(monkeypatch, fake_io):
    """Testa que arestas são ordenadas alfabeticamente (user1 < user2)"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "zebra"}},
        {"repo_name": "repo1", "user": {"login": "alice"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    edges = fake_io["data/silver/collaboration_edges.json"]
    
    assert len(edges) == 1
    # Deve estar ordenado: alice < zebra
    assert edges[0]["user1"] == "alice"
    assert edges[0]["user2"] == "zebra"

def test_process_collaboration_networks_no_self_collaboration(monkeypatch, fake_io):
    """Testa que não há auto-colaboração (usuário consigo mesmo)"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "alice"}},  # Duplicado
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    edges = fake_io["data/silver/collaboration_edges.json"]
    
    # Não deve ter arestas (alice não colabora consigo mesma)
    assert len(edges) == 0

def test_process_collaboration_networks_cross_repo_sorting(monkeypatch, fake_io):
    """Testa que cross-repo contributors são ordenados por repo_count"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo2", "user": {"login": "alice"}},
        {"repo_name": "repo3", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
        {"repo_name": "repo2", "user": {"login": "bob"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    cross_repo = fake_io["data/silver/cross_repository_hubs.json"]
    
    # Deve estar ordenado: alice (3 repos) antes de bob (2 repos)
    assert cross_repo[0]["user"] == "alice"
    assert cross_repo[0]["repo_count"] == 3
    assert cross_repo[1]["user"] == "bob"
    assert cross_repo[1]["repo_count"] == 2

def test_process_collaboration_networks_user_metrics_sorting(monkeypatch, fake_io):
    """Testa que user_metrics são ordenados por collaborator_count"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
        {"repo_name": "repo1", "user": {"login": "charlie"}},
        {"repo_name": "repo1", "user": {"login": "dave"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    user_metrics = fake_io["data/silver/user_collaboration_metrics.json"]
    
    # Todos devem ter 3 colaboradores, verifica que está ordenado
    for i in range(len(user_metrics) - 1):
        assert user_metrics[i]["collaborator_count"] >= user_metrics[i + 1]["collaborator_count"]

def test_process_collaboration_networks_repo_analysis_sorting(monkeypatch, fake_io):
    """Testa que repo_analysis é ordenado por contributor_count"""
    issues = [
        {"repo_name": "repo1", "user": {"login": "alice"}},
        {"repo_name": "repo1", "user": {"login": "bob"}},
        {"repo_name": "repo1", "user": {"login": "charlie"}},
        {"repo_name": "repo2", "user": {"login": "dave"}},
        {"repo_name": "repo2", "user": {"login": "eve"}},
    ]

    def fake_load(path: str):
        if path.endswith("issues_all.json"):
            return issues
        return []

    def fake_save(data, path, timestamp=True):
        fake_io[path] = data
        return path

    monkeypatch.setattr(collab, "load_json_data", fake_load)
    monkeypatch.setattr(collab, "save_json_data", fake_save)

    files = collab.process_collaboration_networks()
    
    repo_analysis = fake_io["data/silver/repository_collaboration_analysis.json"]
    
    # repo1 (3 contributors) deve vir antes de repo2 (2 contributors)
    assert repo_analysis[0]["repo"] == "repo1"
    assert repo_analysis[0]["contributor_count"] == 3
    assert repo_analysis[1]["repo"] == "repo2"
    assert repo_analysis[1]["contributor_count"] == 2