"""
Tests for error handling paths in github_api.py
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from utils.github_api import GitHubAPIClient


class TestGetWithCacheErrorPaths:
    """Test error handling in get_with_cache"""
    
    def test_request_exception_handling(self, monkeypatch):
        """Test generic request exception"""
        client = GitHubAPIClient("test_token")
        
        def mock_get(*args, **kwargs):
            raise requests.exceptions.RequestException("Network error")
        
        monkeypatch.setattr(requests, "get", mock_get)
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False)
        assert result is None
    
    def test_403_non_rate_limit_error(self, monkeypatch):
        """Test 403 error that is not rate limit"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 403
        mock_response.text = "Access forbidden - private repository"
        
        def mock_get(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "get", mock_get)
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False, silent=True)
        assert result is None
    
    def test_500_series_errors_exhaust_retries(self, monkeypatch):
        """Test that 500 errors exhaust retries"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 502
        mock_response.text = "Bad Gateway"
        
        call_count = [0]
        def mock_get(*args, **kwargs):
            call_count[0] += 1
            return mock_response
        
        monkeypatch.setattr(requests, "get", mock_get)
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False, retries=2, backoff_base=0.01)
        assert result is None
        assert call_count[0] == 2
    
    def test_unknown_status_code(self, monkeypatch):
        """Test handling of unexpected status codes"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 418  # I'm a teapot
        mock_response.text = "Unexpected error"
        
        def mock_get(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "get", mock_get)
        
        result = client.get_with_cache("https://api.github.com/test", use_cache=False, silent=True)
        assert result is None


class TestGraphQLErrorPaths:
    """Test error handling in graphql method"""
    
    def test_graphql_cache_serialization_failure(self, monkeypatch):
        """Test cache key generation when serialization fails"""
        client = GitHubAPIClient("test_token")
        
        # Create variables that can't be serialized
        variables = {"data": object()}
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": {"test": "value"}}
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        # Should handle serialization error gracefully
        result = client.graphql("query { test }", variables=variables, use_cache=True)
        assert result == {"data": {"test": "value"}}
    
    def test_graphql_service_unavailable_non_stats(self, monkeypatch):
        """Test SERVICE_UNAVAILABLE error for non-stats fields"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "errors": [
                {
                    "type": "SERVICE_UNAVAILABLE",
                    "path": ["repository", "name"],
                    "message": "Service temporarily unavailable"
                }
            ]
        }
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None
    
    def test_graphql_other_errors(self, monkeypatch):
        """Test non-SERVICE_UNAVAILABLE errors"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "errors": [
                {
                    "type": "FORBIDDEN",
                    "message": "Resource not accessible"
                }
            ]
        }
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None
    
    def test_graphql_502_error(self, monkeypatch):
        """Test 502 Bad Gateway"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 502
        mock_response.text = "Bad Gateway"
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None
    
    def test_graphql_500_error(self, monkeypatch):
        """Test 500 Internal Server Error"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None
    
    def test_graphql_503_error(self, monkeypatch):
        """Test 503 Service Unavailable"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 503
        mock_response.text = "Service Unavailable"
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None
    
    def test_graphql_unknown_status(self, monkeypatch):
        """Test unknown status code"""
        client = GitHubAPIClient("test_token")
        
        mock_response = Mock()
        mock_response.status_code = 418
        mock_response.text = "I'm a teapot"
        
        def mock_post(*args, **kwargs):
            return mock_response
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None
    
    def test_graphql_request_exception(self, monkeypatch):
        """Test request exception"""
        client = GitHubAPIClient("test_token")
        
        def mock_post(*args, **kwargs):
            raise requests.exceptions.RequestException("Connection error")
        
        monkeypatch.setattr(requests, "post", mock_post)
        
        result = client.graphql("query { test }")
        assert result is None


class TestSplitTimeRangeEdgeCases:
    """Test edge cases in _split_time_range"""
    
    def test_invalid_date_format(self):
        """Test invalid date format handling"""
        client = GitHubAPIClient("test_token")
        
        # Should return single range on error
        result = client._split_time_range("invalid-date", "2024-01-01")
        assert result == [(None, None)]
    
    def test_until_without_since(self):
        """Test until date without since"""
        client = GitHubAPIClient("test_token")
        
        result = client._split_time_range(None, "2024-12-31T23:59:59Z", chunks=2)
        
        # Should create ranges
        assert len(result) > 0
        assert all(isinstance(r, tuple) for r in result)
