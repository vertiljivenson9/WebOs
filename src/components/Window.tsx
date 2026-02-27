import { useRef, useEffect, useState, useCallback } from 'react';
import type { WindowState } from '@/types';
import { windowManager } from '@/core/WindowManager';
import { Maximize2, Minus, X, Minimize2 } from 'lucide-react';

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
  onClose?: () => void;
}

// Detectar tipo de dispositivo
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export const Window: React.FC<WindowProps> = ({ windowState, children, onClose }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Actualizar tipo de dispositivo al cambiar tamaño
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMobile || isTablet) return; // No arrastrar en móvil/tablet
    if (windowState.isMaximized) return;
    
    if (e.target === headerRef.current || (e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        winX: windowState.x,
        winY: windowState.y
      };
    }
  }, [windowState.x, windowState.y, windowState.isMaximized, isMobile, isTablet]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isMobile || isTablet) return;
    if (windowState.isMaximized) return;
    
    const touch = e.touches[0];
    if (e.target === headerRef.current || (e.target as HTMLElement).closest('.window-header')) {
      setIsDragging(true);
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        winX: windowState.x,
        winY: windowState.y
      };
    }
  }, [windowState.x, windowState.y, windowState.isMaximized, isMobile, isTablet]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile || isTablet) return;
    if (windowState.isMaximized) return;
    
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: windowState.width,
      height: windowState.height
    };
  }, [windowState.width, windowState.height, windowState.isMaximized, isMobile, isTablet]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = dragStart.current.winX + (e.clientX - dragStart.current.x);
        const newY = dragStart.current.winY + (e.clientY - dragStart.current.y);
        windowManager.moveWindow(windowState.id, newX, newY);
      }
      
      if (isResizing) {
        const newWidth = resizeStart.current.width + (e.clientX - resizeStart.current.x);
        const newHeight = resizeStart.current.height + (e.clientY - resizeStart.current.y);
        windowManager.resizeWindow(windowState.id, newWidth, newHeight);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        const newX = dragStart.current.winX + (touch.clientX - dragStart.current.x);
        const newY = dragStart.current.winY + (touch.clientY - dragStart.current.y);
        windowManager.moveWindow(windowState.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = isDragging ? 'move' : 'nwse-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, windowState.id]);

  const handleFocus = () => {
    windowManager.focusWindow(windowState.id);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) return; // No minimizar en móvil
    windowManager.minimizeWindow(windowState.id);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) return; // No maximizar/restaurar en móvil
    windowManager.toggleMaximize(windowState.id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    windowManager.closeWindow(windowState.id);
    onClose?.();
  };

  // Double-click header to maximize
  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    windowManager.toggleMaximize(windowState.id);
  };

  if (windowState.isMinimized) {
    return null;
  }

  // Estilos responsivos
  const getWindowStyles = () => {
    if (isMobile) {
      // En móvil: pantalla completa
      return {
        left: 0,
        top: 0,
        width: '100vw',
        height: 'calc(100vh - 56px)', // espacio para taskbar más grande en móvil
        zIndex: windowState.zIndex,
        borderRadius: 0,
      };
    }
    
    return {
      left: windowState.x,
      top: windowState.y,
      width: windowState.width,
      height: windowState.height,
      zIndex: windowState.zIndex,
      minWidth: windowState.minWidth,
      minHeight: windowState.minHeight,
      borderRadius: windowState.isMaximized ? 0 : undefined,
    };
  };

  return (
    <div
      ref={windowRef}
      className={`
        window absolute flex flex-col bg-[#1e1e2e] overflow-hidden shadow-2xl border border-white/10
        ${windowState.isFocused ? 'ring-1 ring-blue-500/50' : ''}
        ${isMobile ? 'rounded-none' : 'rounded-lg'}
        ${windowState.isMaximized ? 'rounded-none' : ''}
      `}
      style={getWindowStyles()}
      onMouseDown={handleFocus}
      onTouchStart={handleFocus}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`
          window-header bg-[#252535] flex items-center px-3 select-none cursor-default
          ${isMobile ? 'h-12' : 'h-9'}
        `}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleHeaderDoubleClick}
      >
        <span className={`mr-2 ${isMobile ? 'text-xl' : 'text-lg'}`}>{windowState.icon}</span>
        <span className="flex-1 text-sm text-gray-300 truncate pr-4">{windowState.title}</span>
        
        <div className="window-controls flex items-center gap-1">
          {!isMobile && (
            <button
              onClick={handleMinimize}
              className="w-10 h-7 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded transition-colors"
              title="Minimizar"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={handleMaximize}
              className="w-10 h-7 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded transition-colors"
              title={windowState.isMaximized ? "Restaurar" : "Maximizar"}
            >
              {windowState.isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleClose}
            className={`
              flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white rounded transition-colors
              ${isMobile ? 'w-12 h-8' : 'w-10 h-7'}
            `}
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize Handle - solo en desktop */}
      {!isMobile && !isTablet && !windowState.isMaximized && windowState.isResizable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.2) 50%)'
          }}
        />
      )}
    </div>
  );
};
