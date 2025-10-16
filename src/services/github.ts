import { Repository, FileNode, FileContent } from '../types';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const headers: HeadersInit = {
  'Accept': 'application/vnd.github.v3+json',
};

if (GITHUB_TOKEN) {
  headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
}

export async function validateGitHubUrl(url: string): Promise<{ owner: string; repo: string } | null> {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /^([^\/]+)\/([^\/]+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }

  return null;
}

export async function fetchRepository(owner: string, repo: string): Promise<Repository> {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found. Please check the URL and try again.');
    } else if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later or add a GitHub token.');
    } else if (response.status === 401) {
      throw new Error('This repository is private. Please use a public repository or provide authentication.');
    }
    throw new Error('Failed to fetch repository information.');
  }

  const data = await response.json();

  return {
    owner: data.owner.login,
    name: data.name,
    fullName: data.full_name,
    description: data.description || 'No description available',
    stars: data.stargazers_count,
    forks: data.forks_count,
    language: data.language || 'Unknown',
    updatedAt: data.updated_at,
    url: data.html_url,
    defaultBranch: data.default_branch
  };
}

export async function fetchFileTree(owner: string, repo: string, branch: string): Promise<FileNode[]> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch repository file tree.');
  }

  const data = await response.json();

  if (data.truncated) {
    console.warn('Repository is very large. File tree may be incomplete.');
  }

  const buildTree = (items: any[]): FileNode[] => {
    const root: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    items.forEach(item => {
      const node: FileNode = {
        name: item.path.split('/').pop() || item.path,
        path: item.path,
        type: item.type === 'tree' ? 'dir' : 'file',
        size: item.size
      };

      pathMap.set(item.path, node);

      const parentPath = item.path.split('/').slice(0, -1).join('/');
      if (parentPath) {
        const parent = pathMap.get(parentPath);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      } else {
        root.push(node);
      }
    });

    return root;
  };

  return buildTree(data.tree);
}

export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${path}`);
  }

  const data = await response.json();

  if (data.content) {
    return atob(data.content.replace(/\n/g, ''));
  }

  return '';
}

export async function fetchKeyFiles(owner: string, repo: string, fileTree: FileNode[]): Promise<FileContent[]> {
  const keyFileNames = [
    'README.md',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'vite.config.js',
    'next.config.js',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];

  const keyFiles: FileContent[] = [];
  const maxFileSize = 50000;

  const findFiles = (nodes: FileNode[], depth: number = 0): FileNode[] => {
    if (depth > 3) return [];

    const found: FileNode[] = [];
    for (const node of nodes) {
      if (node.type === 'file' && keyFileNames.includes(node.name) && (node.size || 0) < maxFileSize) {
        found.push(node);
      } else if (node.type === 'dir' && node.children) {
        found.push(...findFiles(node.children, depth + 1));
      }
    }
    return found;
  };

  const filesToFetch = findFiles(fileTree).slice(0, 10);

  const fetchPromises = filesToFetch.map(async (file) => {
    try {
      const content = await fetchFileContent(owner, repo, file.path);
      return {
        path: file.path,
        content,
        size: file.size || 0
      };
    } catch (error) {
      console.error(`Failed to fetch ${file.path}:`, error);
      return null;
    }
  });

  const results = await Promise.all(fetchPromises);
  return results.filter((f): f is FileContent => f !== null);
}

export function calculateRepoStats(fileTree: FileNode[]): { totalFiles: number; totalSize: number } {
  let totalFiles = 0;
  let totalSize = 0;

  const traverse = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'file') {
        totalFiles++;
        totalSize += node.size || 0;
      } else if (node.children) {
        traverse(node.children);
      }
    }
  };

  traverse(fileTree);
  return { totalFiles, totalSize };
}
