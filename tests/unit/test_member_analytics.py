import datetime
from silver.member_analytics import calculate_maturity_score, classify_member_status

def test_calculate_maturity_score_basic():
    member = {
        'created_at': '2000-01-01T00:00:00Z',
        'public_repos': 10,
        'followers': 5
    }
    score = calculate_maturity_score(member)
    assert isinstance(score, float)
    assert score > 0

def test_classify_member_status_new_and_established():
    new_member = {
        'created_at': (datetime.datetime.now() - datetime.timedelta(days=100)).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'public_repos': 1,
        'followers': 0
    }
    assert classify_member_status(new_member) == 'new'

    est_member = {
        'created_at': (datetime.datetime.now() - datetime.timedelta(days=400)).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'public_repos': 20,
        'followers': 20
    }
    assert classify_member_status(est_member) == 'established'