export interface Repository {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  url: string;
  defaultBranch: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
}

export interface IndexedRepository {
  repo: Repository;
  fileTree: FileNode[];
  keyFiles: FileContent[];
  totalFiles: number;
  totalSize: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface IndexingProgress {
  stage: 'fetching' | 'analyzing' | 'building' | 'complete';
  percentage: number;
  message: string;
}
