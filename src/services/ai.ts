import { IndexedRepository, ChatMessage } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function generateAIResponse(
  messages: ChatMessage[],
  repository: IndexedRepository,
  onToken: (token: string) => void
): Promise<void> {
  const context = buildRepositoryContext(repository);

  const systemMessage = `You are an expert code analyst assistant. You have access to the following GitHub repository:

Repository: ${repository.repo.fullName}
Description: ${repository.repo.description}
Primary Language: ${repository.repo.language}

${context}

Answer questions about this repository's code, structure, functionality, and implementation details. When referencing code, use proper markdown formatting with syntax highlighting. Be specific and reference actual files when possible.`;

  const conversationMessages = [
    { role: 'system', content: systemMessage },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  if (OPENAI_API_KEY) {
    await streamOpenAI(conversationMessages, onToken);
  } else if (ANTHROPIC_API_KEY) {
    await streamAnthropic(conversationMessages, onToken);
  } else {
    throw new Error('No AI API key configured. Please set VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY.');
  }
}

function buildRepositoryContext(repository: IndexedRepository): string {
  let context = `File Structure (${repository.totalFiles} files):\n`;

  const formatTree = (nodes: any[], depth: number = 0, maxDepth: number = 3): string => {
    if (depth > maxDepth) return '';

    let result = '';
    nodes.slice(0, 50).forEach(node => {
      const indent = '  '.repeat(depth);
      result += `${indent}${node.type === 'dir' ? '📁' : '📄'} ${node.name}\n`;
      if (node.children && depth < maxDepth) {
        result += formatTree(node.children, depth + 1, maxDepth);
      }
    });
    return result;
  };

  context += formatTree(repository.fileTree);

  if (repository.keyFiles.length > 0) {
    context += '\n\nKey Files Content:\n\n';
    repository.keyFiles.forEach(file => {
      if (file.content.length < 10000) {
        context += `--- ${file.path} ---\n${file.content}\n\n`;
      } else {
        context += `--- ${file.path} (truncated) ---\n${file.content.slice(0, 5000)}...\n\n`;
      }
    });
  }

  return context;
}

async function streamOpenAI(messages: any[], onToken: (token: string) => void): Promise<void> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate AI response');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Failed to read response stream');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices[0]?.delta?.content;
            if (token) {
              onToken(token);
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function streamAnthropic(messages: any[], onToken: (token: string) => void): Promise<void> {
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemMessage,
      messages: userMessages,
      stream: true
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate AI response');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Failed to read response stream');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              onToken(parsed.delta.text);
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
