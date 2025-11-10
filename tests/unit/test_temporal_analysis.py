import datetime
from silver.temporal_analysis import parse_github_date

def test_parse_github_date_valid():
    d = parse_github_date('2023-01-01T12:34:56Z')
    assert isinstance(d, datetime.datetime)
    assert d.year == 2023
    assert d.hour == 12
    assert d.minute == 34

def test_parse_github_date_invalid_and_empty():
    assert parse_github_date('') is None
    assert parse_github_date('not-a-date') is None