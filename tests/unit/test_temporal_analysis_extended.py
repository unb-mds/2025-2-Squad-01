import datetime
import silver.temporal_analysis as ta

def test_process_temporal_analysis_basic_flow(monkeypatch):
    base_time = datetime.datetime(2024, 1, 1, 10, 0, 0)
    # Simula vários tipos de eventos
    issues = [{
        'repo_name': 'repoA',
        'user': {'login': 'alice'},
        'created_at': base_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'updated_at': (base_time + datetime.timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'state': 'closed',
        'number': 1,
        'closed_at': (base_time + datetime.timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%SZ')
    }]
    prs = [{
        'repo_name': 'repoA',
        'user': {'login': 'bob'},
        'created_at': (base_time + datetime.timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'updated_at': (base_time + datetime.timedelta(hours=3)).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'state': 'closed',
        'number': 5,
        'closed_at': (base_time + datetime.timedelta(hours=3)).strftime('%Y-%m-%dT%H:%M:%SZ')
    }]
    commits = [{
        'repo_name': 'repoA',
        'author': {'login': 'carol'},
        'commit': {'author': {'date': (base_time + datetime.timedelta(hours=4)).strftime('%Y-%m-%dT%H:%M:%SZ')}},
        'additions': 10,
        'deletions': 2,
        'total_changes': 12
    }]
    events = [{
        'repo_name': 'repoA',
        'actor': {'login': 'dave'},
        'event': 'commented',
        'created_at': (base_time + datetime.timedelta(hours=5)).strftime('%Y-%m-%dT%H:%M:%SZ')
    }]

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

    monkeypatch.setattr(ta, 'load_json_data', fake_load)
    monkeypatch.setattr(ta, 'save_json_data', fake_save)

    generated = ta.process_temporal_analysis()

    # Verifica arquivos principais
    assert "data/silver/temporal_events.json" in generated
    assert "data/silver/daily_activity_summary.json" in generated
    assert "data/silver/activity_heatmap.json" in generated
    # Ciclo de tempo (issue/pr fechados) deve gerar cycle_times.json
    assert any("cycle_times.json" in f for f in generated)

    events_saved = saved["data/silver/temporal_events.json"]
    assert len(events_saved) == 5  # issue_created, issue_closed, pr_created, pr_closed, commit, commented (event_)
    daily = saved["data/silver/daily_activity_summary.json"]
    assert daily[0]['total_events'] >= 5

def test_process_temporal_analysis_empty(monkeypatch):
    def fake_load(_):
        return []  # tudo vazio

    saved = {}
    def fake_save(data, path):
        saved[path] = data
        return path

    monkeypatch.setattr(ta, 'load_json_data', fake_load)
    monkeypatch.setattr(ta, 'save_json_data', fake_save)

    generated = ta.process_temporal_analysis()
    # Deve gerar pelo menos events, daily e heatmap (mesmo vazios)
    assert "data/silver/temporal_events.json" in generated
    assert "data/silver/daily_activity_summary.json" in generated
    assert "data/silver/activity_heatmap.json" in generated
    # Não deve gerar cycle_times ou temporal_statistics porque não há eventos
    assert not any("cycle_times.json" in f for f in generated)
    events_saved = saved["data/silver/temporal_events.json"]
    assert events_saved == [] or len(events_saved) == 0