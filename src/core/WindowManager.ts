import type { WindowState, AppDefinition } from '@/types';

// Detectar tipo de dispositivo
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Obtener tamaño máximo de ventana según dispositivo
function getMaxWindowSize() {
  const device = getDeviceType();
  const taskbarHeight = device === 'mobile' ? 56 : 48;
  
  return {
    width: window.innerWidth,
    height: window.innerHeight - taskbarHeight,
    taskbarHeight
  };
}

// Ajustar dimensiones de ventana según dispositivo
function getResponsiveWindowSize(
  defaultWidth: number, 
  defaultHeight: number
): { width: number; height: number } {
  const device = getDeviceType();
  const { width: maxWidth, height: maxHeight } = getMaxWindowSize();
  
  // En móvil: pantalla completa
  if (device === 'mobile') {
    return { width: maxWidth, height: maxHeight };
  }
  
  // En tablet: 90% de pantalla
  if (device === 'tablet') {
    return {
      width: Math.min(defaultWidth, Math.floor(maxWidth * 0.95)),
      height: Math.min(defaultHeight, Math.floor(maxHeight * 0.95))
    };
  }
  
  // En desktop: tamaño por defecto o máximo
  return {
    width: Math.min(defaultWidth, maxWidth),
    height: Math.min(defaultHeight, maxHeight)
  };
}

// Asegurar que la ventana esté dentro de los límites
function clampWindowPosition(
  x: number, 
  y: number, 
  width: number, 
  height: number
): { x: number; y: number } {
  const { width: maxWidth, height: maxHeight } = getMaxWindowSize();
  
  return {
    x: Math.max(0, Math.min(x, maxWidth - Math.min(width, maxWidth))),
    y: Math.max(0, Math.min(y, maxHeight - Math.min(height, maxHeight)))
  };
}

export class WindowManager {
  private windows: Map<string, WindowState> = new Map();
  private apps: Map<string, AppDefinition> = new Map();
  private zIndexCounter: number = 100;
  private focusedWindowId: string | null = null;
  private listeners: Set<(windows: WindowState[]) => void> = new Set();
  private taskbarListeners: Set<(items: TaskbarItem[]) => void> = new Set();

  registerApp(app: AppDefinition): void {
    this.apps.set(app.id, app);
  }

