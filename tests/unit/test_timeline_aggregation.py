import gold.timeline_aggregation as timeline
from datetime import datetime, timedelta

def test_process_timeline_aggregation(monkeypatch):
    # daily_activity_summary com 10 dias
    base = datetime(2024, 1, 10)
    daily = []
    for i in range(10):
        d = base - timedelta(days=i)
        daily.append({
            "date": d.date().isoformat(),
            "total_events": 5 + i,
            "issues_created": 1,
            "issues_closed": 0,
            "prs_created": 1,
            "prs_closed": 0,
            "commits": 2,
            "comments": 1,
            "unique_users": 2,
            "unique_repos": 1,
            "authors": [{"name": "alice", "commits": 2, "issues_created": 1, "issues_closed": 0,
                         "prs_created": 1, "prs_closed": 0, "comments": 1}]
        })

    events = [
        {"user": "alice", "repo": "repoA"},
        {"user": "alice", "repo": "repoB"},
        {"user": "bob", "repo": "repoA"},
    ]

    def fake_load(path: str):
        if path.endswith("daily_activity_summary.json"):
            return daily
        if path.endswith("temporal_events.json"):
            return events
        return []

    saved = {}
    def fake_save(data, path, timestamp=True):
        saved[path] = data
        return path

    monkeypatch.setattr(timeline, "load_json_data", fake_load)
    monkeypatch.setattr(timeline, "save_json_data", fake_save)

    files = timeline.process_timeline_aggregation()
    assert any(f.endswith("timeline_last_7_days.json") for f in files)
    last7 = saved["data/gold/timeline_last_7_days.json"]
    # Deve ter 7 entradas
    assert len(last7) == 7
    # Autora 'alice' deve ter lista de repos agregada
    assert "repositories" in last7[0]["authors"][0]
    assert set(last7[0]["authors"][0]["repositories"]) == {"repoA", "repoB"}