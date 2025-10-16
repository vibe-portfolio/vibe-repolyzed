import { useState } from 'react';
import { Github, Loader2 } from 'lucide-react';

interface RepositoryInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

const EXAMPLE_REPOS = [
  { name: 'React', url: 'facebook/react' },
  { name: 'Next.js', url: 'vercel/next.js' },
  { name: 'VS Code', url: 'microsoft/vscode' }
];

export default function RepositoryInput({ onSubmit, loading }: RepositoryInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }
    setError('');
    onSubmit(url.trim());
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError('');
    onSubmit(exampleUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-6 rotate-180">
            <Github className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Repolyzed
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            GitHub Repository URL
          </label>
          <div className="flex gap-3">
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
