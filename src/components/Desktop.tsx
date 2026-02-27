import { useState, useEffect, useCallback } from 'react';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { useWebOSStore, windowActions } from '@/store';
import { useWindows } from '@/hooks/useWindows';
import type { AppDefinition } from '@/types';

// Import all apps
import { Explorer } from '@/apps/Explorer';
import { Notepad } from '@/apps/Notepad';
import { Calculator } from '@/apps/Calculator';
import { Terminal } from '@/apps/Terminal';
import { Paint } from '@/apps/Paint';
import { Settings } from '@/apps/Settings';
import { Browser } from '@/apps/Browser';
import { TaskManager } from '@/apps/TaskManager';
import { MediaPlayer } from '@/apps/MediaPlayer';
import { AppStore } from '@/apps/AppStore';
import { IDE } from '@/apps/IDE';

// Register all apps
const systemApps: AppDefinition[] = [
  { id: 'explorer', name: 'Explorador', title: 'Explorador de archivos', icon: '📁', category: 'system', defaultWidth: 900, defaultHeight: 600, minWidth: 320, minHeight: 300, isResizable: true },
  { id: 'notepad', name: 'Bloc de notas', title: 'Bloc de notas', icon: '📝', category: 'system', defaultWidth: 700, defaultHeight: 500, minWidth: 280, minHeight: 200, isResizable: true },
  { id: 'calculator', name: 'Calculadora', title: 'Calculadora', icon: '🔢', category: 'system', defaultWidth: 340, defaultHeight: 520, minWidth: 320, minHeight: 480, singleton: true, isResizable: false },
  { id: 'terminal', name: 'Terminal', title: 'Terminal', icon: '💻', category: 'system', defaultWidth: 800, defaultHeight: 500, minWidth: 320, minHeight: 250, isResizable: true },
  { id: 'paint', name: 'Paint', title: 'Paint', icon: '🎨', category: 'system', defaultWidth: 900, defaultHeight: 650, minWidth: 400, minHeight: 350, isResizable: true },
  { id: 'settings', name: 'Configuración', title: 'Configuración', icon: '⚙️', category: 'system', defaultWidth: 900, defaultHeight: 600, minWidth: 350, minHeight: 400, singleton: true, isResizable: true },
  { id: 'browser', name: 'Navegador', title: 'Navegador', icon: '🌐', category: 'system', defaultWidth: 1000, defaultHeight: 700, minWidth: 320, minHeight: 400, isResizable: true },
  { id: 'taskmgr', name: 'Admin. Tareas', title: 'Administrador de tareas', icon: '📊', category: 'system', defaultWidth: 700, defaultHeight: 500, minWidth: 350, minHeight: 350, singleton: true, isResizable: true },
  { id: 'player', name: 'Reproductor', title: 'Reproductor', icon: '🎵', category: 'media', defaultWidth: 400, defaultHeight: 600, minWidth: 320, minHeight: 450, singleton: true, isResizable: true },
  { id: 'store', name: 'Tienda', title: 'WebOS Store', icon: '🏪', category: 'system', defaultWidth: 1000, defaultHeight: 700, minWidth: 320, minHeight: 450, singleton: true, isResizable: true },
  { id: 'ide', name: 'WebOS IDE', title: 'WebOS IDE', icon: '💻', category: 'development', defaultWidth: 1200, defaultHeight: 800, minWidth: 350, minHeight: 400, singleton: true, isResizable: true },
];

// Desktop icons - organizados en grid responsivo
const desktopIcons = [
  { appId: 'ide', name: 'WebOS IDE', icon: '💻' },
  { appId: 'explorer', name: 'Explorador', icon: '📁' },
  { appId: 'notepad', name: 'Bloc de notas', icon: '📝' },
  { appId: 'terminal', name: 'Terminal', icon: '💻' },
  { appId: 'calculator', name: 'Calculadora', icon: '🔢' },
  { appId: 'paint', name: 'Paint', icon: '🎨' },
  { appId: 'browser', name: 'Navegador', icon: '🌐' },
  { appId: 'settings', name: 'Configuración', icon: '⚙️' },
  { appId: 'player', name: 'Reproductor', icon: '🎵' },
  { appId: 'taskmgr', name: 'Admin. Tareas', icon: '📊' },
  { appId: 'store', name: 'Tienda', icon: '🏪' },
];

