from utils.github_api import parse_github_date

def test_parse_github_date_utc_z():
    d = parse_github_date("2024-06-10T12:34:56Z")
    assert d.year == 2024 and d.month == 6 and d.day == 10 and d.hour == 12

def test_parse_github_date_without_timezone():
    d = parse_github_date("2024-06-10T12:34:56")
    assert d is not None
    assert d.minute == 34

def test_parse_github_date_offset():
    # Deve aceitar formato com offset e cortar para base
    d = parse_github_date("2024-06-10T12:34:56-03:00")
    assert d is not None
    assert d.second == 56

def test_parse_github_date_invalid():
    d = parse_github_date("not-a-date")
    assert d is None