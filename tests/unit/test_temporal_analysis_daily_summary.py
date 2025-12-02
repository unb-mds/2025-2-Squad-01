from datetime import datetime
from typing import Any, Dict, List

import json
import types

import silver.temporal_analysis as temporal

def _iso(s: str) -> datetime:
    # parse_github_date equivalente simples para ISO-8601 com 'Z'
    # ex: "2024-01-02T10:00:00Z" -> datetime
    if s is None:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00"))

def test_temporal_analysis_commit_user_identification(monkeypatch):
    """
    Testa a lógica de identificação do 'user' para eventos de commit:
    - Prioriza commit.commit.author.login
    - Depois commit.author.login (nível raiz)
    - Por último commit.commit.author.name
    """

    # 1) Prepara dados controlados para load_json_data
    issues_data: List[Dict[str, Any]] = []
    prs_data: List[Dict[str, Any]] = []
    commits_data: List[Dict[str, Any]] = [
        {
            "repo_name": "repoA",
            "commit": {
                "author": {
                    "date": "2024-01-02T10:00:00Z",
                    "login": "alice",  # prioridade 1
                    "name": "Alice Name",
                }
            },
        },
        {
            "repo_name": "repoB",
            "author": {"login": "bob"},  # prioridade 2 (nível raiz)
            "commit": {
                "author": {
                    "date": "2024-01-02T11:00:00Z",
                    "name": "Bob Name",
                }
            },
        },
        {
            "repo_name": "repoC",
            "commit": {
                "author": {
                    "date": "2024-01-02T12:00:00Z",
                    "name": "NoLoginName",  # prioridade 3
                }
            },
        },
    ]
    issue_events_data: List[Dict[str, Any]] = []

    def fake_load_json_data(path: str):
        if path.endswith("issues_all.json"):
            return issues_data
        if path.endswith("prs_all.json"):
            return prs_data
        if path.endswith("commits_all.json"):
            return commits_data
        if path.endswith("issue_events_all.json"):
            return issue_events_data
        return []

    # 2) Captura saídas do save_json_data (sem gravar no disco)
    saved = {}
    def fake_save_json_data(data, path, timestamp=True):
        saved[path] = data
        return path

    # 3) Monkeypatch nas funções usadas dentro do módulo
    monkeypatch.setattr(temporal, "load_json_data", fake_load_json_data)
    monkeypatch.setattr(temporal, "save_json_data", fake_save_json_data)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)

    # 4) Executa
    files = temporal.process_temporal_analysis()
    assert isinstance(files, list)
    # Deve ter gerado pelo menos o temporal_events.json
    assert any(f.endswith("data/silver/temporal_events.json") for f in files)

    # 5) Verifica os eventos de commit gerados
    events = saved.get("data/silver/temporal_events.json")
    assert isinstance(events, list)
    commit_events = [e for e in events if e["type"] == "commit"]
    users = {e["user"] for e in commit_events}

    assert "alice" in users            # veio de commit.commit.author.login
    assert "bob" in users              # veio de commit.author.login
    assert "NoLoginName" in users      # fallback pra commit.commit.author.name

def test_temporal_analysis_empty_data(monkeypatch):
    """Testa processamento com dados vazios"""
    def fake_load(path):
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    # Deve retornar 3 arquivos: temporal_events.json, daily_activity_summary.json e activity_heatmap.json
    assert len(files) == 3
    assert saved["data/silver/temporal_events.json"] == []
    assert saved["data/silver/daily_activity_summary.json"] == []
    
    # activity_heatmap deve ter 168 entradas (7 dias * 24 horas) todas com count 0
    heatmap = saved["data/silver/activity_heatmap.json"]
    assert len(heatmap) == 168
    assert all(h["activity_count"] == 0 for h in heatmap)

def test_temporal_analysis_issues_processing(monkeypatch):
    """Testa processamento de issues (criação e fechamento)"""
    issues_data = [
        {
            "repo_name": "repo1",
            "number": 1,
            "state": "open",
            "created_at": "2024-01-01T10:00:00Z",
            "user": {"login": "alice", "name": "Alice"}
        },
        {
            "repo_name": "repo1",
            "number": 2,
            "state": "closed",
            "created_at": "2024-01-02T10:00:00Z",
            "updated_at": "2024-01-03T10:00:00Z",
            "closed_at": "2024-01-03T10:00:00Z",
            "user": {"login": "bob", "name": "Bob"}
        },
    ]
    
    def fake_load(path):
        if path.endswith("issues_all.json"):
            return issues_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    events = saved["data/silver/temporal_events.json"]
    
    # Deve ter 3 eventos: 2 issue_created + 1 issue_closed
    assert len(events) == 3
    assert sum(1 for e in events if e["type"] == "issue_created") == 2
    assert sum(1 for e in events if e["type"] == "issue_closed") == 1
    assert events[2]["user"] == "bob"
    assert events[2]["type"] == "issue_closed"