// Detectar si es dispositivo táctil
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const Desktop: React.FC = () => {
  const windows = useWindows();
  const { settings, startMenuOpen, setStartMenuOpen, registerApp } = useWebOSStore();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Register all system apps
  useEffect(() => {
    systemApps.forEach(app => registerApp(app));
  }, [registerApp]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  }, []);

  const handleIconClick = (appId: string) => {
    if (isTouchDevice()) {
      // En dispositivos táctiles: un tap selecciona, doble tap abre
      if (selectedIcon === appId) {
        windowActions.openApp(appId);
        setSelectedIcon(null);
      } else {
        setSelectedIcon(appId);
      }
    } else {
      setSelectedIcon(appId);
    }
  };

  const handleIconDoubleClick = (appId: string) => {
    windowActions.openApp(appId);
  };

  const renderApp = (appId: string) => {
    switch (appId) {
      case 'explorer': return <Explorer />;
      case 'notepad': return <Notepad />;
      case 'calculator': return <Calculator />;
      case 'terminal': return <Terminal />;
      case 'paint': return <Paint />;
      case 'settings': return <Settings />;
      case 'browser': return <Browser />;
      case 'taskmgr': return <TaskManager />;
      case 'player': return <MediaPlayer />;
      case 'store': return <AppStore />;
      case 'ide': return <IDE />;
      default: return <div className="p-4 text-gray-400">Aplicación no encontrada</div>;
    }
  };

  const getWallpaperStyle = () => {
    const wallpapers: Record<string, string> = {
      'gradient-1': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
      'gradient-2': 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      'gradient-3': 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
      'gradient-4': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      'gradient-5': 'linear-gradient(135deg, #000428, #004e92)',
      'gradient-6': 'linear-gradient(135deg, #141e30, #243b55)',
    };
    return { background: wallpapers[settings.wallpaper] || wallpapers['gradient-1'] };
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={getWallpaperStyle()}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Desktop Icons - Grid responsivo */}
      <div className={`
        absolute top-4 left-4 right-4 
        grid gap-2
        ${isMobile ? 'grid-cols-4' : 'grid-cols-[repeat(auto-fill,minmax(80px,1fr))]'}
        max-w-[calc(100vw-2rem)]
      `}>
        {desktopIcons.map((icon, index) => (
          <button
            key={icon.appId}
            onClick={() => handleIconClick(icon.appId)}
            onDoubleClick={() => handleIconDoubleClick(icon.appId)}
            className={`
              flex flex-col items-center gap-1 p-2 rounded-lg transition-all
              ${selectedIcon === icon.appId 
                ? 'bg-blue-500/30 border border-blue-500/50' 
                : 'hover:bg-white/10'
              }
              ${isMobile ? 'touch-manipulation' : ''}
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className={`filter drop-shadow-lg ${isMobile ? 'text-3xl' : 'text-4xl'}`}>{icon.icon}</span>
            <span className={`
              text-white text-center text-shadow break-words w-full leading-tight
              ${isMobile ? 'text-[10px]' : 'text-xs'}
            `}>
              {icon.name}
            </span>
          </button>
        ))}
      </div>

      {/* Windows */}
      <div className="absolute inset-0 pointer-events-none">
        {windows.map(windowState => (
          <div key={windowState.id} className="pointer-events-auto">
            <Window windowState={windowState}>
              {renderApp(windowState.appId)}
            </Window>
          </div>
        ))}
      </div>

      {/* Start Menu */}
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}

      {/* Taskbar */}
      <Taskbar />

      {/* Desktop Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-[#2a2a3a] border border-white/10 rounded-lg shadow-xl py-2 z-[99999] min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button 
            onClick={() => {
              windowActions.openApp('ide');
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <span>💻</span> Abrir IDE
          </button>
          <button 
            onClick={() => {
              windowActions.openApp('notepad');
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <span>📄</span> Nuevo documento
          </button>
          <button 
            onClick={() => {
              windowActions.openApp('terminal');
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <span>💻</span> Abrir terminal aquí
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button 
            onClick={() => windowActions.openApp('settings')}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <span>⚙️</span> Configuración de pantalla
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
          >
            <span>↻</span> Actualizar
          </button>
        </div>
      )}
    </div>
  );
};
