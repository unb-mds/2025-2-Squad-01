"""
Additional tests for github_api.py to improve coverage
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from datetime import datetime, timezone
from utils.github_api import (
    GitHubAPIClient, 
    save_json_data, 
    load_json_data, 
    update_data_registry,
    OrganizationConfig,
    parse_github_date
)
import os
import json
import tempfile
import shutil


class TestFetchRestCommitDetailsParallel:
    """Test parallel REST commit fetching"""
    
    def test_fetch_with_stats(self, monkeypatch):
        """Test fetching commit details with stats"""
        client = GitHubAPIClient("test_token")
        
        commits = [
            {"sha": "abc123"},
            {"sha": "def456"}
        ]
        
        def mock_fetch_with_thread_id(owner, repo, sha, use_cache):
            return {
                "thread_id": 1,
                "headers": {"X-RateLimit-Remaining": "5000"},
                "data": {
                    "sha": sha,
                    "stats": {"additions": 10, "deletions": 5},
                    "commit": {"message": "Test", "author": {"date": "2024-01-01"}},
                    "author": {"login": "testuser"}
                }
            }
        
        monkeypatch.setattr(client, "_fetch_with_thread_id", mock_fetch_with_thread_id)
        
        result = client._fetch_rest_commit_details_parallel(commits, "owner", "repo", True, max_workers=2)
        
        assert len(result) == 2
        assert result[0]["additions"] == 10
        assert result[0]["deletions"] == 5


class TestGraphQLCommitHistory:
    """Test graphql_commit_history function"""
    
    def test_multiple_branches(self, monkeypatch):
        """Test extracting from multiple branches"""
        client = GitHubAPIClient("test_token")
        
        call_count = [0]
        def mock_graphql(query, variables, use_cache, timeout):
            call_count[0] += 1
            
            # First call is for default branch
            if call_count[0] == 1:
                return {
                    "data": {
                        "repository": {
                            "defaultBranchRef": {
                                "name": "main",
                                "target": {
                                    "history": {
                                        "nodes": [{
                                            "oid": "default_commit",
                                            "messageHeadline": "Default",
                                            "committedDate": "2024-01-01",
                                            "author": {"user": {"login": "user"}},
                                            "additions": 1,
                                            "deletions": 1
                                        }],
                                        "pageInfo": {"hasNextPage": False}
                                    }
                                }
                            }
                        },
                        "rateLimit": {"remaining": 5000}
                    }
                }
            # Subsequent calls for feature branches
            return {
                "data": {
                    "repository": {
                        "ref": {
                            "target": {
                                "history": {
                                    "nodes": [{
                                        "oid": f"commit{call_count[0]}",
                                        "messageHeadline": "Test",
                                        "committedDate": "2024-01-01",
                                        "author": {"user": {"login": "user"}},
                                        "additions": 1,
                                        "deletions": 1
                                    }],
                                    "pageInfo": {"hasNextPage": False}
                                }
                            }
                        }
                    },
                    "rateLimit": {"remaining": 5000}
                }
            }
        
        monkeypatch.setattr(client, "graphql", mock_graphql)
        
        commits, meta = client.graphql_commit_history(
            "owner", "repo", 50, branches=["feature1", "feature2"]
        )
        
        # Should process default + 2 feature branches = 3 commits
        assert call_count[0] == 3
        assert len(commits) == 3
    
    def test_rest_fallback_on_graphql_failure(self, monkeypatch):
        """Test fallback to REST when GraphQL fails"""
        client = GitHubAPIClient("test_token")
        
        graphql_calls = [0]
        def mock_graphql(query, variables, use_cache, timeout):
            graphql_calls[0] += 1
            return None  # Simulate GraphQL failure
        
        rest_calls = [0]
        def mock_get_with_cache(url, use_cache, silent=False):
            rest_calls[0] += 1
            if "commits" in url and "page=" in url:
                # Return REST commit list
                return [
                    {"sha": f"rest_commit_{rest_calls[0]}"}
                ]
            return []
        
        def mock_fetch_parallel(commits, owner, repo, use_cache, max_workers=5):
            return [{
                "oid": c["sha"],
                "messageHeadline": "REST commit",
                "committedDate": "2024-01-01",
                "author": {"user": {"login": "user"}},
                "additions": 1,
                "deletions": 1
            } for c in commits]
        
        monkeypatch.setattr(client, "graphql", mock_graphql)
        monkeypatch.setattr(client, "get_with_cache", mock_get_with_cache)
        monkeypatch.setattr(client, "_fetch_rest_commit_details_parallel", mock_fetch_parallel)
        
        commits, meta = client.graphql_commit_history("owner", "repo", 50, max_pages=1)
        
        # Should fall back to REST
        assert graphql_calls[0] > 0
        assert rest_calls[0] > 0
        assert len(commits) > 0
    
    def test_time_range_splitting(self, monkeypatch):
        """Test splitting extraction into time chunks"""
        client = GitHubAPIClient("test_token")
        
        graphql_calls = [0]
        def mock_graphql(query, variables, use_cache, timeout):
            graphql_calls[0] += 1
            return {
                "data": {
                    "repository": {
                        "defaultBranchRef": {
                            "name": "main",
                            "target": {
                                "history": {
                                    "nodes": [],
                                    "pageInfo": {"hasNextPage": False}
                                }
                            }
                        }
                    },
                    "rateLimit": {"remaining": 5000}
                }
            }
        
        monkeypatch.setattr(client, "graphql", mock_graphql)
        
        commits, meta = client.graphql_commit_history(
            "owner", "repo", 50,
            since="2024-01-01T00:00:00Z",
            until="2024-12-31T23:59:59Z",
            split_large_extractions=True,
            time_chunks=3
        )
        
        # Should make 3 calls (3 time chunks)
        assert graphql_calls[0] == 3
    
    def test_branch_not_found(self, monkeypatch):
        """Test when branch doesn't exist"""
        client = GitHubAPIClient("test_token")
        
        def mock_graphql(query, variables, use_cache, timeout):
            return {
                "data": {
                    "repository": {}  # No ref data
                },
                "rateLimit": {"remaining": 5000}
            }
        
        monkeypatch.setattr(client, "graphql", mock_graphql)
        
        commits, meta = client.graphql_commit_history(
            "owner", "repo", 50, branches=["nonexistent"]
        )
        
        assert len(commits) == 0