def test_temporal_analysis_prs_processing(monkeypatch):
    """Testa processamento de pull requests"""
    prs_data = [
        {
            "repo_name": "repo2",
            "number": 10,
            "state": "open",
            "created_at": "2024-02-01T10:00:00Z",
            "user": {"login": "charlie"}
        },
        {
            "repo_name": "repo2",
            "number": 11,
            "state": "closed",
            "created_at": "2024-02-02T10:00:00Z",
            "updated_at": "2024-02-03T10:00:00Z",
            "user": {"login": "dave"}
        },
    ]
    
    def fake_load(path):
        if path.endswith("prs_all.json"):
            return prs_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    events = saved["data/silver/temporal_events.json"]
    
    # Deve ter 3 eventos: 2 pr_created + 1 pr_closed
    assert len(events) == 3
    assert sum(1 for e in events if e["type"] == "pr_created") == 2
    assert sum(1 for e in events if e["type"] == "pr_closed") == 1

def test_temporal_analysis_issue_events_processing(monkeypatch):
    """Testa processamento de eventos de issues"""
    issue_events_data = [
        {
            "repo_name": "repo3",
            "event": "commented",
            "created_at": "2024-03-01T10:00:00Z",
            "actor": {"login": "eve"}
        },
        {
            "repo_name": "repo3",
            "event": "labeled",
            "created_at": "2024-03-02T10:00:00Z",
            "actor": {"name": "Frank"}
        },
    ]
    
    def fake_load(path):
        if path.endswith("issue_events_all.json"):
            return issue_events_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    events = saved["data/silver/temporal_events.json"]
    
    assert len(events) == 2
    assert events[0]["type"] == "event_commented"
    assert events[0]["user"] == "eve"
    assert events[1]["type"] == "event_labeled"
    assert events[1]["user"] == "Frank"

def test_temporal_analysis_daily_activity_summary(monkeypatch):
    """Testa geração do resumo de atividade diária"""
    commits_data = [
        {
            "repo_name": "repo1",
            "commit": {
                "author": {
                    "date": "2024-01-01T10:00:00Z",
                    "login": "alice"
                }
            },
            "additions": 10,
            "deletions": 5,
            "total_changes": 15
        },
        {
            "repo_name": "repo2",
            "commit": {
                "author": {
                    "date": "2024-01-01T14:00:00Z",
                    "login": "bob"
                }
            },
        },
    ]
    
    def fake_load(path):
        if path.endswith("commits_all.json"):
            return commits_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    daily = saved["data/silver/daily_activity_summary.json"]
    
    assert len(daily) == 1
    assert daily[0]["date"] == "2024-01-01"
    assert daily[0]["total_events"] == 2
    assert daily[0]["commits"] == 2
    assert daily[0]["unique_users"] == 2
    assert daily[0]["unique_repos"] == 2
    
    # Verifica os authors
    assert len(daily[0]["authors"]) == 2
    alice_stats = next(a for a in daily[0]["authors"] if a["name"] == "alice")
    assert alice_stats["commits"] == 1

def test_temporal_analysis_activity_heatmap(monkeypatch):
    """Testa geração do heatmap de atividade"""
    commits_data = [
        {
            "repo_name": "repo1",
            "commit": {
                "author": {
                    "date": "2024-01-01T10:00:00Z",  # Monday 10:00
                    "login": "alice"
                }
            },
        },
        {
            "repo_name": "repo1",
            "commit": {
                "author": {
                    "date": "2024-01-01T10:30:00Z",  # Monday 10:30 (same hour)
                    "login": "bob"
                }
            },
        },
    ]
    
    def fake_load(path):
        if path.endswith("commits_all.json"):
            return commits_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    heatmap = saved["data/silver/activity_heatmap.json"]
    
    # Deve ter 7 dias * 24 horas = 168 entradas
    assert len(heatmap) == 168
    
    # Segunda-feira (0), hora 10 deve ter 2 atividades
    monday_10 = next(h for h in heatmap if h["day_of_week"] == 0 and h["hour"] == 10)
    assert monday_10["activity_count"] == 2

