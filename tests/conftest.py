import sys
from pathlib import Path
import json
import types
import pytest

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

@pytest.fixture
def fake_io(monkeypatch, tmp_path):
    """
    Fixture para mockar load_json_data/save_json_data em módulos que fazem I/O.
    Usa dicionário em memória para armazenar conteúdos.
    """
    storage = {}

    def _fake_load(path: str):
        return storage.get(path)

    def _fake_save(data, path: str, timestamp: bool = True):
        storage[path] = data
        return path
    
    def _fake_scan_directory(directory: str):
        """Mock scan_data_directory to return files from fake_io"""
        return [k for k in storage.keys() if k.startswith(directory)]
    
    def _fake_path_exists(path: str):
        """Mock os.path.exists to check fake_io storage"""
        return path in storage
    
    def _fake_getsize(path: str):
        """Mock os.path.getsize to return fake size"""
        if path in storage:
            data = storage[path]
            return len(json.dumps(data)) if data else 0
        return 0
    
    def _fake_getmtime(path: str):
        """Mock os.path.getmtime to return current timestamp"""
        import time
        return time.time()

    # Patch in utils.github_api module
    monkeypatch.setattr("utils.github_api.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("utils.github_api.save_json_data", _fake_save, raising=False)
    
    # Patch in registry_manager module
    monkeypatch.setattr("registry_manager.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("registry_manager.save_json_data", _fake_save, raising=False)
    
    # Also patch in silver modules (they import directly)
    monkeypatch.setattr("silver.member_analytics.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("silver.member_analytics.save_json_data", _fake_save, raising=False)
    monkeypatch.setattr("silver.contribution_metrics.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("silver.contribution_metrics.save_json_data", _fake_save, raising=False)
    monkeypatch.setattr("silver.collaboration_networks.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("silver.collaboration_networks.save_json_data", _fake_save, raising=False)
    monkeypatch.setattr("silver.temporal_analysis.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("silver.temporal_analysis.save_json_data", _fake_save, raising=False)
    
    # Also patch in gold modules
    monkeypatch.setattr("gold.timeline_aggregation.load_json_data", _fake_load, raising=False)
    monkeypatch.setattr("gold.timeline_aggregation.save_json_data", _fake_save, raising=False)
    
    # Patch registry_manager functions
    monkeypatch.setattr("registry_manager.scan_data_directory", _fake_scan_directory, raising=False)
    
    # Patch os.path functions in registry_manager
    import os
    original_exists = os.path.exists
    original_getsize = os.path.getsize
    original_getmtime = os.path.getmtime
    
    def _conditional_exists(path):
        if path in storage:
            return True
        return original_exists(path)
    
    def _conditional_getsize(path):
        if path in storage:
            return _fake_getsize(path)
        return original_getsize(path)
    
    def _conditional_getmtime(path):
        if path in storage:
            return _fake_getmtime(path)
        return original_getmtime(path)
    
    monkeypatch.setattr("os.path.exists", _conditional_exists)
    monkeypatch.setattr("os.path.getsize", _conditional_getsize)
    monkeypatch.setattr("os.path.getmtime", _conditional_getmtime)
    
    return storage