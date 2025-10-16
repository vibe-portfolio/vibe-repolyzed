import { Loader2 } from 'lucide-react';
import { IndexingProgress } from '../types';

interface LoadingScreenProps {
  progress: IndexingProgress;
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Indexing Repository
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {progress.message}
            </p>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {progress.percentage}% complete
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 w-full">
              <div className={`text-center ${progress.percentage >= 33 ? 'opacity-100' : 'opacity-40'}`}>
                <div className="text-2xl mb-1">📦</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Fetching</p>
              </div>
              <div className={`text-center ${progress.percentage >= 66 ? 'opacity-100' : 'opacity-40'}`}>
                <div className="text-2xl mb-1">🔍</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Analyzing</p>
              </div>
              <div className={`text-center ${progress.percentage >= 100 ? 'opacity-100' : 'opacity-40'}`}>
                <div className="text-2xl mb-1">✨</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Building</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
