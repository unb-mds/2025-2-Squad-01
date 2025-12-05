import math
from freezegun import freeze_time

from silver.member_analytics import calculate_maturity_score, classify_member_status, process_member_analytics

@freeze_time("2025-01-01")
def test_calculate_maturity_score_basics():
    # Caso base: sem campos -> score baixo (somente logs com 0)
    m0 = {}
    s0 = calculate_maturity_score(m0)
    assert isinstance(s0, float)
    assert s0 >= 0

    # Conta com 2 anos, 5 repositórios, 3 seguidores
    m1 = {
        "created_at": "2023-01-01T00:00:00Z",
        "public_repos": 5,
        "followers": 3,
    }
    s1 = calculate_maturity_score(m1)
    assert s1 > s0  # deve aumentar com idade/repos/seguidores

    # Mais repositórios e seguidores => score maior
    m2 = {
        "created_at": "2020-01-01T00:00:00Z",
        "public_repos": 50,
        "followers": 30,
    }
    s2 = calculate_maturity_score(m2)
    assert s2 > s1

@freeze_time("2025-01-01")
def test_calculate_maturity_score_expected_components():
    # Valida aproximação numérica do score com pesos definidos no código
    # age_component = 0.5 * log1p(account_age_days)
    # repos_component = 3 * log1p(public_repos)
    # followers_component = 20 * log1p(followers)
    m = {
        "created_at": "2024-01-01T00:00:00Z",  # ~365 dias
        "public_repos": 10,
        "followers": 10,
    }
    score = calculate_maturity_score(m)

    # Aproxima a idade como 366 dias por ano bissexto/contagem
    age_days = 366  # tolerância de arredondamento para o teste
    expected = 0.5 * math.log1p(age_days) + 3 * math.log1p(10) + 20 * math.log1p(10)

    # Como há arredondamentos e diferenças de dias, usamos tolerância
    assert abs(score - expected) < 2.0  # tolerância generosa

@freeze_time("2025-01-01")
def test_calculate_maturity_score_no_created_at():
    """Testa score quando created_at está ausente"""
    m = {
        "public_repos": 10,
        "followers": 5,
    }
    score = calculate_maturity_score(m)
    # age_component será 0, apenas repos e followers contam
    expected = 3 * math.log1p(10) + 20 * math.log1p(5)
    assert abs(score - expected) < 0.1

@freeze_time("2025-01-01")
def test_calculate_maturity_score_invalid_date():
    """Testa score quando created_at tem formato inválido"""
    m = {
        "created_at": "invalid-date",
        "public_repos": 10,
        "followers": 5,
    }
    score = calculate_maturity_score(m)
    # Deve tratar como age_days = 0
    expected = 3 * math.log1p(10) + 20 * math.log1p(5)
    assert abs(score - expected) < 0.1

def test_classify_member_status_new_by_age():
    # Conta recém-criada => 'new'
    m = {
        "created_at": "2025-11-15T00:00:00Z",
        "public_repos": 100,
        "followers": 100,
    }
    assert classify_member_status(m) == "new"

def test_classify_member_status_new_by_activity():
    # Conta antiga porém com pouca atividade => 'new'
    m = {
        "created_at": "2018-01-01T00:00:00Z",
        "public_repos": 2,
        "followers": 1,
    }
    assert classify_member_status(m) == "new"

def test_classify_member_status_established():
    # Conta não tão recente e com atividade razoável => 'established'
    m = {
        "created_at": "2020-01-01T00:00:00Z",
        "public_repos": 20,
        "followers": 15,
    }
    assert classify_member_status(m) == "established"

@freeze_time("2025-01-01")
def test_classify_member_status_no_created_at():
    """Testa classificação quando created_at está ausente"""
    m = {
        "public_repos": 50,
        "followers": 50,
    }
    # Sem created_at, age_days = 0 < 365 => 'new'
    assert classify_member_status(m) == "new"

@freeze_time("2025-01-01")
def test_classify_member_status_invalid_date():
    """Testa classificação quando created_at tem formato inválido"""
    m = {
        "created_at": "invalid-date",
        "public_repos": 50,
        "followers": 50,
    }
    # Data inválida tratada como age_days = 0 => 'new'
    assert classify_member_status(m) == "new"

@freeze_time("2025-01-01")
def test_process_member_analytics_empty_data(monkeypatch):
    """Testa processamento com dados vazios"""
    def fake_load(path):
        return None
    
    monkeypatch.setattr("silver.member_analytics.load_json_data", fake_load)
    
    result = process_member_analytics()
    assert result == []

