import { Star, GitFork, Calendar, Code, FileText, ChevronLeft } from 'lucide-react';
import { Repository, FileNode } from '../types';
import FileTree from './FileTree';

interface RepositoryPanelProps {
  repository: Repository;
  fileTree: FileNode[];
  totalFiles: number;
  totalSize: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export default function RepositoryPanel({
  repository,
  fileTree,
  totalFiles,
  totalSize,
  collapsed,
  onToggleCollapse
}: RepositoryPanelProps) {
  if (collapsed) {
    return (
      <div className="w-12 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {repository.name}
            </h2>
            <a
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {repository.fullName}
            </a>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {repository.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{repository.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <GitFork className="w-4 h-4 text-gray-500" />
            <span>{repository.forks.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Code className="w-4 h-4 text-blue-500" />
            <span>{repository.language}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Updated {formatDate(repository.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4" />
            <span>{totalFiles.toLocaleString()} files</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">{formatBytes(totalSize)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Repository Structure
        </h3>
        <FileTree nodes={fileTree} />
      </div>
    </div>
  );
}