class TestGetPaginated:
    """Test get_paginated function"""
    
    def test_stops_on_partial_page(self, monkeypatch):
        """Test pagination stops when page returns fewer items"""
        client = GitHubAPIClient("test_token")
        
        call_count = [0]
        def mock_get(url, use_cache):
            call_count[0] += 1
            if call_count[0] == 1:
                return [{"id": i} for i in range(50)]
            return [{"id": 51}]  # Less than per_page
        
        monkeypatch.setattr(client, "get_with_cache", mock_get)
        
        result = client.get_paginated("https://api.github.com/test", per_page=50)
        
        assert len(result) == 51
        assert call_count[0] == 2
    
    def test_respects_max_pages(self, monkeypatch):
        """Test max_pages limit"""
        client = GitHubAPIClient("test_token")
        
        call_count = [0]
        def mock_get(url, use_cache):
            call_count[0] += 1
            return [{"id": i} for i in range(50)]
        
        monkeypatch.setattr(client, "get_with_cache", mock_get)
        
        result = client.get_paginated("https://api.github.com/test", per_page=50, max_pages=2)
        
        assert len(result) == 100
        assert call_count[0] == 2
    
    def test_handles_non_list_response(self, monkeypatch):
        """Test stops when response is not a list"""
        client = GitHubAPIClient("test_token")
        
        def mock_get(url, use_cache):
            return {"error": "Not found"}
        
        monkeypatch.setattr(client, "get_with_cache", mock_get)
        
        result = client.get_paginated("https://api.github.com/test")
        
        assert result == []


