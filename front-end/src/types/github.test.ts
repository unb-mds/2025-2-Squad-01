import { describe, test, expect } from 'vitest';
import type {
  AggregatedCommit,
  RepoCommitSummary,
  GithubSummaryResponse,
} from './github';

describe('GitHub Type Definitions', () => {
  // ========== AGGREGATEDCOMMIT ==========
  describe('AggregatedCommit', () => {
    test('cria objeto válido com todos os campos obrigatórios', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123def456',
        url: 'https://github.com/user/repo/commit/abc123',
        message: 'feat: add new feature',
        author: {
          login: 'johndoe',
          displayName: 'John Doe',
        },
        committedAt: '2024-01-01T10:00:00Z',
      };

      expect(commit).toHaveProperty('sha');
      expect(commit).toHaveProperty('url');
      expect(commit).toHaveProperty('message');
      expect(commit).toHaveProperty('author');
      expect(commit).toHaveProperty('committedAt');
      expect(typeof commit.sha).toBe('string');
      expect(typeof commit.url).toBe('string');
      expect(typeof commit.message).toBe('string');
      expect(typeof commit.committedAt).toBe('string');
    });

    test('cria objeto válido com profileUrl opcional', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com/user/repo/commit/abc123',
        message: 'fix: resolve bug',
        author: {
          login: 'johndoe',
          displayName: 'John Doe',
          profileUrl: 'https://github.com/johndoe',
        },
        committedAt: '2024-01-01T10:00:00Z',
      };

      expect(commit.author.profileUrl).toBe('https://github.com/johndoe');
      expect(typeof commit.author.profileUrl).toBe('string');
    });

    test('profileUrl é opcional no author', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com/user/repo/commit/abc123',
        message: 'docs: update README',
        author: {
          login: 'johndoe',
          displayName: 'John Doe',
        },
        committedAt: '2024-01-01T10:00:00Z',
      };

      expect(commit.author.profileUrl).toBeUndefined();
    });

    test('sha aceita diferentes formatos de hash', () => {
      const commits: AggregatedCommit[] = [
        {
          sha: 'abc123def456',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'a'.repeat(40), // SHA-1 completo
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc123', // SHA curto
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
      ];

      commits.forEach((commit) => {
        expect(typeof commit.sha).toBe('string');
        expect(commit.sha.length).toBeGreaterThan(0);
      });
    });

    test('url aceita diferentes formatos de URL do GitHub', () => {
      const urls: AggregatedCommit[] = [
        {
          sha: 'abc',
          url: 'https://github.com/user/repo/commit/abc123',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://api.github.com/repos/user/repo/commits/abc123',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://github.com/org/repo-name/commit/abc',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
      ];

      urls.forEach((commit) => {
        expect(commit.url).toContain('github.com');
        expect(commit.url).toContain('commit');
      });
    });

    test('message aceita diferentes tipos de mensagem de commit', () => {
      const messages: AggregatedCommit[] = [
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'feat: add new feature',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'fix(auth): resolve login issue',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'Update README.md',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'Initial commit',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01',
        },
      ];

      messages.forEach((commit) => {
        expect(typeof commit.message).toBe('string');
        expect(commit.message.length).toBeGreaterThan(0);
      });
    });

    test('author.login aceita diferentes formatos', () => {
      const logins: AggregatedCommit[] = [
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'johndoe', displayName: 'John Doe' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'john-doe-123', displayName: 'John Doe' },
          committedAt: '2024-01-01',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'JohnDoe2024', displayName: 'John Doe' },
          committedAt: '2024-01-01',
        },
      ];

      logins.forEach((commit) => {
        expect(typeof commit.author.login).toBe('string');
        expect(commit.author.login.length).toBeGreaterThan(0);
      });
    });

    test('author.displayName aceita nomes completos', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com',
        message: 'test',
        author: {
          login: 'johndoe',
          displayName: 'John William Doe Jr.',
        },
        committedAt: '2024-01-01',
      };

      expect(commit.author.displayName).toBe('John William Doe Jr.');
    });

    test('committedAt aceita formato ISO 8601', () => {
      const dates: AggregatedCommit[] = [
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-01-01T10:00:00Z',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-12-31T23:59:59.999Z',
        },
        {
          sha: 'abc',
          url: 'https://github.com',
          message: 'test',
          author: { login: 'user', displayName: 'User' },
          committedAt: '2024-06-15T14:30:00+00:00',
        },
      ];

      dates.forEach((commit) => {
        expect(typeof commit.committedAt).toBe('string');
        expect(commit.committedAt).toMatch(/\d{4}/); // Ano presente
      });
    });

    test('estrutura em array de AggregatedCommit', () => {
      const commits: AggregatedCommit[] = [
        {
          sha: 'abc123',
          url: 'https://github.com/user/repo/commit/abc123',
          message: 'feat: add feature',
          author: { login: 'user1', displayName: 'User One' },
          committedAt: '2024-01-01T10:00:00Z',
        },
        {
          sha: 'def456',
          url: 'https://github.com/user/repo/commit/def456',
          message: 'fix: resolve bug',
          author: { login: 'user2', displayName: 'User Two', profileUrl: 'https://github.com/user2' },
          committedAt: '2024-01-02T11:00:00Z',
        },
      ];

      expect(commits.length).toBe(2);
      expect(commits[0].author.profileUrl).toBeUndefined();
      expect(commits[1].author.profileUrl).toBeDefined();
    });

    test('message aceita string vazia', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com',
        message: '',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      expect(commit.message).toBe('');
    });

    test('message aceita mensagens multi-linha', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com',
        message: 'feat: add feature\n\nThis is a detailed description\nwith multiple lines',
        author: { login: 'user', displayName: 'User' },
        committedAt: '2024-01-01',
      };

      expect(commit.message).toContain('\n');
      expect(commit.message.split('\n').length).toBeGreaterThan(1);
    });

    test('author com caracteres especiais', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com',
        message: 'test',
        author: {
          login: 'user-name_123',
          displayName: 'Müller O\'Brien',
        },
        committedAt: '2024-01-01',
      };

      expect(commit.author.login).toBe('user-name_123');
      expect(commit.author.displayName).toBe('Müller O\'Brien');
    });
  });

  // ========== REPOCOMMITSUMMARY ==========
  describe('RepoCommitSummary', () => {
    test('cria objeto válido com todos os campos', () => {
      const repo: RepoCommitSummary = {
        id: 12345,
        name: 'my-repo',
        fullName: 'user/my-repo',
        url: 'https://github.com/user/my-repo',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo).toHaveProperty('id');
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('fullName');
      expect(repo).toHaveProperty('url');
      expect(repo).toHaveProperty('defaultBranch');
      expect(repo).toHaveProperty('commits');
      expect(typeof repo.id).toBe('number');
      expect(typeof repo.name).toBe('string');
      expect(typeof repo.fullName).toBe('string');
      expect(typeof repo.url).toBe('string');
      expect(typeof repo.defaultBranch).toBe('string');
      expect(Array.isArray(repo.commits)).toBe(true);
    });

    test('commits é array de AggregatedCommit', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com/user/repo',
        defaultBranch: 'main',
        commits: [
          {
            sha: 'abc123',
            url: 'https://github.com/user/repo/commit/abc123',
            message: 'test commit',
            author: { login: 'user', displayName: 'User' },
            committedAt: '2024-01-01T10:00:00Z',
          },
        ],
      };

      expect(repo.commits.length).toBe(1);
      expect(repo.commits[0]).toHaveProperty('sha');
      expect(repo.commits[0]).toHaveProperty('author');
    });

    test('id aceita diferentes valores numéricos', () => {
      const repos: RepoCommitSummary[] = [
        {
          id: 0,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: 123456789,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: -1,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
      ];

      repos.forEach((repo) => {
        expect(typeof repo.id).toBe('number');
      });
    });

    test('name aceita diferentes formatos de nome', () => {
      const names: RepoCommitSummary[] = [
        {
          id: 1,
          name: 'my-repo',
          fullName: 'user/my-repo',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: 1,
          name: 'repo_name',
          fullName: 'user/repo_name',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: 1,
          name: 'RepoName123',
          fullName: 'user/RepoName123',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: 1,
          name: 'repo.name',
          fullName: 'user/repo.name',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
      ];

      names.forEach((repo) => {
        expect(typeof repo.name).toBe('string');
        expect(repo.name.length).toBeGreaterThan(0);
      });
    });

    test('fullName segue formato owner/repo', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'my-repo',
        fullName: 'organization/my-repo',
        url: 'https://github.com/organization/my-repo',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo.fullName).toContain('/');
      const parts = repo.fullName.split('/');
      expect(parts.length).toBe(2);
    });

    test('url aponta para repositório no GitHub', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'my-repo',
        fullName: 'user/my-repo',
        url: 'https://github.com/user/my-repo',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo.url).toContain('github.com');
      expect(repo.url).toContain(repo.name);
    });

    test('defaultBranch aceita diferentes nomes', () => {
      const branches: RepoCommitSummary[] = [
        {
          id: 1,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: 1,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'master',
          commits: [],
        },
        {
          id: 1,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'develop',
          commits: [],
        },
        {
          id: 1,
          name: 'repo',
          fullName: 'user/repo',
          url: 'https://github.com',
          defaultBranch: 'feature/new-feature',
          commits: [],
        },
      ];

      branches.forEach((repo) => {
        expect(typeof repo.defaultBranch).toBe('string');
        expect(repo.defaultBranch.length).toBeGreaterThan(0);
      });
    });

    test('commits pode estar vazio', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'empty-repo',
        fullName: 'user/empty-repo',
        url: 'https://github.com/user/empty-repo',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo.commits).toEqual([]);
      expect(repo.commits.length).toBe(0);
    });

    test('commits pode ter múltiplos elementos', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com/user/repo',
        defaultBranch: 'main',
        commits: [
          {
            sha: 'abc123',
            url: 'https://github.com',
            message: 'commit 1',
            author: { login: 'user1', displayName: 'User One' },
            committedAt: '2024-01-01T10:00:00Z',
          },
          {
            sha: 'def456',
            url: 'https://github.com',
            message: 'commit 2',
            author: { login: 'user2', displayName: 'User Two' },
            committedAt: '2024-01-02T11:00:00Z',
          },
          {
            sha: 'ghi789',
            url: 'https://github.com',
            message: 'commit 3',
            author: { login: 'user3', displayName: 'User Three' },
            committedAt: '2024-01-03T12:00:00Z',
          },
        ],
      };

      expect(repo.commits.length).toBe(3);
    });

    test('estrutura em array de RepoCommitSummary', () => {
      const repos: RepoCommitSummary[] = [
        {
          id: 1,
          name: 'repo1',
          fullName: 'user/repo1',
          url: 'https://github.com/user/repo1',
          defaultBranch: 'main',
          commits: [],
        },
        {
          id: 2,
          name: 'repo2',
          fullName: 'user/repo2',
          url: 'https://github.com/user/repo2',
          defaultBranch: 'develop',
          commits: [
            {
              sha: 'abc',
              url: 'https://github.com',
              message: 'test',
              author: { login: 'user', displayName: 'User' },
              committedAt: '2024-01-01',
            },
          ],
        },
      ];

      expect(repos.length).toBe(2);
      expect(repos[0].commits.length).toBe(0);
      expect(repos[1].commits.length).toBe(1);
    });

    test('fullName com organização', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'my-repo',
        fullName: 'my-organization/my-repo',
        url: 'https://github.com/my-organization/my-repo',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo.fullName).toBe('my-organization/my-repo');
      expect(repo.fullName.split('/')[0]).toBe('my-organization');
    });

    test('name pode ser diferente do último segmento de fullName', () => {
      const repo: RepoCommitSummary = {
        id: 1,
        name: 'short-name',
        fullName: 'organization/very-long-repository-name',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: [],
      };

      expect(repo.name).not.toBe(repo.fullName.split('/')[1]);
    });
  });

  // ========== GITHUBSUMMARYRESPONSE ==========
  describe('GithubSummaryResponse', () => {
    test('cria objeto válido com todos os campos', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 5,
        totalCommits: 150,
        repositories: [],
      };

      expect(response).toHaveProperty('generatedAt');
      expect(response).toHaveProperty('repoCount');
      expect(response).toHaveProperty('totalCommits');
      expect(response).toHaveProperty('repositories');
      expect(typeof response.generatedAt).toBe('string');
      expect(typeof response.repoCount).toBe('number');
      expect(typeof response.totalCommits).toBe('number');
      expect(Array.isArray(response.repositories)).toBe(true);
    });

    test('repositories é array de RepoCommitSummary', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 1,
        totalCommits: 2,
        repositories: [
          {
            id: 1,
            name: 'repo',
            fullName: 'user/repo',
            url: 'https://github.com/user/repo',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc123',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'user', displayName: 'User' },
                committedAt: '2024-01-01',
              },
            ],
          },
        ],
      };

      expect(response.repositories.length).toBe(1);
      expect(response.repositories[0]).toHaveProperty('commits');
    });

    test('generatedAt aceita formato ISO 8601', () => {
      const dates: GithubSummaryResponse[] = [
        {
          generatedAt: '2024-01-01T10:00:00Z',
          repoCount: 0,
          totalCommits: 0,
          repositories: [],
        },
        {
          generatedAt: '2024-12-31T23:59:59.999Z',
          repoCount: 0,
          totalCommits: 0,
          repositories: [],
        },
        {
          generatedAt: '2024-06-15T14:30:00+00:00',
          repoCount: 0,
          totalCommits: 0,
          repositories: [],
        },
      ];

      dates.forEach((response) => {
        expect(typeof response.generatedAt).toBe('string');
        expect(response.generatedAt).toMatch(/\d{4}/);
      });
    });

    test('repoCount reflete número de repositórios', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 3,
        totalCommits: 50,
        repositories: [
          {
            id: 1,
            name: 'repo1',
            fullName: 'user/repo1',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [],
          },
          {
            id: 2,
            name: 'repo2',
            fullName: 'user/repo2',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [],
          },
          {
            id: 3,
            name: 'repo3',
            fullName: 'user/repo3',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [],
          },
        ],
      };

      expect(response.repoCount).toBe(3);
      expect(response.repositories.length).toBe(3);
    });

    test('totalCommits soma commits de todos os repositórios', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 2,
        totalCommits: 3,
        repositories: [
          {
            id: 1,
            name: 'repo1',
            fullName: 'user/repo1',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'user', displayName: 'User' },
                committedAt: '2024-01-01',
              },
              {
                sha: 'def',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'user', displayName: 'User' },
                committedAt: '2024-01-01',
              },
            ],
          },
          {
            id: 2,
            name: 'repo2',
            fullName: 'user/repo2',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'ghi',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'user', displayName: 'User' },
                committedAt: '2024-01-01',
              },
            ],
          },
        ],
      };

      const actualTotal = response.repositories.reduce(
        (sum, repo) => sum + repo.commits.length,
        0
      );
      expect(response.totalCommits).toBe(actualTotal);
    });

    test('repositories pode estar vazio', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 0,
        totalCommits: 0,
        repositories: [],
      };

      expect(response.repositories).toEqual([]);
      expect(response.repoCount).toBe(0);
      expect(response.totalCommits).toBe(0);
    });

    test('repoCount e totalCommits aceitam zero', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 0,
        totalCommits: 0,
        repositories: [],
      };

      expect(response.repoCount).toBe(0);
      expect(response.totalCommits).toBe(0);
    });

    test('totalCommits pode ser maior que repoCount', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 2,
        totalCommits: 150,
        repositories: [],
      };

      expect(response.totalCommits).toBeGreaterThan(response.repoCount);
    });

    test('estrutura completa com dados aninhados', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 2,
        totalCommits: 3,
        repositories: [
          {
            id: 1,
            name: 'repo1',
            fullName: 'user/repo1',
            url: 'https://github.com/user/repo1',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc123',
                url: 'https://github.com/user/repo1/commit/abc123',
                message: 'feat: add feature',
                author: {
                  login: 'user1',
                  displayName: 'User One',
                  profileUrl: 'https://github.com/user1',
                },
                committedAt: '2024-01-01T10:00:00Z',
              },
              {
                sha: 'def456',
                url: 'https://github.com/user/repo1/commit/def456',
                message: 'fix: resolve bug',
                author: {
                  login: 'user2',
                  displayName: 'User Two',
                },
                committedAt: '2024-01-02T11:00:00Z',
              },
            ],
          },
          {
            id: 2,
            name: 'repo2',
            fullName: 'user/repo2',
            url: 'https://github.com/user/repo2',
            defaultBranch: 'develop',
            commits: [
              {
                sha: 'ghi789',
                url: 'https://github.com/user/repo2/commit/ghi789',
                message: 'docs: update README',
                author: {
                  login: 'user3',
                  displayName: 'User Three',
                },
                committedAt: '2024-01-03T12:00:00Z',
              },
            ],
          },
        ],
      };

      expect(response.repositories.length).toBe(2);
      expect(response.repositories[0].commits.length).toBe(2);
      expect(response.repositories[1].commits.length).toBe(1);
      expect(response.repositories[0].commits[0].author.profileUrl).toBeDefined();
      expect(response.repositories[0].commits[1].author.profileUrl).toBeUndefined();
    });
  });

  // ========== TYPE SAFETY ==========
  describe('Type Safety', () => {
    test('AggregatedCommit tem tipos corretos', () => {
      const commit: AggregatedCommit = {
        sha: 'abc123',
        url: 'https://github.com',
        message: 'test',
        author: { login: 'user', displayName: 'User', profileUrl: 'https://github.com/user' },
        committedAt: '2024-01-01',
      };

      expect(typeof commit.sha).toBe('string');
      expect(typeof commit.url).toBe('string');
      expect(typeof commit.message).toBe('string');
      expect(typeof commit.author.login).toBe('string');
      expect(typeof commit.author.displayName).toBe('string');
      expect(typeof commit.author.profileUrl).toBe('string');
      expect(typeof commit.committedAt).toBe('string');
    });

    test('RepoCommitSummary tem tipos corretos', () => {
      const repo: RepoCommitSummary = {
        id: 123,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: [],
      };

      expect(typeof repo.id).toBe('number');
      expect(typeof repo.name).toBe('string');
      expect(typeof repo.fullName).toBe('string');
      expect(typeof repo.url).toBe('string');
      expect(typeof repo.defaultBranch).toBe('string');
      expect(Array.isArray(repo.commits)).toBe(true);
    });

    test('GithubSummaryResponse tem tipos corretos', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 5,
        totalCommits: 100,
        repositories: [],
      };

      expect(typeof response.generatedAt).toBe('string');
      expect(typeof response.repoCount).toBe('number');
      expect(typeof response.totalCommits).toBe('number');
      expect(Array.isArray(response.repositories)).toBe(true);
    });
  });

  // ========== EDGE CASES ==========
  describe('Edge Cases', () => {
    test('AggregatedCommit com valores extremos', () => {
      const commit: AggregatedCommit = {
        sha: 'a'.repeat(100),
        url: 'https://' + 'a'.repeat(200) + '.com',
        message: 'test\n'.repeat(100),
        author: {
          login: 'user' + '123'.repeat(50),
          displayName: 'U'.repeat(200),
        },
        committedAt: '2024-01-01T10:00:00Z',
      };

      expect(commit.sha.length).toBe(100);
      expect(commit.message.split('\n').length).toBeGreaterThan(50);
    });

    test('RepoCommitSummary com valores extremos', () => {
      const repo: RepoCommitSummary = {
        id: Number.MAX_SAFE_INTEGER,
        name: 'repo',
        fullName: 'user/repo',
        url: 'https://github.com',
        defaultBranch: 'main',
        commits: Array.from({ length: 1000 }, (_, i) => ({
          sha: `sha${i}`,
          url: 'https://github.com',
          message: `commit ${i}`,
          author: { login: `user${i}`, displayName: `User ${i}` },
          committedAt: '2024-01-01',
        })),
      };

      expect(repo.id).toBe(Number.MAX_SAFE_INTEGER);
      expect(repo.commits.length).toBe(1000);
    });

    test('GithubSummaryResponse com Unicode', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01T10:00:00Z',
        repoCount: 1,
        totalCommits: 1,
        repositories: [
          {
            id: 1,
            name: '프로젝트',
            fullName: '組織/проект',
            url: 'https://github.com',
            defaultBranch: 'главная',
            commits: [
              {
                sha: 'abc123',
                url: 'https://github.com',
                message: '새로운 기능 추가 🎉',
                author: {
                  login: 'ユーザー',
                  displayName: 'المستخدم',
                },
                committedAt: '2024-01-01',
              },
            ],
          },
        ],
      };

      expect(response.repositories[0].name).toBe('프로젝트');
      expect(response.repositories[0].commits[0].message).toContain('🎉');
    });

    test('totalCommits pode ser negativo', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 0,
        totalCommits: -1,
        repositories: [],
      };

      expect(response.totalCommits).toBe(-1);
    });

    test('repoCount não precisa corresponder ao tamanho do array', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 10,
        totalCommits: 100,
        repositories: [
          {
            id: 1,
            name: 'repo',
            fullName: 'user/repo',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [],
          },
        ],
      };

      expect(response.repoCount).not.toBe(response.repositories.length);
    });
  });

  // ========== PRACTICAL USAGE ==========
  describe('Practical Usage', () => {
    test('GithubSummaryResponse em cenário real completo', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-15T08:30:00Z',
        repoCount: 3,
        totalCommits: 25,
        repositories: [
          {
            id: 123456,
            name: 'frontend',
            fullName: 'mycompany/frontend',
            url: 'https://github.com/mycompany/frontend',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'a1b2c3d4e5f6',
                url: 'https://github.com/mycompany/frontend/commit/a1b2c3d4e5f6',
                message: 'feat: add user authentication',
                author: {
                  login: 'johndoe',
                  displayName: 'John Doe',
                  profileUrl: 'https://github.com/johndoe',
                },
                committedAt: '2024-01-14T10:00:00Z',
              },
            ],
          },
        ],
      };

      const totalCommitsInRepos = response.repositories.reduce(
        (sum, repo) => sum + repo.commits.length,
        0
      );
      expect(totalCommitsInRepos).toBeLessThanOrEqual(response.totalCommits);
    });

    test('filtragem de commits por autor', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 1,
        totalCommits: 3,
        repositories: [
          {
            id: 1,
            name: 'repo',
            fullName: 'user/repo',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: [
              {
                sha: 'abc',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'alice', displayName: 'Alice' },
                committedAt: '2024-01-01',
              },
              {
                sha: 'def',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'bob', displayName: 'Bob' },
                committedAt: '2024-01-01',
              },
              {
                sha: 'ghi',
                url: 'https://github.com',
                message: 'test',
                author: { login: 'alice', displayName: 'Alice' },
                committedAt: '2024-01-01',
              },
            ],
          },
        ],
      };

      const aliceCommits = response.repositories
        .flatMap((r) => r.commits)
        .filter((c) => c.author.login === 'alice');

      expect(aliceCommits.length).toBe(2);
    });

    test('agregação de estatísticas', () => {
      const response: GithubSummaryResponse = {
        generatedAt: '2024-01-01',
        repoCount: 2,
        totalCommits: 5,
        repositories: [
          {
            id: 1,
            name: 'repo1',
            fullName: 'user/repo1',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: Array(3).fill(null).map((_, i) => ({
              sha: `sha${i}`,
              url: 'https://github.com',
              message: 'test',
              author: { login: 'user', displayName: 'User' },
              committedAt: '2024-01-01',
            })),
          },
          {
            id: 2,
            name: 'repo2',
            fullName: 'user/repo2',
            url: 'https://github.com',
            defaultBranch: 'main',
            commits: Array(2).fill(null).map((_, i) => ({
              sha: `sha${i}`,
              url: 'https://github.com',
              message: 'test',
              author: { login: 'user', displayName: 'User' },
              committedAt: '2024-01-01',
            })),
          },
        ],
      };

      const uniqueAuthors = new Set(
        response.repositories.flatMap((r) => r.commits).map((c) => c.author.login)
      );

      expect(uniqueAuthors.size).toBeGreaterThanOrEqual(1);
    });
  });
});