@freeze_time("2025-01-01")
def test_process_member_analytics_with_members(monkeypatch):
    """Testa processamento completo com membros"""
    fake_members = [
        {
            "login": "alice",
            "id": 1,
            "name": "Alice",
            "company": "CompanyA",
            "location": "USA",
            "email": "alice@example.com",
            "bio": "Developer",
            "public_repos": 10,
            "followers": 5,
            "following": 3,
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2024-12-01T00:00:00Z",
        },
        {
            "login": "bob",
            "id": 2,
            "name": "Bob",
            "company": None,
            "location": None,
            "email": None,
            "bio": None,
            "public_repos": 50,
            "followers": 30,
            "following": 20,
            "created_at": "2020-01-01T00:00:00Z",
            "updated_at": "2024-12-01T00:00:00Z",
        },
    ]
    
    saved_data = {}
    
    def fake_load(path):
        return fake_members
    
    def fake_save(data, path, timestamp=True):
        saved_data[path] = data
        return path
    
    monkeypatch.setattr("silver.member_analytics.load_json_data", fake_load)
    monkeypatch.setattr("silver.member_analytics.save_json_data", fake_save)
    
    files = process_member_analytics()
    
    # Verifica que 3 arquivos foram gerados
    assert len(files) == 3
    assert any("members_analytics.json" in f for f in files)
    assert any("member_status_distribution.json" in f for f in files)
    assert any("maturity_bands.json" in f for f in files)
    
    # Verifica os dados salvos
    members_analytics = saved_data["data/silver/members_analytics.json"]
    assert len(members_analytics) == 2
    assert members_analytics[0]["login"] == "alice"
    assert members_analytics[0]["status"] == "established"  # 2 anos, 10 repos
    assert members_analytics[1]["login"] == "bob"
    assert members_analytics[1]["status"] == "established"  # 5 anos, 50 repos
    
    # Verifica distribuição de status
    status_dist = saved_data["data/silver/member_status_distribution.json"]
    assert status_dist["established"] == 2
    
    # Verifica maturity bands
    maturity_bands = saved_data["data/silver/maturity_bands.json"]
    assert "low" in maturity_bands
    assert "medium" in maturity_bands
    assert "high" in maturity_bands
    assert maturity_bands["low"] + maturity_bands["medium"] + maturity_bands["high"] == 2

@freeze_time("2025-01-01")
def test_process_member_analytics_with_metadata(monkeypatch):
    """Testa processamento quando dados contêm metadata"""
    fake_members = [
        {"_metadata": {"timestamp": "2024-12-01"}},  # Metadata a ser removida
        {
            "login": "charlie",
            "id": 3,
            "name": "Charlie",
            "public_repos": 5,
            "followers": 2,
            "following": 1,
            "created_at": "2024-06-01T00:00:00Z",
            "updated_at": "2024-12-01T00:00:00Z",
        },
    ]
    
    saved_data = {}
    
    def fake_load(path):
        return fake_members
    
    def fake_save(data, path, timestamp=True):
        saved_data[path] = data
        return path
    
    monkeypatch.setattr("silver.member_analytics.load_json_data", fake_load)
    monkeypatch.setattr("silver.member_analytics.save_json_data", fake_save)
    
    files = process_member_analytics()
    
    # Verifica que apenas 1 membro foi processado (metadata ignorada)
    members_analytics = saved_data["data/silver/members_analytics.json"]
    assert len(members_analytics) == 1
    assert members_analytics[0]["login"] == "charlie"
    assert members_analytics[0]["status"] == "new"  # < 1 ano

@freeze_time("2025-01-01")
def test_process_member_analytics_member_without_created_at(monkeypatch):
    """Testa processamento de membro sem created_at"""
    fake_members = [
        {
            "login": "dave",
            "id": 4,
            "public_repos": 100,
            "followers": 50,
            "following": 25,
        },
    ]
    
    saved_data = {}
    
    def fake_load(path):
        return fake_members
    
    def fake_save(data, path, timestamp=True):
        saved_data[path] = data
        return path
    
    monkeypatch.setattr("silver.member_analytics.load_json_data", fake_load)
    monkeypatch.setattr("silver.member_analytics.save_json_data", fake_save)
    
    files = process_member_analytics()
    
    members_analytics = saved_data["data/silver/members_analytics.json"]
    assert len(members_analytics) == 1
    assert members_analytics[0]["account_age_days"] == 0
    assert members_analytics[0]["status"] == "new"  # age = 0 < 365