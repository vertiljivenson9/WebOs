import { useState, useRef, useEffect } from 'react';
import { vfs } from '@/core/VFS';
import { windowActions } from '@/store';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'info';
}

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'WebOS Professional [Versión 11.0.26100]', type: 'info' },
    { text: '(c) 2026 WebOS Corporation. Todos los derechos reservados.', type: 'info' },
    { text: '', type: 'output' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [cwd, setCwd] = useState('C:/Users/Usuario');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = (text: string, type: TerminalLine['type'] = 'output') => {
    setLines(prev => [...prev, { text, type }]);
  };

  const executeCommand = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addLine(`${cwd}> ${trimmed}`, 'input');

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addLine('Comandos disponibles:', 'info');
        addLine('  dir/ls        - Listar archivos', 'output');
        addLine('  cd <ruta>     - Cambiar directorio', 'output');
        addLine('  type/cat      - Ver contenido de archivo', 'output');
        addLine('  echo          - Imprimir texto', 'output');
        addLine('  mkdir         - Crear carpeta', 'output');
        addLine('  del/rm        - Eliminar archivo', 'output');
        addLine('  cls/clear     - Limpiar pantalla', 'output');
        addLine('  pwd           - Directorio actual', 'output');
        addLine('  date/time     - Fecha y hora', 'output');
        addLine('  whoami        - Usuario actual', 'output');
        addLine('  systeminfo    - Información del sistema', 'output');
        addLine('  tree          - Árbol de directorios', 'output');
        addLine('  calc          - Calculadora', 'output');
        addLine('  open          - Abrir aplicación', 'output');
        addLine('  exit          - Cerrar terminal', 'output');
        break;

      case 'dir':
      case 'ls':
        const items = vfs.list(cwd);
        addLine(` Directorio de ${cwd}\n`, 'info');
        items.forEach(item => {
          const type = item.type === 'folder' ? '<DIR>' : '     ';
          const size = item.size ? `${item.size.toString().padStart(8)} bytes` : '             ';
          const date = new Date(item.modifiedAt).toLocaleDateString('es-ES');
          addLine(`  ${date}  ${type}  ${size}  ${item.name}`, 'output');
        });
        addLine(`\n  ${items.length} elemento(s)`, 'info');
        break;

      case 'cd':
        if (!args[0] || args[0] === '.') break;
        if (args[0] === '..') {
          const parent = vfs.getParent(cwd);
          if (parent !== cwd) setCwd(parent);
        } else if (args[0].startsWith('C:') || args[0].startsWith('/')) {
          const newPath = args[0].replace(/\//g, '/');
          if (vfs.exists(newPath)) {
            setCwd(newPath);
          } else {
            addLine(`El sistema no puede encontrar la ruta especificada.`, 'error');
          }
        } else {
          const newPath = `${cwd}/${args[0]}`;
          if (vfs.exists(newPath)) {
            setCwd(newPath);
          } else {
            addLine(`El sistema no puede encontrar la ruta especificada.`, 'error');
          }
        }
        break;

      case 'type':
      case 'cat':
        if (!args[0]) {
          addLine('Uso: type <archivo>', 'error');
        } else {
          const filePath = args[0].includes(':') ? args[0] : `${cwd}/${args[0]}`;
          const content = vfs.read(filePath);
          if (content !== null) {
            content.split('\n').forEach(line => addLine(line, 'output'));
          } else {
            addLine(`El sistema no puede encontrar el archivo especificado.`, 'error');
          }
        }
        break;

      case 'echo':
        addLine(args.join(' '), 'output');
        break;

      case 'mkdir':
        if (!args[0]) {
          addLine('Uso: mkdir <nombre>', 'error');
        } else {
          if (vfs.mkdir(`${cwd}/${args[0]}`)) {
            addLine(`Carpeta creada: ${args[0]}`, 'info');
          } else {
            addLine('No se pudo crear la carpeta', 'error');
          }
        }
        break;

      case 'del':
      case 'rm':
        if (!args[0]) {
          addLine('Uso: del <archivo>', 'error');
        } else {
          if (vfs.delete(`${cwd}/${args[0]}`)) {
            addLine(`Eliminado: ${args[0]}`, 'info');
          } else {
            addLine('No se pudo eliminar', 'error');
          }
        }
        break;

      case 'cls':
      case 'clear':
        setLines([]);
        break;

      case 'pwd':
        addLine(cwd, 'output');
        break;

      case 'date':
        addLine(new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }), 'output');
        break;

      case 'time':
        addLine(new Date().toLocaleTimeString('es-ES'), 'output');
        break;

      case 'whoami':
        addLine('WebOS\\Usuario', 'output');
        break;

      case 'hostname':
        addLine('DESKTOP-WEBOS-PRO', 'output');
        break;

      case 'systeminfo':
        addLine('Nombre del SO:      WebOS 11 Professional', 'output');
        addLine('Versión:            11.0.26100', 'output');
        addLine('Fabricante:         WebOS Corporation', 'output');
        addLine('Arquitectura:       x64 (Virtual)', 'output');
        addLine('Procesador:         WebCore vCPU @ Browser', 'output');
        addLine('Memoria RAM:        Virtual (Ilimitada)', 'output');
        addLine(`Hora del sistema:   ${new Date().toLocaleString('es-ES')}`, 'output');
        addLine('Plataforma:         ' + navigator.platform, 'output');
        addLine('User Agent:         ' + navigator.userAgent.substring(0, 50) + '...', 'output');
        break;

      case 'tree':
        addLine(cwd, 'output');
        vfs.tree(cwd).forEach(line => addLine(line, 'output'));
        break;

      case 'calc':
        try {
          const expr = args.join(' ').replace(/[^0-9+\-*/.()\s]/g, '');
          // eslint-disable-next-line no-eval
          const result = eval(expr);
          addLine(`  = ${result}`, 'output');
        } catch {
          addLine('Error en la expresión', 'error');
        }
        break;

      case 'open':
        if (!args[0]) {
          addLine('Uso: open <app>', 'error');
        } else {
          const appMap: Record<string, string> = {
            'notepad': 'notepad',
            'calc': 'calculator',
            'explorer': 'explorer',
            'paint': 'paint',
            'browser': 'browser',
            'settings': 'settings',
            'player': 'player'
          };
          const appId = appMap[args[0].toLowerCase()];
          if (appId) {
            windowActions.openApp(appId);
            addLine(`Abriendo ${args[0]}...`, 'info');
          } else {
            addLine(`Aplicación no encontrada: ${args[0]}`, 'error');
          }
        }
        break;

      case 'exit':
        // Close terminal window
        break;

      default:
        addLine(`'${command}' no se reconoce como un comando interno o externo.`, 'error');
        addLine('Escribe "help" para ver la lista de comandos.', 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    setHistory([...history, currentInput]);
    setHistoryIndex(-1);
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      className="h-full flex flex-col bg-[#0c0c0c] font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-4"
      >
        {lines.map((line, i) => (
          <div 
            key={i} 
            className={`whitespace-pre-wrap break-all ${
              line.type === 'input' ? 'text-[#5cdb5c]' :
              line.type === 'error' ? 'text-[#f55]' :
              line.type === 'info' ? 'text-[#888]' :
              'text-[#ccc]'
            }`}
          >
            {line.text}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-[#5cdb5c] mr-2">{cwd}&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#ccc] outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};
