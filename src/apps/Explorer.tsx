import { useState, useEffect, useCallback } from 'react';
import type { FileSystemNode } from '@/types';
import { vfs, getFileIcon } from '@/core/VFS';
import { 
  Folder, ArrowLeft, ArrowUp, RefreshCw, 
  Home, Search, Grid, List 
} from 'lucide-react';
import { windowActions } from '@/store';

interface ExplorerProps {
  initialPath?: string;
}

export const Explorer: React.FC<ExplorerProps> = ({ initialPath = 'C:/Users/Usuario' }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<FileSystemNode[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [history, setHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDirectory = useCallback(() => {
    const dirItems = vfs.list(currentPath);
    setItems(dirItems);
  }, [currentPath]);

  useEffect(() => {
    loadDirectory();
    const unsubscribe = vfs.watch(currentPath, loadDirectory);
    return unsubscribe;
  }, [currentPath, loadDirectory]);

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItem(null);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedItem(null);
    }
  };

  const goUp = () => {
    const parent = vfs.getParent(currentPath);
    if (parent !== currentPath) {
      navigateTo(parent);
    }
  };

  const handleItemDoubleClick = (item: FileSystemNode) => {
    if (item.type === 'folder') {
      navigateTo(`${currentPath}/${item.name}`);
    } else {
      openFile(item);
    }
  };

  const openFile = (item: FileSystemNode) => {
    switch (item.ext) {
      case 'txt':
      case 'csv':
      case 'ini':
      case 'js':
      case 'html':
      case 'css':
      case 'json':
        windowActions.openApp('notepad', { 
          title: `Bloc de notas - ${item.name}`
        });
        break;
      case 'mp3':
      case 'm3u':
        windowActions.openApp('player', { title: `Reproductor - ${item.name}` });
        break;
      default:
        break;
    }
  };

  const filteredItems = searchQuery 
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Toolbar */}
      <div className="h-12 bg-[#252535] border-b border-white/5 flex items-center px-3 gap-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={goBack} 
            disabled={historyIndex === 0}
            className="p-2 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          <button 
            onClick={goUp}
            className="p-2 rounded hover:bg-white/10"
          >
            <ArrowUp className="w-4 h-4 text-gray-300" />
          </button>
          <button 
            onClick={loadDirectory}
            className="p-2 rounded hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="flex-1 flex items-center bg-[#1a1a28] rounded px-3 py-1.5 mx-2">
          <Home className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && vfs.exists(currentPath)) {
                navigateTo(currentPath);
              }
            }}
            className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 bg-[#1a1a28] rounded pl-8 pr-3 py-1.5 text-sm text-gray-300 outline-none placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded hover:bg-white/10"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 text-gray-300" /> : <Grid className="w-4 h-4 text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-[#1a1a28] border-r border-white/5 py-2 overflow-y-auto">
          <div className="px-3 py-1 text-xs text-gray-500 uppercase font-semibold">Acceso rápido</div>
          {[
            { name: 'Escritorio', path: 'C:/Users/Usuario/Escritorio', icon: '📌' },
            { name: 'Documentos', path: 'C:/Users/Usuario/Documentos', icon: '📄' },
            { name: 'Descargas', path: 'C:/Users/Usuario/Descargas', icon: '⬇️' },
            { name: 'Imágenes', path: 'C:/Users/Usuario/Imágenes', icon: '🖼️' },
            { name: 'Música', path: 'C:/Users/Usuario/Música', icon: '🎵' },
            { name: 'Vídeos', path: 'C:/Users/Usuario/Vídeos', icon: '🎬' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-white/5 ${
                currentPath === item.path ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
          
          <div className="px-3 py-1 mt-4 text-xs text-gray-500 uppercase font-semibold">Este equipo</div>
          <button
            onClick={() => navigateTo('C:')}
            className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-white/5 ${
              currentPath === 'C:' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300'
            }`}
          >
            <span>💻</span> C:
          </button>
        </div>

        {/* Files Area */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
              {filteredItems.map(item => (
                <div
                  key={item.name}
                  onClick={() => setSelectedItem(item.name)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItem === item.name 
                      ? 'bg-blue-500/30 border border-blue-500/50' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-4xl mb-2">{item.type === 'folder' ? '📁' : getFileIcon(item.ext)}</span>
                  <span className="text-xs text-gray-300 text-center break-all line-clamp-2">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map(item => (
                <div
                  key={item.name}
                  onClick={() => setSelectedItem(item.name)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                    selectedItem === item.name 
                      ? 'bg-blue-500/30 border border-blue-500/50' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl">{item.type === 'folder' ? '📁' : getFileIcon(item.ext)}</span>
                  <span className="flex-1 text-sm text-gray-300">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.type === 'folder' ? 'Carpeta' : item.ext?.toUpperCase() || 'Archivo'}</span>
                  <span className="text-xs text-gray-500 w-20 text-right">{item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''}</span>
                </div>
              ))}
            </div>
          )}
          
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Folder className="w-16 h-16 mb-4 opacity-30" />
              <p>Esta carpeta está vacía</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 bg-[#252535] border-t border-white/5 flex items-center px-3 text-xs text-gray-400">
        <span>{filteredItems.length} elementos</span>
        <span className="mx-2">|</span>
        <span>{items.filter(i => i.type === 'folder').length} carpetas</span>
        <span className="mx-2">|</span>
        <span>{items.filter(i => i.type === 'file').length} archivos</span>
      </div>
    </div>
  );
};