class TestSaveLoadJsonData:
    """Test save_json_data and load_json_data"""
    
    def test_save_with_metadata_dict(self):
        """Test saving dict with metadata"""
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = os.path.join(tmpdir, "test", "data.json")
            data = {"key": "value"}
            
            save_json_data(data, filepath, timestamp=True)
            
            loaded = load_json_data(filepath)
            assert loaded["key"] == "value"
            assert "_metadata" in loaded
            assert "extracted_at" in loaded["_metadata"]
    
    def test_save_without_metadata(self):
        """Test saving without metadata"""
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = os.path.join(tmpdir, "data.json")
            data = {"key": "value"}
            
            save_json_data(data, filepath, timestamp=False)
            
            loaded = load_json_data(filepath)
            assert loaded == {"key": "value"}
            assert "_metadata" not in loaded


class TestUpdateDataRegistry:
    """Test update_data_registry function"""
    
    def test_creates_new_registry(self):
        """Test creating new registry entry"""
        with tempfile.TemporaryDirectory() as tmpdir:
            # Temporarily change data directory
            original_cwd = os.getcwd()
            try:
                os.chdir(tmpdir)
                os.makedirs("data/bronze", exist_ok=True)
                
                update_data_registry("bronze", "commits", ["file1.json", "file2.json"])
                
                registry = load_json_data("data/bronze/registry.json")
                assert "commits" in registry
                assert registry["commits"]["files"] == ["file1.json", "file2.json"]
                assert registry["commits"]["layer"] == "bronze"
            finally:
                os.chdir(original_cwd)
    
    def test_updates_existing_registry(self):
        """Test updating existing registry"""
        with tempfile.TemporaryDirectory() as tmpdir:
            original_cwd = os.getcwd()
            try:
                os.chdir(tmpdir)
                os.makedirs("data/bronze", exist_ok=True)
                
                # Create initial registry
                update_data_registry("bronze", "commits", ["file1.json"])
                
                # Update it
                update_data_registry("bronze", "commits", ["file1.json", "file2.json"])
                
                registry = load_json_data("data/bronze/registry.json")
                assert len(registry["commits"]["files"]) == 2
            finally:
                os.chdir(original_cwd)


class TestOrganizationConfig:
    """Test OrganizationConfig class"""
    
    def test_should_not_skip_any_repo(self):
        """Test that no repos are skipped by default"""
        config = OrganizationConfig("test-org")
        
        repo = {"name": "test-repo", "private": True}
        assert config.should_skip_repo(repo) is False
        
        repo2 = {"name": "another-repo", "archived": True}
        assert config.should_skip_repo(repo2) is False


class TestParseGithubDate:
    """Test parse_github_date edge cases"""
    
    def test_empty_string(self):
        """Test empty string"""
        result = parse_github_date("")
        assert result is None
    
    def test_none_value(self):
        """Test None value"""
        result = parse_github_date(None)
        assert result is None
    
    def test_negative_timezone_offset(self):
        """Test negative timezone offset"""
        result = parse_github_date("2024-01-15T10:30:45-03:00")
        assert result is not None
        assert result.year == 2024
        assert result.month == 1
        assert result.day == 15
    
    def test_positive_timezone_offset(self):
        """Test positive timezone offset"""
        result = parse_github_date("2024-06-20T14:25:30+05:30")
        assert result is not None
        assert result.year == 2024
        assert result.month == 6
    
    def test_invalid_format(self):
        """Test invalid format returns None"""
        result = parse_github_date("not-a-date")
        assert result is None
    
    def test_partial_datetime(self):
        """Test datetime with malformed timezone"""
        result = parse_github_date("2024-01-15T10:30:45-")
        # Should try to extract base datetime
        assert result is None or result.year == 2024
