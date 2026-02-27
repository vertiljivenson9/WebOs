import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { useWebOSStore, windowActions } from '@/store';
import { useWindows } from '@/hooks/useWindows';
import type { AppDefinition } from '@/types';

// Lazy loading de apps (mejora 3)
const Explorer = lazy(() => import('@/apps/Explorer'));
const Notepad = lazy(() => import('@/apps/Notepad'));
const Calculator = lazy(() => import('@/apps/Calculator'));
const Terminal = lazy(() => import('@/apps/Terminal'));
const Paint = lazy(() => import('@/apps/Paint'));
const Settings = lazy(() => import('@/apps/Settings'));
const Browser = lazy(() => import('@/apps/Browser'));
const TaskManager = lazy(() => import('@/apps/TaskManager'));
const MediaPlayer = lazy(() => import('@/apps/MediaPlayer'));
const AppStore = lazy(() => import('@/apps/AppStore'));
const IDE = lazy(() => import('@/apps/IDE'));

// Skeleton loader para ventanas (mejora 3)
const WindowSkeleton = () => (
  <div className="w-full h-full bg-[#1e1e2e] animate-pulse">
    <div className="h-8 bg-[#2d2d3a] m-1 rounded" />
    <div className="grid grid-cols-3 gap-2 p-4">
      <div className="h-20 bg-[#2d2d3a] rounded" />
      <div className="h-20 bg-[#2d2d3a] rounded" />
      <div className="h-20 bg-[#2d2d3a] rounded" />
    </div>
  </div>
);

// Sistema de plugins (mejora 10) - simplificado por ahora
interface Plugin {
  id: string;
  name: string;
  icon: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

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

// Plugins instalados (se llenaría desde la store)
const installedPlugins: Plugin[] = []; // De momento vacío

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

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Mejora 1: Memoización del renderizado de ventanas
const WindowsRenderer = React.memo(({ windows }: { windows: ReturnType<typeof useWindows> }) => (
  <>
    {windows.map(windowState => (
      <Window key={windowState.id} windowState={windowState}>
        <Suspense fallback={<WindowSkeleton />}>
          {(() => {
            switch (windowState.appId) {
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
              default: {
                // Buscar en plugins
                const plugin = installedPlugins.find(p => p.id === windowState.appId);
                if (plugin) {
                  const PluginComponent = plugin.component;
                  return <PluginComponent />;
                }
                return <div className="p-4 text-gray-400">Aplicación no encontrada</div>;
              }
            }
          })()}
        </Suspense>
      </Window>
    ))}
  </>
));

export const Desktop: React.FC = () => {
  const windows = useWindows();
  const { settings, startMenuOpen, setStartMenuOpen, registerApp } = useWebOSStore();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Registrar apps del sistema
  useEffect(() => {
    systemApps.forEach(app => registerApp(app));
  }, [registerApp]);

  // Mejora 5: Atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        windowActions.openApp('notepad');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 't') {
        e.preventDefault();
        windowActions.openApp('terminal');
      }
      if (e.key === 'Escape' && startMenuOpen) {
        setStartMenuOpen(false);
      }
      // Win + E para abrir explorador
      if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        windowActions.openApp('explorer');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startMenuOpen, setStartMenuOpen]);

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  }, []);

  const handleIconClick = useCallback((appId: string) => {
    if (isTouchDevice()) {
      if (selectedIcon === appId) {
        windowActions.openApp(appId);
        setSelectedIcon(null);
      } else {
        setSelectedIcon(appId);
      }
    } else {
      setSelectedIcon(appId);
    }
  }, [selectedIcon]);

  const handleIconDoubleClick = useCallback((appId: string) => {
    windowActions.openApp(appId);
  }, []);

  const wallpaperStyle = useMemo(() => {
    const wallpapers: Record<string, string> = {
      'gradient-1': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
      'gradient-2': 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      'gradient-3': 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
      'gradient-4': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      'gradient-5': 'linear-gradient(135deg, #000428, #004e92)',
      'gradient-6': 'linear-gradient(135deg, #141e30, #243b55)',
    };
    return { background: wallpapers[settings.wallpaper] || wallpapers['gradient-1'] };
  }, [settings.wallpaper]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={wallpaperStyle}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Desktop Icons */}
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

      {/* Windows memoizadas */}
      <WindowsRenderer windows={windows} />

      {/* Start Menu */}
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}

      {/* Taskbar */}
      <Taskbar />

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-[#2a2a3a] border border-white/10 rounded-lg shadow-xl py-2 z-[99999] min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => windowActions.openApp('ide')} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2">
            <span>💻</span> Abrir IDE
          </button>
          <button onClick={() => windowActions.openApp('notepad')} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2">
            <span>📄</span> Nuevo documento
          </button>
          <button onClick={() => windowActions.openApp('terminal')} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2">
            <span>💻</span> Abrir terminal aquí
          </button>
          <div className="h-px bg-white/10 my-1" />
          <button onClick={() => windowActions.openApp('settings')} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2">
            <span>⚙️</span> Configuración de pantalla
          </button>
          <button onClick={() => window.location.reload()} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2">
            <span>↻</span> Actualizar
          </button>
        </div>
      )}
    </div>
  );
};