  createWindow(appId: string, options?: Partial<WindowState>): WindowState | null {
    const app = this.apps.get(appId);
    if (!app) {
      console.error(`App ${appId} not found`);
      return null;
    }

    const device = getDeviceType();

    // Check if singleton app already has a window
    if (app.singleton) {
      const existingWindow = Array.from(this.windows.values()).find(w => w.appId === appId);
      if (existingWindow) {
        this.focusWindow(existingWindow.id);
        return existingWindow;
      }
    }

    const id = `win-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calcular tamaño responsivo
    const { width: responsiveWidth, height: responsiveHeight } = getResponsiveWindowSize(
      options?.width || app.defaultWidth,
      options?.height || app.defaultHeight
    );
    
    // En móvil: siempre maximizado (pantalla completa)
    const isMobile = device === 'mobile';
    
    // Calcular posición centrada con offset
    const offset = isMobile ? 0 : (this.windows.size * 20) % 100;
    const { width: maxWidth, height: maxHeight } = getMaxWindowSize();
    
    const targetX = isMobile ? 0 : Math.max(0, Math.min((maxWidth - responsiveWidth) / 2 + offset, maxWidth - responsiveWidth));
    const targetY = isMobile ? 0 : Math.max(0, Math.min((maxHeight - responsiveHeight) / 2 + offset, maxHeight - responsiveHeight));
    
    // Asegurar que esté dentro de límites
    const { x, y } = clampWindowPosition(targetX, targetY, responsiveWidth, responsiveHeight);
    
    const windowState: WindowState = {
      id,
      appId,
      title: options?.title || app.title,
      icon: options?.icon || app.icon,
      x,
      y,
      width: responsiveWidth,
      height: responsiveHeight,
      minWidth: isMobile ? responsiveWidth : app.minWidth,
      minHeight: isMobile ? responsiveHeight : app.minHeight,
      isMinimized: false,
      isMaximized: isMobile, // En móvil siempre maximizado
      isFocused: true,
      isResizable: !isMobile && (app.isResizable ?? true),
      zIndex: ++this.zIndexCounter,
      ...options
    };

    this.windows.set(id, windowState);
    this.focusedWindowId = id;
    this.notifyListeners();
    return windowState;
  }

  closeWindow(id: string): void {
    const window = this.windows.get(id);
    if (window) {
      this.windows.delete(id);
      if (this.focusedWindowId === id) {
        this.focusedWindowId = null;
        // Focus the next window with highest z-index
        const windows = Array.from(this.windows.values())
          .filter(w => !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex);
        if (windows.length > 0) {
          this.focusWindow(windows[0].id);
        }
      }
      this.notifyListeners();
    }
  }

  focusWindow(id: string): void {
    const window = this.windows.get(id);
    if (!window) return;

    // Unfocus current window
    if (this.focusedWindowId) {
      const current = this.windows.get(this.focusedWindowId);
      if (current) {
        current.isFocused = false;
      }
    }

    // Focus new window
    window.isFocused = true;
    window.zIndex = ++this.zIndexCounter;
    this.focusedWindowId = id;
    
    this.notifyListeners();
  }

  minimizeWindow(id: string): void {
    const device = getDeviceType();
    // En móvil no permitir minimizar (siempre pantalla completa)
    if (device === 'mobile') return;
    
    const window = this.windows.get(id);
    if (window) {
      window.isMinimized = true;
      window.isFocused = false;
      
      // Focus next window
      const windows = Array.from(this.windows.values())
        .filter(w => !w.isMinimized && w.id !== id)
        .sort((a, b) => b.zIndex - a.zIndex);
      
      if (windows.length > 0) {
        this.focusWindow(windows[0].id);
      } else {
        this.focusedWindowId = null;
        this.notifyListeners();
      }
    }
  }

  restoreWindow(id: string): void {
    const window = this.windows.get(id);
    if (window) {
      window.isMinimized = false;
      this.focusWindow(id);
    }
  }

  toggleMaximize(id: string): void {
    const device = getDeviceType();
    // En móvil no permitir cambiar de maximizado
    if (device === 'mobile') return;
    
    const window = this.windows.get(id);
    if (!window) return;

    const { width: maxWidth, height: maxHeight } = getMaxWindowSize();

    if (window.isMaximized) {
      // Restore
      if (window.prevState) {
        // Asegurar que la posición restaurada esté dentro de límites
        const { x, y } = clampWindowPosition(
          window.prevState.x,
          window.prevState.y,
          window.prevState.width,
          window.prevState.height
        );
        window.x = x;
        window.y = y;
        window.width = Math.min(window.prevState.width, maxWidth);
        window.height = Math.min(window.prevState.height, maxHeight);
      }
      window.isMaximized = false;
      window.prevState = undefined;
    } else {
      // Maximize
      window.prevState = {
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height
      };
      window.x = 0;
      window.y = 0;
      window.width = maxWidth;
      window.height = maxHeight;
      window.isMaximized = true;
    }
    this.notifyListeners();
  }

  moveWindow(id: string, x: number, y: number): void {
    const device = getDeviceType();
    const window = this.windows.get(id);
    if (window && !window.isMaximized && device !== 'mobile') {
      const { x: clampedX, y: clampedY } = clampWindowPosition(x, y, window.width, window.height);
      window.x = clampedX;
      window.y = clampedY;
      this.notifyListeners();
    }
  }

  resizeWindow(id: string, width: number, height: number): void {
    const device = getDeviceType();
    const window = this.windows.get(id);
    if (window && !window.isMaximized && window.isResizable && device !== 'mobile') {
      const { width: maxWidth, height: maxHeight } = getMaxWindowSize();
      window.width = Math.max(window.minWidth, Math.min(width, maxWidth));
      window.height = Math.max(window.minHeight, Math.min(height, maxHeight));
      this.notifyListeners();
    }
  }

  // Manejar cambio de tamaño de pantalla
  handleResize(): void {
    const device = getDeviceType();
    const { width: maxWidth, height: maxHeight } = getMaxWindowSize();
    
    this.windows.forEach(window => {
      if (device === 'mobile') {
        // En móvil: todas las ventanas pantalla completa
        window.x = 0;
        window.y = 0;
        window.width = maxWidth;
        window.height = maxHeight;
        window.isMaximized = true;
        window.isResizable = false;
      } else {
        // Asegurar que las ventanas estén dentro de los nuevos límites
        const { x, y } = clampWindowPosition(window.x, window.y, window.width, window.height);
        window.x = x;
        window.y = y;
        window.width = Math.min(window.width, maxWidth);
        window.height = Math.min(window.height, maxHeight);
        window.isResizable = true;
      }
    });
    
    this.notifyListeners();
  }

  getWindow(id: string): WindowState | undefined {
    return this.windows.get(id);
  }

  getAllWindows(): WindowState[] {
    return Array.from(this.windows.values());
  }

  getFocusedWindow(): WindowState | null {
    return this.focusedWindowId ? this.windows.get(this.focusedWindowId) || null : null;
  }

  getWindowsByApp(appId: string): WindowState[] {
    return Array.from(this.windows.values()).filter(w => w.appId === appId);
  }

  subscribe(listener: (windows: WindowState[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeTaskbar(listener: (items: TaskbarItem[]) => void): () => void {
    this.taskbarListeners.add(listener);
    return () => this.taskbarListeners.delete(listener);
  }

  private notifyListeners(): void {
    const windows = this.getAllWindows();
    this.listeners.forEach(listener => listener(windows));
    
    const taskbarItems: TaskbarItem[] = windows.map(w => ({
      windowId: w.id,
      appId: w.appId,
      title: w.title,
      icon: w.icon,
      isMinimized: w.isMinimized,
      isFocused: w.isFocused
    }));
    this.taskbarListeners.forEach(listener => listener(taskbarItems));
  }

  bringToFront(id: string): void {
    const window = this.windows.get(id);
    if (window) {
      window.zIndex = ++this.zIndexCounter;
      this.notifyListeners();
    }
  }

  // Snap window to edges (Windows 11 style) - solo en desktop
  snapWindow(id: string, direction: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): void {
    const device = getDeviceType();
    if (device === 'mobile') return;
    
    const window = this.windows.get(id);
    if (!window) return;

    const { width: maxWidth, height: maxHeight } = getMaxWindowSize();

    if (!window.prevState && !window.isMaximized) {
      window.prevState = {
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height
      };
    }

    switch (direction) {
      case 'left':
        window.x = 0;
        window.y = 0;
        window.width = maxWidth / 2;
        window.height = maxHeight;
        break;
      case 'right':
        window.x = maxWidth / 2;
        window.y = 0;
        window.width = maxWidth / 2;
        window.height = maxHeight;
        break;
      case 'top':
        window.x = 0;
        window.y = 0;
        window.width = maxWidth;
        window.height = maxHeight / 2;
        break;
      case 'bottom':
        window.x = 0;
        window.y = maxHeight / 2;
        window.width = maxWidth;
        window.height = maxHeight / 2;
        break;
      case 'top-left':
        window.x = 0;
        window.y = 0;
        window.width = maxWidth / 2;
        window.height = maxHeight / 2;
        break;
      case 'top-right':
        window.x = maxWidth / 2;
        window.y = 0;
        window.width = maxWidth / 2;
        window.height = maxHeight / 2;
        break;
      case 'bottom-left':
        window.x = 0;
        window.y = maxHeight / 2;
        window.width = maxWidth / 2;
        window.height = maxHeight / 2;
        break;
      case 'bottom-right':
        window.x = maxWidth / 2;
        window.y = maxHeight / 2;
        window.width = maxWidth / 2;
        window.height = maxHeight / 2;
        break;
    }

    window.isMaximized = false;
    this.notifyListeners();
  }
}

export interface TaskbarItem {
  windowId: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isFocused: boolean;
}

export const windowManager = new WindowManager();

// Escuchar cambios de tamaño de pantalla
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    windowManager.handleResize();
  });
}
