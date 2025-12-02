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

    monkeypatch.setattr("utils.github_api.load_json_data", _fake_load, raising=True)
    monkeypatch.setattr("utils.github_api.save_json_data", _fake_save, raising=True)
    return storage