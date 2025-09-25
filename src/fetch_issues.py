import os
import json
import requests

GITHUB_API = "https://api.github.com"
TOKEN = os.environ.get("GH_TOKEN")

headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github+json"
}

with open("src/data/org_repos.json", encoding="utf-8") as f:
    repos = json.load(f)

issues_data = {}

for repo in repos:
    # Espera que cada repo tenha o campo "full_name" (ex: "org/repo")
    repo_full = repo.get("full_name")
    if not repo_full:
        continue

    # Usa o campo issues_url se existir, senão monta a URL padrão
    issues_url = repo.get("issues_url")
    if issues_url:
        # Remove template '{/number}' se existir
        issues_url = issues_url.replace("{/number}", "?state=all&per_page=100")
    else:
        issues_url = f"{GITHUB_API}/repos/{repo_full}/issues?state=all&per_page=100"

    resp = requests.get(issues_url, headers=headers)
    if resp.status_code == 200:
        issues = resp.json()
        issues_data[repo_full] = []
        for issue in issues:
            if "pull_request" in issue:
                continue
            issues_data[repo_full].append({
                "number": issue["number"],
                "title": issue["title"],
                "state": issue["state"],
                "created_at": issue["created_at"],
                "closed_at": issue.get("closed_at"),
                "url": issue["html_url"],
                "user": issue["user"]["login"],
                "labels": [label["name"] for label in issue.get("labels", [])],
                "body": issue.get("body", "")
            })
    else:
        print(f"Erro ao buscar issues de {repo_full}: {resp.status_code}")

output_dir = "src/data/extractions"
os.makedirs(output_dir, exist_ok=True)
with open(f"{output_dir}/extractions.json", "w", encoding="utf-8") as f:
    json.dump(issues_data, f, indent=2, ensure_ascii=False)