import datetime
import math
from silver.member_analytics import calculate_maturity_score, classify_member_status

def test_calculate_maturity_score_missing_fields():
    member = {}
    score = calculate_maturity_score(member)
    assert isinstance(score, float)
    assert score >= 0

def test_calculate_maturity_score_invalid_date():
    member = {'created_at': 'data_errada', 'public_repos': 0, 'followers': 0}
    score = calculate_maturity_score(member)
    assert score >= 0  # não deve quebrar

def test_classify_member_status_boundary_365_days():
    # Exatamente 365 dias atrás → deve ser 'established' apenas se critérios de repos/followers forem suficientes
    created_at = (datetime.datetime.now() - datetime.timedelta(days=365)).strftime('%Y-%m-%dT%H:%M:%SZ')
    member = {'created_at': created_at, 'public_repos': 0, 'followers': 0}
    # Critério: se poucos repos/followers e limiar de idade, ainda 'new'? Pela lógica: se idade < 365 OU (repos<10 e followers<10) => 'new'
    # Aqui idade == 365, então depende de repos/followers <10 → será 'new'
    assert classify_member_status(member) == 'new'

    member2 = {'created_at': created_at, 'public_repos': 15, 'followers': 20}
    assert classify_member_status(member2) == 'established'

def test_calculate_maturity_score_growth():
    base = calculate_maturity_score({'public_repos': 1, 'followers': 1, 'created_at': None})
    higher = calculate_maturity_score({'public_repos': 10, 'followers': 50, 'created_at': None})
    assert higher > base