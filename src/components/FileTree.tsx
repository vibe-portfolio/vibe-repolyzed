import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { FileNode } from '../types';

interface FileTreeProps {
  nodes: FileNode[];
  level?: number;
}

function FileTreeNode({ node, level = 0 }: { node: FileNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2);

  const isDirectory = node.type === 'dir';

  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div
        onClick={handleToggle}
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
          isDirectory ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isDirectory && (
          <span className="text-gray-500 dark:text-gray-400">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {isDirectory ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          ) : (
            <Folder className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          )
        ) : (
          <File className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
          {node.name}
        </span>
      </div>
      {isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode key={`${child.path}-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ nodes }: FileTreeProps) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node, index) => (
        <FileTreeNode key={`${node.path}-${index}`} node={node} level={0} />
      ))}
    </div>
  );
}
