import { useEffect } from 'react';
import { useWebOSStore, windowActions } from '@/store';
import { windowManager } from '@/core/WindowManager';
import { BootScreen } from '@/components/BootScreen';
import { LoginScreen } from '@/components/LoginScreen';
import { Desktop } from '@/components/Desktop';
import { NotificationContainer } from '@/components/Notification';
import './App.css';

function App() {
  const { bootStage, setStartMenuOpen } = useWebOSStore();

  // Manejar cambio de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      // Notificar al window manager sobre el cambio de tamaño
      windowManager.handleResize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close start menu
      if (e.key === 'Escape') {
        setStartMenuOpen(false);
      }

      // Win key simulation (Meta key)
      if (e.metaKey || e.key === 'Meta') {
        e.preventDefault();
        const { startMenuOpen, setStartMenuOpen } = useWebOSStore.getState();
        setStartMenuOpen(!startMenuOpen);
      }

      // Ctrl + E = Explorer
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        windowActions.openApp('explorer');
      }

      // Ctrl + Shift + T = Terminal
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        windowActions.openApp('terminal');
      }

      // Ctrl + Alt + Delete = Task Manager
      if (e.ctrlKey && e.altKey && e.key === 'Delete') {
        e.preventDefault();
        windowActions.openApp('taskmgr');
      }

      // F11 = Toggle fullscreen (solo en desktop)
      if (e.key === 'F11') {
        const focusedWindow = windowManager.getFocusedWindow();
        if (focusedWindow && window.innerWidth >= 640) {
          e.preventDefault();
          windowManager.toggleMaximize(focusedWindow.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStartMenuOpen]);

  // Prevent context menu on desktop (custom one will be shown)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Solo prevenir en el fondo del escritorio
      if ((e.target as HTMLElement).closest('.desktop-background')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none">
      {bootStage === 'boot' && <BootScreen />}
      {bootStage === 'login' && <LoginScreen />}
      {bootStage === 'desktop' && (
        <>
          <Desktop />
          <NotificationContainer />
        </>
      )}
    </div>
  );
}

export default App;
