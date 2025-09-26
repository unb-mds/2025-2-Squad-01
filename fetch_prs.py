# src/fetch_prs.py
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

prs_data = {}

for repo in repos:
    repo_full = repo.get("full_name")
    if not repo_full:
        continue

    prs_url = f"{GITHUB_API}/repos/{repo_full}/pulls?state=all&per_page=100"

    resp = requests.get(prs_url, headers=headers)
    if resp.status_code == 200:
        prs = resp.json()
        prs_data[repo_full] = []
        for pr in prs:
            prs_data[repo_full].append({
                "id": pr["id"],
                "number": pr["number"],
                "title": pr["title"],
                "author": pr["user"]["login"],
                "state": pr["state"],
                "created_at": pr["created_at"],
                "merged_at": pr.get("merged_at"),
                "closed_at": pr.get("closed_at"),
                "url": pr["html_url"]
            })
    else:
        print(f"Erro ao buscar PRs de {repo_full}: {resp.status_code}")

output_dir = "src/data/extractions"
os.makedirs(output_dir, exist_ok=True)

with open(f"{output_dir}/prs.json", "w", encoding="utf-8") as f:
    json.dump(prs_data, f, indent=2, ensure_ascii=False)
