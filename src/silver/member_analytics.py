#!/usr/bin/env python3

import pandas as pd
import numpy as np
from datetime import datetime
from typing import List
from utils.github_api import save_json_data, load_json_data

def calculate_maturity_score(member_data: dict) -> float:
  
    
    
    if member_data.get('created_at'):
        try:
            created_date = datetime.strptime(member_data['created_at'], '%Y-%m-%dT%H:%M:%SZ')
            account_age_days = (datetime.now() - created_date).days
        except:
            account_age_days = 0
    else:
        account_age_days = 0
    
  
    public_repos = member_data.get('public_repos', 0)
    followers = member_data.get('followers', 0)
    
  
    age_component = 0.5 * np.log1p(account_age_days)
    repos_component = 3 * np.log1p(public_repos)
    followers_component = 20 * np.log1p(followers)
    
    return age_component + repos_component + followers_component

def classify_member_status(member_data: dict) -> str:

    
 
    if member_data.get('created_at'):
        try:
            created_date = datetime.strptime(member_data['created_at'], '%Y-%m-%dT%H:%M:%SZ')
            account_age_days = (datetime.now() - created_date).days
        except:
            account_age_days = 0
    else:
        account_age_days = 0
    
    public_repos = member_data.get('public_repos', 0)
    followers = member_data.get('followers', 0)
    
    
    if account_age_days < 365 or (public_repos < 10 and followers < 10):
        return 'new'
    else:
        return 'established'

def process_member_analytics() -> List[str]:

    
   
    members_data = load_json_data("data/bronze/members_detailed.json")
    if not members_data:
        print(" No member data found in bronze layer")
        return []
    
    
    if isinstance(members_data, list) and len(members_data) > 0 and '_metadata' in members_data[0]:
        members_data = members_data[1:]
    
    processed_members = []
    
    for member in members_data:
        maturity_score = calculate_maturity_score(member)
        status = classify_member_status(member)
        
       
        processed_member = {
            'login': member.get('login'),
            'id': member.get('id'),
            'name': member.get('name'),
            'company': member.get('company'),
            'location': member.get('location'),
            'email': member.get('email'),
            'bio': member.get('bio'),
            'public_repos': member.get('public_repos', 0),
            'followers': member.get('followers', 0),
            'following': member.get('following', 0),
            'created_at': member.get('created_at'),
            'updated_at': member.get('updated_at'),
            'maturity_score': maturity_score,
            'status': status,
            'account_age_days': (
                (datetime.now() - datetime.strptime(member['created_at'], '%Y-%m-%dT%H:%M:%SZ')).days
                if member.get('created_at') else 0
            )
        }
        processed_members.append(processed_member)
    
    generated_files = []
    
    
    members_file = save_json_data(
        processed_members,
        "data/silver/members_analytics.json"
    )
    generated_files.append(members_file)
    
    
    status_distribution = {}
    for member in processed_members:
        status = member['status']
        status_distribution[status] = status_distribution.get(status, 0) + 1
    
    distribution_file = save_json_data(
        status_distribution,
        "data/silver/member_status_distribution.json"
    )
    generated_files.append(distribution_file)
    
    
    maturity_scores = [m['maturity_score'] for m in processed_members]
    if maturity_scores:
        bands = {
            'low': len([s for s in maturity_scores if s < np.percentile(maturity_scores, 33)]),
            'medium': len([s for s in maturity_scores if np.percentile(maturity_scores, 33) <= s < np.percentile(maturity_scores, 67)]),
            'high': len([s for s in maturity_scores if s >= np.percentile(maturity_scores, 67)])
        }
        
        bands_file = save_json_data(
            bands,
            "data/silver/maturity_bands.json"
        )
        generated_files.append(bands_file)
    
    print(f"Processed {len(processed_members)} members")
    return generated_files