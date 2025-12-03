from utils.github_api import GitHubAPIClient

def test_split_time_range_no_dates():
    client = GitHubAPIClient(token="x")
    ranges = client._split_time_range(None, None, chunks=3)
    assert ranges == [(None, None)]

def test_split_time_range_single_year():
    client = GitHubAPIClient(token="x")
    since = "2024-01-01T00:00:00Z"
    until = "2025-01-01T00:00:00Z"
    ranges = client._split_time_range(since, until, chunks=3)
    assert len(ranges) == 3
    # Garantir ordem cronológica
    assert ranges[0][0] == since
    assert ranges[-1][1] == until

def test_split_time_range_invalid_format():
    client = GitHubAPIClient(token="x")
    ranges = client._split_time_range("invalid", "also-invalid", chunks=2)
    # Retorna (None, None) para indicar datas inválidas
    assert ranges == [(None, None)]