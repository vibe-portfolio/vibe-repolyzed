import { useState, useEffect } from 'react';
import Header from './components/Header';
import RepositoryInput from './components/RepositoryInput';
import LoadingScreen from './components/LoadingScreen';
import RepositoryPanel from './components/RepositoryPanel';
import ChatInterface from './components/ChatInterface';
import {
  validateGitHubUrl,
  fetchRepository,
  fetchFileTree,
  fetchKeyFiles,
  calculateRepoStats
} from './services/github';
import { generateAIResponse } from './services/ai';
import { IndexedRepository, ChatMessage, IndexingProgress } from './types';

type AppState = 'input' | 'loading' | 'chat';

function App() {
  const [state, setState] = useState<AppState>('input');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [indexedRepo, setIndexedRepo] = useState<IndexedRepository | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<IndexingProgress>({
    stage: 'fetching',
    percentage: 0,
    message: 'Starting.. .'
  });
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 640);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleIndexRepository = async (url: string) => {
    setLoading(true);
    setError('');
    setState('loading');
    setProgress({
      stage: 'fetching',
      percentage: 10,
      message: 'Validating repository URL...'
    });

    try {
      const parsed = await validateGitHubUrl(url);
      if (!parsed) {
        throw new Error('Invalid GitHub URL. Please enter a valid repository URL.');
      }

      setProgress({
        stage: 'fetching',
        percentage: 20,
        message: 'Fetching repository information...'
      });

      const repo = await fetchRepository(parsed.owner, parsed.repo);

      setProgress({
        stage: 'fetching',
        percentage: 40,
        message: 'Loading file structure...'
      });

      const fileTree = await fetchFileTree(parsed.owner, parsed.repo, repo.defaultBranch);

      setProgress({
        stage: 'analyzing',
        percentage: 60,
        message: 'Analyzing key files...'
      });

      const keyFiles = await fetchKeyFiles(parsed.owner, parsed.repo, fileTree);

      setProgress({
        stage: 'analyzing',
        percentage: 80,
        message: 'Calculating repository statistics...'
      });

      const stats = calculateRepoStats(fileTree);

      setProgress({
        stage: 'building',
        percentage: 95,
        message: 'Building context...'
      });

      const indexed: IndexedRepository = {
        repo,
        fileTree,
        keyFiles,
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize
      };

      setIndexedRepo(indexed);

      setProgress({
        stage: 'complete',
        percentage: 100,
        message: 'Repository indexed successfully!'
      });

      setTimeout(() => {
        setState('chat');
        setLoading(false);
      }, 500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setState('input');
      setLoading(false);
      alert(errorMessage);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!indexedRepo || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      await generateAIResponse(
        [...messages, userMessage],
        indexedRepo,
        (token: string) => {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'assistant') {
              last.content += token;
            }
            return updated;
          });
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'assistant') {
          last.content = `Error: ${errorMessage}`;
        }
        return updated;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleNewRepo = () => {
    setState('input');
    setIndexedRepo(null);
    setMessages([]);
    setError('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {state === 'input' && (
        <RepositoryInput onSubmit={handleIndexRepository} loading={loading} />
      )}

      {state === 'loading' && <LoadingScreen progress={progress} />}

      {state === 'chat' && indexedRepo && (
        <>
          <Header
            onNewRepo={handleNewRepo}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
          <div className="flex-1 flex overflow-hidden">
            <RepositoryPanel
              repository={indexedRepo.repo}
              fileTree={indexedRepo.fileTree}
              totalFiles={indexedRepo.totalFiles}
              totalSize={indexedRepo.totalSize}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className="flex-1 flex flex-col">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearChat={handleClearChat}
                isLoading={isGenerating}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
