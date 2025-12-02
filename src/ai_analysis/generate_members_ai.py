"""
Gera members_ai.json com análises de IA sobre atividades dos membros.
Usa Gemini 2.0 Flash Lite com mínimo de requisições (max 25).
"""
import os
import json
import logging
import time
from typing import List, Dict, Any
from pathlib import Path
import google.generativeai as genai

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
log = logging.getLogger(__name__)


def load_api_key() -> str:
    """Carrega a API key do Gemini de .secrets ou variável de ambiente."""
    # Tentar .secrets primeiro
    secrets_file = Path(".secrets")
    if secrets_file.exists():
        with open(secrets_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GEMINI_API_KEY='):
                    return line.split('=', 1)[1].strip()
                elif line.startswith('GOOGLE_API_KEY='):
                    return line.split('=', 1)[1].strip()
    
    # Tentar variável de ambiente
    api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("API key não encontrada. Configure GEMINI_API_KEY no .secrets ou variável de ambiente")
    
    return api_key


def load_bronze_data(bronze_dir: str = "data/bronze") -> Dict[str, Dict[str, List[Dict]]]:
    """
    Carrega dados bronze e agrupa por membro.
    Retorna: {member: {repo: {'commits': [], 'prs': [], 'issues': []}}}
    """
    bronze_path = Path(bronze_dir)
    members_data = {}
    
    log.info(f"Carregando dados de {bronze_dir}")
    
    # Carregar todos os arquivos de commits
    for commits_file in bronze_path.glob("commits_*.json"):
        if "_with_stats" in commits_file.name or commits_file.name == "commits_all.json":
            continue
        
        repo_name = commits_file.name.replace("commits_", "").replace(".json", "")
        
        try:
            with open(commits_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Pular o primeiro item se for _metadata
                commits = data[1:] if data and isinstance(data[0], dict) and '_metadata' in data[0] else data
                
                for commit in commits:
                    # Tentar diferentes estruturas de author
                    author = None
                    if 'commit' in commit and 'author' in commit['commit']:
                        author = commit['commit']['author'].get('login') or commit['commit']['author'].get('name')
                    elif 'author' in commit:
                        if isinstance(commit['author'], dict):
                            author = commit['author'].get('login') or commit['author'].get('name')
                        else:
                            author = commit['author']
                    
                    if not author or author == 'unknown' or 'bot]' in author:
                        continue
                    
                    if author not in members_data:
                        members_data[author] = {}
                    if repo_name not in members_data[author]:
                        members_data[author][repo_name] = {'commits': [], 'prs': [], 'issues': []}
                    members_data[author][repo_name]['commits'].append(commit)
        except Exception as e:
            log.warning(f"Erro ao carregar {commits_file}: {e}")
    
    # Carregar todos os arquivos de PRs
    for prs_file in bronze_path.glob("prs_*.json"):
        if prs_file.name == "prs_all.json":
            continue
        
        repo_name = prs_file.name.replace("prs_", "").replace(".json", "")
        
        try:
            with open(prs_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Pular o primeiro item se for _metadata
                prs = data[1:] if data and isinstance(data[0], dict) and '_metadata' in data[0] else data
                
                for pr in prs:
                    # Tentar diferentes estruturas de author
                    author = None
                    if 'user' in pr and isinstance(pr['user'], dict):
                        author = pr['user'].get('login')
                    elif 'author' in pr:
                        if isinstance(pr['author'], dict):
                            author = pr['author'].get('login') or pr['author'].get('name')
                        else:
                            author = pr['author']
                    
                    if not author or author == 'unknown' or 'bot]' in author:
                        continue
                    
                    if author not in members_data:
                        members_data[author] = {}
                    if repo_name not in members_data[author]:
                        members_data[author][repo_name] = {'commits': [], 'prs': [], 'issues': []}
                    members_data[author][repo_name]['prs'].append(pr)
        except Exception as e:
            log.warning(f"Erro ao carregar {prs_file}: {e}")
    
    # Carregar todos os arquivos de Issues
    for issues_file in bronze_path.glob("issues_*.json"):
        if issues_file.name == "issues_all.json" or "issue_events" in issues_file.name:
            continue
        
        repo_name = issues_file.name.replace("issues_", "").replace(".json", "")
        
        try:
            with open(issues_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Pular o primeiro item se for _metadata
                issues = data[1:] if data and isinstance(data[0], dict) and '_metadata' in data[0] else data
                
                for issue in issues:
                    # Tentar diferentes estruturas de author
                    author = None
                    if 'user' in issue and isinstance(issue['user'], dict):
                        author = issue['user'].get('login')
                    elif 'author' in issue:
                        if isinstance(issue['author'], dict):
                            author = issue['author'].get('login') or issue['author'].get('name')
                        else:
                            author = issue['author']
                    
                    if not author or author == 'unknown' or 'bot]' in author:
                        continue
                    
                    if author not in members_data:
                        members_data[author] = {}
                    if repo_name not in members_data[author]:
                        members_data[author][repo_name] = {'commits': [], 'prs': [], 'issues': []}
                    members_data[author][repo_name]['issues'].append(issue)
        except Exception as e:
            log.warning(f"Erro ao carregar {issues_file}: {e}")
    
    log.info(f"Carregados dados de {len(members_data)} membros")
    return members_data


def prepare_member_summary(member: str, repos_data: Dict[str, Dict]) -> Dict[str, Any]:
    """Prepara um resumo dos dados de um membro para análise."""
    total_commits = 0
    total_prs = 0
    total_issues = 0
    repos_list = []
    
    commits_details = []
    prs_details = []
    issues_details = []
    
    # Estatísticas de alterações de código
    total_additions = 0
    total_deletions = 0
    commits_with_stats = 0
    
    for repo, data in repos_data.items():
        commits = data.get('commits', [])
        prs = data.get('prs', [])
        issues = data.get('issues', [])
        
        if commits or prs or issues:
            repos_list.append(repo)
        
        total_commits += len(commits)
        total_prs += len(prs)
        total_issues += len(issues)
        
        # Calcular estatísticas de alterações
        for commit in commits:
            additions = commit.get('additions', 0)
            deletions = commit.get('deletions', 0)
            if additions > 0 or deletions > 0:
                total_additions += additions
                total_deletions += deletions
                commits_with_stats += 1
        
        # Ordenar commits por total de mudanças (maiores primeiro)
        sorted_commits = sorted(commits, key=lambda c: c.get('additions', 0) + c.get('deletions', 0), reverse=True)
        
        # Coletar detalhes dos commits com maiores mudanças (amostras)
        for commit in sorted_commits[:5]:  # Max 5 por repo (com maiores mudanças)
            # Extrair mensagem da estrutura correta
            message = ''
            if 'commit' in commit and 'message' in commit['commit']:
                message = commit['commit']['message']
            elif 'message' in commit:
                message = commit['message']
            
            commits_details.append({
                'repo': repo,
                'message': message[:100],
                'additions': commit.get('additions', 0),
                'deletions': commit.get('deletions', 0),
                'date': commit.get('date', '')
            })
        
        # Coletar detalhes dos PRs (amostras)
        for pr in prs[:2]:  # Max 2 por repo
            prs_details.append({
                'repo': repo,
                'title': pr.get('title', '')[:80],
                'state': pr.get('state', ''),
                'date': pr.get('created_at', '')
            })
        
        # Coletar detalhes das issues (amostras)
        for issue in issues[:2]:  # Max 2 por repo
            issues_details.append({
                'repo': repo,
                'title': issue.get('title', '')[:80],
                'state': issue.get('state', ''),
                'date': issue.get('created_at', '')
            })
    
    # Calcular médias de alterações
    avg_additions = total_additions / commits_with_stats if commits_with_stats > 0 else 0
    avg_deletions = total_deletions / commits_with_stats if commits_with_stats > 0 else 0
    avg_changes = (total_additions + total_deletions) / commits_with_stats if commits_with_stats > 0 else 0
    
    return {
        'member': member,
        'repos': repos_list,
        'total_commits': total_commits,
        'total_prs': total_prs,
        'total_issues': total_issues,
        'avg_additions': round(avg_additions, 1),
        'avg_deletions': round(avg_deletions, 1),
        'avg_changes': round(avg_changes, 1),
        'commits_sample': commits_details[:20],  # Max 20 commits total (com maiores mudanças)
        'prs_sample': prs_details[:20],  # Max 20 PRs total
        'issues_sample': issues_details[:20]  # Max 20 issues total
    }


def create_analysis_prompt(members_batch: List[Dict[str, Any]]) -> str:
    """Cria o prompt para análise de um batch de membros."""
    
    prompt = """Você é um assistente técnico especializado em análise de métricas de desenvolvimento de software.

Analise ESTRITAMENTE cada membro abaixo seguindo o formato EXATO especificado.

DADOS DOS MEMBROS:
"""
    
    for idx, member_data in enumerate(members_batch, 1):
        prompt += f"\n### MEMBRO {idx}: {member_data['member']}\n"
        prompt += f"Repositórios: {', '.join(member_data['repos'][:3])}{'...' if len(member_data['repos']) > 3 else ''}\n"
        prompt += f"Total de commits: {member_data['total_commits']}\n"
        prompt += f"Total de PRs: {member_data['total_prs']}\n"
        prompt += f"Total de issues: {member_data['total_issues']}\n"
        prompt += f"Média de linhas adicionadas por commit: {member_data['avg_additions']}\n"
        prompt += f"Média de linhas removidas por commit: {member_data['avg_deletions']}\n"
        prompt += f"Média total de alterações por commit: {member_data['avg_changes']}\n"
        
        if member_data['commits_sample']:
            prompt += f"\nTítulos dos commits (amostra):\n"
            for commit in member_data['commits_sample'][:5]:
                prompt += f"  - {commit['message'][:80]}\n"
        
        if member_data['prs_sample']:
            prompt += f"\nPRs (amostra):\n"
            for pr in member_data['prs_sample'][:3]:
                prompt += f"  - {pr['title'][:60]} ({pr['state']})\n"
        
        if member_data['issues_sample']:
            prompt += f"\nIssues (amostra):\n"
            for issue in member_data['issues_sample'][:3]:
                prompt += f"  - {issue['title'][:60]} ({issue['state']})\n"
    
    prompt += """

REFERÊNCIAS PARA ANÁLISE DE ATOMICIDADE:

Considere as seguintes faixas para avaliar o tamanho médio de mudanças por commit:
- BAIXO NÍVEL (commits atômicos/ideais): Até 60 linhas alteradas (adições + remoções)
  → Commits pequenos, com poucas mudanças
- BOM NÍVEL (commits moderados): 60 a 300 linhas alteradas
  → Commits razoáveis, são gerenciáveis em code review
- ALTO NÍVEL (commits grandes/monolíticos): Acima de 300 linhas alteradas
  → Commits muito grandes, difíceis de revisar, não atômicos

  OBSERVAÇÃO: Commits absurdamente grandes (ex: milhares de linhas) devem ser apontados como possíveis manipulações com arquivos de dados como jsons por exemplo.

Use a "Média total de alterações por commit" fornecida para classificar a atomicidade.

REFERÊNCIAS PARA ANÁLISE DE ENGAJAMENTO EM PRs E ISSUES:
Use a "Média semanal de PRs" e "Total de PRs" e "Média semanal de Issues" e "Total de Issues" para avaliar o engajamento do membro.

INSTRUÇÕES DE FORMATAÇÃO (SIGA RIGOROSAMENTE):

Para CADA membro listado acima, você DEVE retornar EXATAMENTE neste formato:

---MEMBER_START:{nome_exato_do_membro}
COMMITS_ANALYSIS:
{analise sobre quantidade de commits e média semanal de commits, explicitando o envolvimento do membro no projeto com base no numero de commits, sua regularidade e o conteudo adicionado/removido médio},
{analise se os commits possuem grandes mudanças com muito conteudo adicionado/removido ou pequenas mudanças com pouco conteudo adicionado/removido},
{analise baseada nos títulos dos commits com mais mudanças: indicam tipo de mudança? o que dizem sobre o conteudo mais atomico dos commits?}

PRS_ANALYSIS:
{analises sobre participação e engajamento em prs e code review (através da média semanal de PRs e total de PRs), padrão de abertura de PRs e práticas ágeis}

ISSUES_ANALYSIS:
{analises sobre engajamento e envolvimento em issues (através da média semanal de Issues e total de Issues), tipos de issues criadas/comentadas e práticas ágeis}
---MEMBER_END

REGRAS CRÍTICAS:
1. Use o nome EXATO do membro após ---MEMBER_START: (copie exatamente como aparece nos dados)
2. SEMPRE inclua TODOS os marcadores: COMMITS_ANALYSIS:, PRS_ANALYSIS:, ISSUES_ANALYSIS:
3. Na análise de commits, SEMPRE tenha as 3 seções: NÚMERO:, ATOMICIDADE:, CONTEÚDO:
4. Finalize cada membro com ---MEMBER_END
5. NÃO adicione texto extra fora do formato especificado
6. NÃO pule nenhum membro

Comece agora:
"""
    
    return prompt


def parse_ai_response(response_text: str, members_in_batch: List[str]) -> Dict[str, Dict[str, str]]:
    """Parseia a resposta da IA e organiza por membro."""
    results = {}
    
    # Split por membros
    blocks = response_text.split('---MEMBER_START:')
    
    log.debug(f"Total de blocos encontrados: {len(blocks)}")
    
    for block_idx, block in enumerate(blocks[1:], 1):  # Pula o primeiro que é vazio
        try:
            # Extrair nome do membro (primeira linha)
            lines = block.split('\n')
            member_name = lines[0].strip() if lines else ""
            
            if not member_name:
                log.warning(f"Bloco {block_idx}: nome do membro vazio")
                continue
            
            log.debug(f"Processando membro: {member_name}")
            
            # Extrair análise de commits (com estrutura NÚMERO/ATOMICIDADE/CONTEÚDO)
            commits_analysis = ""
            if 'COMMITS_ANALYSIS:' in block:
                try:
                    commits_part = block.split('COMMITS_ANALYSIS:')[1]
                    # Pegar até o próximo marcador
                    if 'PRS_ANALYSIS:' in commits_part:
                        commits_part = commits_part.split('PRS_ANALYSIS:')[0]
                    commits_analysis = commits_part.strip()
                except Exception as e:
                    log.warning(f"Erro ao extrair COMMITS_ANALYSIS para {member_name}: {e}")
            else:
                log.warning(f"COMMITS_ANALYSIS não encontrado para {member_name}")
            
            # Extrair análise de PRs
            prs_analysis = ""
            if 'PRS_ANALYSIS:' in block:
                try:
                    prs_part = block.split('PRS_ANALYSIS:')[1]
                    # Pegar até o próximo marcador
                    if 'ISSUES_ANALYSIS:' in prs_part:
                        prs_part = prs_part.split('ISSUES_ANALYSIS:')[0]
                    prs_analysis = prs_part.strip()
                except Exception as e:
                    log.warning(f"Erro ao extrair PRS_ANALYSIS para {member_name}: {e}")
            else:
                log.warning(f"PRS_ANALYSIS não encontrado para {member_name}")
            
            # Extrair análise de issues
            issues_analysis = ""
            if 'ISSUES_ANALYSIS:' in block:
                try:
                    issues_part = block.split('ISSUES_ANALYSIS:')[1]
                    # Pegar até ---MEMBER_END ou fim do bloco
                    if '---MEMBER_END' in issues_part:
                        issues_part = issues_part.split('---MEMBER_END')[0]
                    issues_analysis = issues_part.strip()
                except Exception as e:
                    log.warning(f"Erro ao extrair ISSUES_ANALYSIS para {member_name}: {e}")
            else:
                log.warning(f"ISSUES_ANALYSIS não encontrado para {member_name}")
            
            # Só adiciona se pelo menos uma análise foi encontrada
            if commits_analysis or prs_analysis or issues_analysis:
                results[member_name] = {
                    'commits_analysis': commits_analysis or "Análise não disponível",
                    'prs_analysis': prs_analysis or "Análise não disponível",
                    'issues_analysis': issues_analysis or "Análise não disponível"
                }
                log.debug(f"Membro {member_name} parseado com sucesso")
            else:
                log.warning(f"Nenhuma análise encontrada para {member_name}")
                
        except Exception as e:
            log.error(f"Erro ao parsear bloco {block_idx}: {e}")
            continue
    
    log.info(f"Parseados {len(results)} membros de {len(members_in_batch)} esperados")
    
    # Logar membros que não foram parseados
    missing = set(members_in_batch) - set(results.keys())
    if missing:
        log.warning(f"Membros não parseados ({len(missing)}): {list(missing)[:5]}...")
    
    return results


def analyze_members_with_gemini(members_data: Dict[str, Dict], max_requests: int = 10) -> Dict[str, Any]:
    """Analisa membros usando Gemini com mínimo de requisições."""
    
    # Configurar Gemini
    api_key = load_api_key()
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    # Preparar sumários dos membros
    members_summaries = []
    for member, repos_data in members_data.items():
        summary = prepare_member_summary(member, repos_data)
        members_summaries.append(summary)
    
    log.info(f"Total de membros para analisar: {len(members_summaries)}")
    
    # Calcular tamanho do batch para não exceder max_requests
    batch_size = max(1, len(members_summaries) // max_requests + (1 if len(members_summaries) % max_requests else 0))
    log.info(f"Batch size: {batch_size} membros por requisição")
    
    # Dividir em batches
    batches = []
    for i in range(0, len(members_summaries), batch_size):
        batches.append(members_summaries[i:i+batch_size])
    
    log.info(f"Total de requisições: {len(batches)}")
    
    # Analisar cada batch
    all_analyses = {}
    
    for batch_idx, batch in enumerate(batches, 1):
        log.info(f"Processando batch {batch_idx}/{len(batches)} ({len(batch)} membros)")
        
        # Rate limiting: aguardar entre requisições
        # Mesmo sem quota pessoal, precisamos espaçar para evitar sobrecarga do sistema
        if batch_idx > 1:
            wait_time = 15  # Aumentado para 15s para evitar congestionamento
            log.info(f"Aguardando {wait_time}s entre batches...")
            time.sleep(wait_time)
        
        max_retries = 8  # Mais tentativas devido a congestionamento do sistema
        retry_delay = 30  # Delay inicial menor (30s)
        
        for attempt in range(max_retries):
            try:
                prompt = create_analysis_prompt(batch)
                
                log.info(f"Tamanho do prompt: {len(prompt)} caracteres")
                
                # Chamar API
                response = model.generate_content(prompt)
                response_text = response.text
                
                log.info(f"Resposta recebida com {len(response_text)} caracteres")
                
                # Parsear resposta
                members_in_batch = [m['member'] for m in batch]
                batch_analyses = parse_ai_response(response_text, members_in_batch)
                
                # Adicionar informações base
                for member_summary in batch:
                    member_name = member_summary['member']
                    if member_name in batch_analyses:
                        all_analyses[member_name] = {
                            'name': member_name,
                            'repos': member_summary['repos'],
                            'commits_analysis': batch_analyses[member_name]['commits_analysis'],
                            'prs_analysis': batch_analyses[member_name]['prs_analysis'],
                            'issues_analysis': batch_analyses[member_name]['issues_analysis']
                        }
                    else:
                        # Fallback se não encontrou
                        all_analyses[member_name] = {
                            'name': member_name,
                            'repos': member_summary['repos'],
                            'commits_analysis': 'Análise não disponível',
                            'prs_analysis': 'Análise não disponível',
                            'issues_analysis': 'Análise não disponível'
                        }
                
                log.info(f"Batch {batch_idx} processado com sucesso")
                break  # Sucesso, sair do loop de retries
                
            except Exception as e:
                error_msg = str(e)
                log.error(f"Erro capturado: {error_msg}")
                
                if '429' in error_msg and attempt < max_retries - 1:
                    log.warning(f"Sistema Google sobrecarregado (429) no batch {batch_idx}, tentativa {attempt + 1}/{max_retries}. Aguardando {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay = int(retry_delay * 1.5)  # Backoff mais suave: 30s → 45s → 67s → 100s...
                    continue
                elif attempt < max_retries - 1:
                    log.warning(f"Erro no batch {batch_idx}, tentativa {attempt + 1}/{max_retries}: {str(e)[:150]}. Aguardando {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay = int(retry_delay * 1.5)
                    continue
                else:
                    log.error(f"Erro ao processar batch {batch_idx} após {max_retries} tentativas: {e}")
                    # Adicionar entradas com erro
                    for member_summary in batch:
                        all_analyses[member_summary['member']] = {
                            'name': member_summary['member'],
                            'repos': member_summary['repos'],
                            'commits_analysis': 'Sistema Google sobrecarregado - tente novamente mais tarde',
                            'prs_analysis': 'Sistema Google sobrecarregado - tente novamente mais tarde',
                            'issues_analysis': 'Sistema Google sobrecarregado - tente novamente mais tarde'
                        }
                    break
    
    return all_analyses


def main():
    """Função principal."""
    import sys
    
    # Verificar se é modo de teste (processa apenas 3 membros)
    test_mode = '--test' in sys.argv
    
    # Verificar se deve aguardar rate limit limpar
    wait_clear = '--wait-clear' in sys.argv
    
    log.info("Iniciando geração de members_ai.json")
    if test_mode:
        log.info("MODO DE TESTE: Processando apenas 3 membros")
    
    if wait_clear:
        wait_time = 90
        log.warning(f"Aguardando {wait_time}s para garantir que o rate limit do Gemini está completamente limpo...")
        time.sleep(wait_time)
    
    # Carregar dados bronze
    members_data = load_bronze_data("data/bronze")
    
    if not members_data:
        log.error("Nenhum dado encontrado no diretório bronze")
        return
    
    # Em modo de teste, pegar apenas 3 membros
    if test_mode:
        members_data = dict(list(members_data.items())[:3])
        log.info(f"Modo de teste: {len(members_data)} membros selecionados")
    
    # Analisar com Gemini
    max_requests = 1 if test_mode else 10
    analyses = analyze_members_with_gemini(members_data, max_requests=max_requests)
    
    # Salvar resultado
    output_dir = Path("data/silver/ai")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / "members_ai.json"
    
    output_data = {
        '_metadata': {
            'total_members': len(analyses),
            'model': 'gemini-2.0-flash-lite',
            'description': 'Análises de IA sobre atividades dos membros',
            'test_mode': test_mode
        },
        'members': analyses
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    log.info(f"Arquivo gerado: {output_file}")
    log.info(f"Total de membros analisados: {len(analyses)}")


if __name__ == "__main__":
    main()
