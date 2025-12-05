import pytest
import json
import os
from datetime import datetime
from unittest.mock import Mock, patch
from utils.github_api import save_json_data, load_json_data, parse_github_date

def test_save_json_data_with_timestamp(tmp_path):
    """Testa save_json_data com timestamp"""
    filepath = str(tmp_path / "test.json")
    data = {"test": "value"}
    
    result = save_json_data(data, filepath, timestamp=True)
    
    assert result == filepath
    assert os.path.exists(filepath)
    
    # Verifica conteúdo
    with open(filepath, 'r') as f:
        saved = json.load(f)
    
    assert saved["test"] == "value"
    assert "_metadata" in saved
    assert "extracted_at" in saved["_metadata"]

def test_save_json_data_list_with_timestamp(tmp_path):
    """Testa save_json_data com lista"""
    filepath = str(tmp_path / "test.json")
    data = [{"id": 1}, {"id": 2}]
    
    save_json_data(data, filepath, timestamp=True)
    
    with open(filepath, 'r') as f:
        saved = json.load(f)
    
    assert isinstance(saved, list)
    assert "_metadata" in saved[0]
    assert saved[0]["_metadata"]["record_count"] == 2
    assert saved[1]["id"] == 1
    assert saved[2]["id"] == 2

def test_save_json_data_without_timestamp(tmp_path):
    """Testa save_json_data sem timestamp"""
    filepath = str(tmp_path / "test.json")
    data = {"test": "value"}
    
    save_json_data(data, filepath, timestamp=False)
    
    with open(filepath, 'r') as f:
        saved = json.load(f)
    
    assert saved == data
    assert "_metadata" not in saved

def test_load_json_data_existing_file(tmp_path):
    """Testa load_json_data com arquivo existente"""
    filepath = str(tmp_path / "test.json")
    data = {"test": "value"}
    
    with open(filepath, 'w') as f:
        json.dump(data, f)
    
    loaded = load_json_data(filepath)
    assert loaded == data

def test_load_json_data_missing_file():
    """Testa load_json_data com arquivo inexistente"""
    loaded = load_json_data("nonexistent.json")
    assert loaded is None

def test_parse_github_date_utc():
    """Testa parse_github_date formato UTC"""
    date_str = "2024-06-10T12:34:56Z"
    result = parse_github_date(date_str)
    
    assert result is not None
    assert result.year == 2024
    assert result.month == 6
    assert result.day == 10
    assert result.hour == 12

def test_parse_github_date_without_timezone():
    """Testa parse_github_date sem timezone"""
    date_str = "2024-06-10T12:34:56"
    result = parse_github_date(date_str)
    
    assert result is not None
    assert result.year == 2024

def test_parse_github_date_with_offset():
    """Testa parse_github_date com offset de timezone"""
    date_str = "2024-06-10T12:34:56-03:00"
    result = parse_github_date(date_str)
    
    assert result is not None
    assert result.year == 2024
    assert result.month == 6

def test_parse_github_date_invalid():
    """Testa parse_github_date com formato inválido"""
    result = parse_github_date("invalid-date")
    assert result is None

def test_parse_github_date_none():
    """Testa parse_github_date com None"""
    result = parse_github_date(None)
    assert result is None

def test_parse_github_date_empty():
    """Testa parse_github_date com string vazia"""
    result = parse_github_date("")
    assert result is None