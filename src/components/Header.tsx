import { Github, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onNewRepo: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ onNewRepo, darkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Repo Chat Assistant
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewRepo}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            New Repository
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </a>
        </div>
      </div>
    </header>
  );
}
