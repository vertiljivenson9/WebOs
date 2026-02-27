import { useState, useEffect, useRef } from 'react';
import { vfs } from '@/core/VFS';
import { Save, FilePlus, FolderOpen, FileText } from 'lucide-react';

interface NotepadProps {
  filePath?: string;
}

export const Notepad: React.FC<NotepadProps> = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [currentPath, setCurrentPath] = useState<string | null>(filePath || null);
  const [isModified, setIsModified] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (filePath) {
      const fileContent = vfs.read(filePath);
      if (fileContent !== null) {
        setContent(fileContent);
      }
    }
  }, [filePath]);

  const handleNew = () => {
    if (isModified && !confirm('¿Descartar cambios?')) return;
    setContent('');
    setCurrentPath(null);
    setIsModified(false);
  };

  const handleOpen = () => {
    const path = prompt('Ruta del archivo:', 'C:/Users/Usuario/Documentos/archivo.txt');
    if (path) {
      const fileContent = vfs.read(path);
      if (fileContent !== null) {
        setContent(fileContent);
        setCurrentPath(path);
        setIsModified(false);
      } else {
        alert('Archivo no encontrado');
      }
    }
  };

  const handleSave = () => {
    if (currentPath) {
      vfs.write(currentPath, content);
      setIsModified(false);
    } else {
      handleSaveAs();
    }
  };

  const handleSaveAs = () => {
    const path = prompt('Guardar como:', 'C:/Users/Usuario/Documentos/nuevo.txt');
    if (path) {
      vfs.write(path, content);
      setCurrentPath(path);
      setIsModified(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsModified(true);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleNew();
            break;
          case 'o':
            e.preventDefault();
            handleOpen();
            break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              handleSaveAs();
            } else {
              handleSave();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, currentPath, isModified]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Menu Bar */}
      <div className="h-9 bg-[#252535] border-b border-white/5 flex items-center px-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handleNew}
            className="px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 rounded flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            Nuevo
          </button>
          <button
            onClick={handleOpen}
            className="px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 rounded flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Abrir
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 rounded flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
          <div className="w-px h-5 bg-white/10 mx-2" />
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-3 py-1.5 text-sm rounded flex items-center gap-2 ${
              wordWrap ? 'bg-blue-500/30 text-blue-400' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            Ajuste de línea
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#252535] border-b border-white/5 flex items-center px-3 text-xs text-gray-400 justify-between">
        <span>{currentPath || 'Sin título'}{isModified && ' *'}</span>
        <span>{content.length} caracteres | {content.split(/\s+/).filter(Boolean).length} palabras</span>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        className="flex-1 bg-[#1e1e2e] text-gray-200 p-4 font-mono text-sm resize-none outline-none"
        style={{ 
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowX: wordWrap ? 'hidden' : 'auto'
        }}
        spellCheck={false}
        placeholder="Escribe aquí..."
      />
    </div>
  );
};
