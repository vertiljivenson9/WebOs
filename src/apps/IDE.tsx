import { useState, useEffect, useRef } from 'react';
import { vfs, getFileIcon } from '@/core/VFS';
import { 
  Folder, ChevronRight, ChevronDown, Save, Play, 
  Plus, X, Terminal, Layout, Moon, Sun
} from 'lucide-react';

interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  isModified: boolean;
  language: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'javascript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  py: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  php: 'php',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  md: 'markdown',
  txt: 'text',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  vue: 'vue',
  svelte: 'svelte'
};

export const IDE: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentPath] = useState('C:/Users/Usuario/Proyectos');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['WebOS IDE Terminal v1.0', 'Escribe "help" para ver los comandos disponibles.', '']);
  const [terminalInput, setTerminalInput] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Cargar estructura de archivos
  useEffect(() => {
    loadFiles();
    // Crear carpeta de proyectos si no existe
    if (!vfs.exists('C:/Users/Usuario/Proyectos')) {
      vfs.mkdir('C:/Users/Usuario/Proyectos');
      vfs.write('C:/Users/Usuario/Proyectos/README.md', '# Mis Proyectos\n\nBienvenido a tu espacio de desarrollo.');
      vfs.mkdir('C:/Users/Usuario/Proyectos/mi-app');
      vfs.write('C:/Users/Usuario/Proyectos/mi-app/index.html', '<!DOCTYPE html>\n<html>\n<head>\n  <title>Mi App</title>\n</head>\n<body>\n  <h1>¡Hola Mundo!</h1>\n</body>\n</html>');
      vfs.write('C:/Users/Usuario/Proyectos/mi-app/style.css', 'body {\n  font-family: Arial, sans-serif;\n  background: #1a1a2e;\n  color: white;\n}');
      vfs.write('C:/Users/Usuario/Proyectos/mi-app/app.js', '// Mi aplicación\nconsole.log("¡Hola desde WebOS IDE!");\n\nfunction init() {\n  // Tu código aquí\n}\n\ninit();');
      loadFiles();
    }
  }, []);

  const loadFiles = () => {
    const buildFileTree = (path: string): FileNode[] => {
      const items = vfs.list(path);
      return items.map(item => {
        const itemPath = `${path}/${item.name}`;
        const node: FileNode = {
          name: item.name,
          type: item.type,
          path: itemPath,
          isOpen: false
        };
        if (item.type === 'folder' && item.children) {
          node.children = buildFileTree(itemPath);
        }
        return node;
      });
    };

    setFiles(buildFileTree(currentPath));
  };

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return languageMap[ext] || 'text';
  };

  const openFile = (path: string, name: string) => {
    const existingTab = openTabs.find(t => t.path === path);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const content = vfs.read(path) || '';
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name,
      path,
      content,
      isModified: false,
      language: getLanguage(name)
    };

    setOpenTabs([...openTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tab = openTabs.find(t => t.id === tabId);
    
    if (tab?.isModified) {
      if (!confirm(`¿Descartar cambios en ${tab.name}?`)) return;
    }

    const newTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setOpenTabs(tabs => tabs.map(tab => 
      tab.id === tabId 
        ? { ...tab, content: newContent, isModified: true }
        : tab
    ));
  };

  const saveActiveTab = () => {
    const activeTab = openTabs.find(t => t.id === activeTabId);
    if (activeTab) {
      vfs.write(activeTab.path, activeTab.content);
      setOpenTabs(tabs => tabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isModified: false }
          : tab
      ));
    }
  };

  const createNewFile = () => {
    const name = prompt('Nombre del archivo:', 'nuevo.js');
    if (name) {
      const path = `${currentPath}/${name}`;
      vfs.write(path, '');
      loadFiles();
      openFile(path, name);
    }
  };

  const createNewFolder = () => {
    const name = prompt('Nombre de la carpeta:', 'nueva-carpeta');
    if (name) {
      vfs.mkdir(`${currentPath}/${name}`);
      loadFiles();
    }
  };

  const runCode = () => {
    const activeTab = openTabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    setTerminalVisible(true);
    setTerminalOutput(prev => [...prev, `> Ejecutando ${activeTab.name}...`, '']);

    // Simular ejecución
    setTimeout(() => {
      if (activeTab.language === 'javascript') {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(activeTab.content);
          setTerminalOutput(prev => [...prev, `Resultado: ${result}`, '']);
        } catch (err) {
          setTerminalOutput(prev => [...prev, `Error: ${err}`, '']);
        }
      } else {
        setTerminalOutput(prev => [...prev, `Ejecución de ${activeTab.language} no soportada en modo demo`, '']);
      }
    }, 500);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    setTerminalOutput(prev => [...prev, `$ ${terminalInput}`]);
    
    const cmd = terminalInput.trim().toLowerCase();
    
    if (cmd === 'help') {
      setTerminalOutput(prev => [...prev, 
        'Comandos disponibles:', 
        '  help     - Mostrar esta ayuda',
        '  clear    - Limpiar terminal',
        '  ls       - Listar archivos',
        '  pwd      - Mostrar directorio actual',
        '  run      - Ejecutar archivo activo',
        '']);
    } else if (cmd === 'clear') {
      setTerminalOutput(['WebOS IDE Terminal v1.0', '']);
    } else if (cmd === 'ls') {
      const items = vfs.list(currentPath);
      setTerminalOutput(prev => [...prev, ...items.map(i => i.name), '']);
    } else if (cmd === 'pwd') {
      setTerminalOutput(prev => [...prev, currentPath, '']);
    } else if (cmd === 'run') {
      runCode();
    } else {
      setTerminalOutput(prev => [...prev, `Comando no encontrado: ${cmd}`, '']);
    }

    setTerminalInput('');
  };

  const activeTab = openTabs.find(t => t.id === activeTabId);

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-[#1e1e2e]' : 'bg-white'}`}>
      {/* Toolbar */}
      <div className={`h-12 ${darkMode ? 'bg-[#252535]' : 'bg-gray-100'} border-b ${darkMode ? 'border-white/5' : 'border-gray-200'} flex items-center px-3 gap-2`}>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={`p-2 rounded hover:bg-white/10 ${sidebarVisible ? 'text-blue-400' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title="Toggle Sidebar"
          >
            <Layout className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button 
            onClick={createNewFile}
            className={`p-2 rounded hover:bg-white/10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title="Nuevo archivo"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={saveActiveTab}
            disabled={!activeTab?.isModified}
            className={`p-2 rounded hover:bg-white/10 disabled:opacity-30 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title="Guardar"
          >
            <Save className="w-5 h-5" />
          </button>
          <button 
            onClick={runCode}
            disabled={!activeTab}
            className={`p-2 rounded hover:bg-white/10 disabled:opacity-30 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title="Ejecutar"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setTerminalVisible(!terminalVisible)}
            className={`p-2 rounded hover:bg-white/10 ${terminalVisible ? 'text-blue-400' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title="Terminal"
          >
            <Terminal className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded hover:bg-white/10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        {sidebarVisible && (
          <div className={`w-64 ${darkMode ? 'bg-[#1a1a28]' : 'bg-gray-50'} border-r ${darkMode ? 'border-white/5' : 'border-gray-200'} flex flex-col`}>
            <div className={`h-10 ${darkMode ? 'bg-[#252535]' : 'bg-gray-100'} flex items-center justify-between px-3`}>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>EXPLORADOR</span>
              <div className="flex gap-1">
                <button 
                  onClick={createNewFile}
                  className={`p-1 rounded hover:bg-white/10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  onClick={createNewFolder}
                  className={`p-1 rounded hover:bg-white/10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <Folder className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <FileTree 
                nodes={files} 
                onFileClick={openFile} 
                darkMode={darkMode}
              />
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className={`h-9 ${darkMode ? 'bg-[#252535]' : 'bg-gray-100'} flex items-center overflow-x-auto`}>
              {openTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`h-full px-3 flex items-center gap-2 text-sm border-r ${darkMode ? 'border-white/5' : 'border-gray-200'} min-w-[120px] max-w-[200px] group ${
                    activeTabId === tab.id 
                      ? darkMode ? 'bg-[#1e1e2e] text-white' : 'bg-white text-gray-800'
                      : darkMode ? 'text-gray-400 hover:bg-[#2a2a3d]' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{getFileIcon(tab.name.split('.').pop())}</span>
                  <span className="flex-1 truncate">{tab.name}{tab.isModified && ' •'}</span>
                  <button
                    onClick={(e) => closeTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 relative">
            {activeTab ? (
              <textarea
                ref={editorRef}
                value={activeTab.content}
                onChange={(e) => updateTabContent(activeTab.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    saveActiveTab();
                  }
                }}
                className={`w-full h-full p-4 font-mono text-sm resize-none outline-none ${
                  darkMode 
                    ? 'bg-[#1e1e2e] text-gray-200' 
                    : 'bg-white text-gray-800'
                }`}
                spellCheck={false}
                placeholder="// Escribe tu código aquí..."
              />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="text-6xl mb-4">💻</span>
                <p>Selecciona un archivo para editar</p>
                <p className="text-sm mt-2">o crea uno nuevo</p>
              </div>
            )}
          </div>

          {/* Terminal */}
          {terminalVisible && (
            <div className={`h-48 ${darkMode ? 'bg-[#0c0c0c]' : 'bg-gray-900'} border-t ${darkMode ? 'border-white/5' : 'border-gray-700'} flex flex-col`}>
              <div className={`h-8 ${darkMode ? 'bg-[#1a1a28]' : 'bg-gray-800'} flex items-center justify-between px-3`}>
                <span className="text-xs text-gray-400">TERMINAL</span>
                <button 
                  onClick={() => setTerminalVisible(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div 
                ref={terminalRef}
                className="flex-1 overflow-auto p-3 font-mono text-sm"
              >
                {terminalOutput.map((line, i) => (
                  <div key={i} className={`${line.startsWith('$') ? 'text-green-400' : line.startsWith('Error') ? 'text-red-400' : 'text-gray-300'}`}>
                    {line}
                  </div>
                ))}
                <form onSubmit={handleTerminalSubmit} className="flex items-center mt-2">
                  <span className="text-green-400 mr-2">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    className="flex-1 bg-transparent text-gray-200 outline-none font-mono text-sm"
                    spellCheck={false}
                  />
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className={`h-6 ${darkMode ? 'bg-[#0078d4]' : 'bg-blue-600'} flex items-center px-3 text-xs text-white`}>
        <div className="flex items-center gap-4">
          {activeTab && (
            <>
              <span>{activeTab.language.toUpperCase()}</span>
              <span>{activeTab.isModified ? 'Modificado' : 'Guardado'}</span>
              <span>{activeTab.content.length} caracteres</span>
            </>
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>WebOS IDE</span>
        </div>
      </div>
    </div>
  );
};

// Componente recursivo para el árbol de archivos
const FileTree: React.FC<{
  nodes: FileNode[];
  onFileClick: (path: string, name: string) => void;
  darkMode: boolean;
  level?: number;
}> = ({ nodes, onFileClick, darkMode, level = 0 }) => {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newOpen = new Set(openFolders);
    if (newOpen.has(path)) {
      newOpen.delete(path);
    } else {
      newOpen.add(path);
    }
    setOpenFolders(newOpen);
  };

  return (
    <div className="space-y-0.5">
      {nodes.map(node => (
        <div key={node.path}>
          {node.type === 'folder' ? (
            <div>
              <button
                onClick={() => toggleFolder(node.path)}
                className={`w-full flex items-center gap-1 px-2 py-1 rounded text-sm ${darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-200'}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
              >
                {openFolders.has(node.path) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>📁</span>
                <span className="truncate">{node.name}</span>
              </button>
              {openFolders.has(node.path) && node.children && (
                <FileTree 
                  nodes={node.children} 
                  onFileClick={onFileClick} 
                  darkMode={darkMode}
                  level={level + 1}
                />
              )}
            </div>
          ) : (
            <button
              onClick={() => onFileClick(node.path, node.name)}
              className={`w-full flex items-center gap-1 px-2 py-1 rounded text-sm ${darkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-200'}`}
              style={{ paddingLeft: `${level * 12 + 24}px` }}
            >
              <span>{getFileIcon(node.name.split('.').pop())}</span>
              <span className="truncate">{node.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