def test_temporal_analysis_cycle_times(monkeypatch):
    """Testa cálculo de cycle times"""
    issues_data = [
        {
            "repo_name": "repo1",
            "number": 1,
            "state": "closed",
            "created_at": "2024-01-01T00:00:00Z",
            "closed_at": "2024-01-03T00:00:00Z",  # 2 dias
        },
    ]
    
    prs_data = [
        {
            "repo_name": "repo2",
            "number": 10,
            "state": "closed",
            "created_at": "2024-01-01T00:00:00Z",
            "closed_at": "2024-01-06T00:00:00Z",  # 5 dias
        },
    ]
    
    def fake_load(path):
        if path.endswith("issues_all.json"):
            return issues_data
        if path.endswith("prs_all.json"):
            return prs_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    # Verifica que cycle_times.json foi gerado
    assert any("cycle_times.json" in f for f in files)
    
    cycle_times = saved["data/silver/cycle_times.json"]
    assert len(cycle_times) == 2
    
    issue_ct = next(ct for ct in cycle_times if ct["type"] == "issue")
    assert issue_ct["cycle_time_days"] == 2.0
    
    pr_ct = next(ct for ct in cycle_times if ct["type"] == "pr")
    assert pr_ct["cycle_time_days"] == 5.0

def test_temporal_analysis_temporal_statistics(monkeypatch):
    """Testa geração de estatísticas temporais"""
    issues_data = [
        {
            "repo_name": "repo1",
            "number": 1,
            "state": "closed",
            "created_at": "2024-01-01T00:00:00Z",
            "closed_at": "2024-01-05T00:00:00Z",
            "user": {"login": "alice"}
        },
    ]
    
    commits_data = [
        {
            "repo_name": "repo1",
            "commit": {
                "author": {
                    "date": "2024-01-02T10:00:00Z",
                    "login": "bob"
                }
            },
        },
        {
            "repo_name": "repo1",
            "commit": {
                "author": {
                    "date": "2024-01-03T12:00:00Z",
                    "login": "alice"
                }
            },
        },
    ]
    
    def fake_load(path):
        if path.endswith("issues_all.json"):
            return issues_data
        if path.endswith("commits_all.json"):
            return commits_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    # Verifica que temporal_statistics.json foi gerado
    assert any("temporal_statistics.json" in f for f in files)
    
    stats = saved["data/silver/temporal_statistics.json"]
    
     # O código gera: 1 issue_created + 2 commits = 3 eventos
    # issue_closed não é gerado como evento separado quando closed_at existe
    assert stats["total_events"] == 3
    assert "date_range" in stats
    assert "events_by_type" in stats
    assert "cycle_time_stats" in stats
    assert stats["cycle_time_stats"]["count"] == 1
    assert stats["cycle_time_stats"]["avg_days"] == 4.0
    
    # Verifica que temos os tipos de eventos corretos
    events_by_type = stats["events_by_type"]
    assert "issue_created" in events_by_type
    assert "commit" in events_by_type
    assert events_by_type["issue_created"] == 1
    assert events_by_type["commit"] == 2

def test_temporal_analysis_metadata_removal(monkeypatch):
    """Testa remoção de metadata dos dados"""
    issues_data = [
        {"_metadata": {"timestamp": "2024-01-01"}},  # Deve ser removido
        {
            "repo_name": "repo1",
            "number": 1,
            "state": "open",
            "created_at": "2024-01-01T10:00:00Z",
            "user": {"login": "alice"}
        },
    ]
    
    def fake_load(path):
        if path.endswith("issues_all.json"):
            return issues_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    events = saved["data/silver/temporal_events.json"]
    
    # Deve ter apenas 1 evento (metadata ignorada)
    assert len(events) == 1
    assert events[0]["type"] == "issue_created"

def test_temporal_analysis_user_fallback_to_name(monkeypatch):
    """Testa fallback para 'name' quando 'login' não existe"""
    issues_data = [
        {
            "repo_name": "repo1",
            "number": 1,
            "state": "open",
            "created_at": "2024-01-01T10:00:00Z",
            "user": {"name": "Alice Name"}  # Sem login
        },
    ]
    
    def fake_load(path):
        if path.endswith("issues_all.json"):
            return issues_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    events = saved["data/silver/temporal_events.json"]
    
    assert len(events) == 1
    assert events[0]["user"] == "Alice Name"

def test_temporal_analysis_commit_with_additions_deletions(monkeypatch):
    """Testa que commits incluem additions, deletions e total_changes"""
    commits_data = [
        {
            "repo_name": "repo1",
            "commit": {
                "author": {
                    "date": "2024-01-01T10:00:00Z",
                    "login": "alice"
                }
            },
            "additions": 100,
            "deletions": 50,
            "total_changes": 150
        },
    ]
    
    def fake_load(path):
        if path.endswith("commits_all.json"):
            return commits_data
        return []
    
    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path
    
    monkeypatch.setattr(temporal, "load_json_data", fake_load)
    monkeypatch.setattr(temporal, "save_json_data", fake_save)
    monkeypatch.setattr(temporal, "parse_github_date", _iso)
    
    files = temporal.process_temporal_analysis()
    
    events = saved["data/silver/temporal_events.json"]
    
    assert len(events) == 1
    assert events[0]["additions"] == 100
    assert events[0]["deletions"] == 50
    assert events[0]["total_changes"] == 150