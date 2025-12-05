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