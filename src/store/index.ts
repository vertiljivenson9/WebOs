import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WindowState, AppDefinition, SystemSettings, User, Notification, StoreApp } from '@/types';
import { windowManager } from '@/core/WindowManager';

interface WebOSState {
  // Boot & Auth
  bootStage: 'boot' | 'login' | 'desktop';
  setBootStage: (stage: 'boot' | 'login' | 'desktop') => void;
  
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Windows
  windows: WindowState[];
  setWindows: (windows: WindowState[]) => void;
  
  // Apps
  installedApps: AppDefinition[];
  registerApp: (app: AppDefinition) => void;
  
  // Store
  storeApps: StoreApp[];
  setStoreApps: (apps: StoreApp[]) => void;
  purchasedApps: string[];
  addPurchasedApp: (appId: string) => void;
  
  // Settings
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  
  // Start Menu
  startMenuOpen: boolean;
  setStartMenuOpen: (open: boolean) => void;
  
  // Context Menu
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    items: unknown[];
  };
  setContextMenu: (menu: { visible: boolean; x: number; y: number; items: unknown[] }) => void;
  
  // Task Manager
  taskManagerOpen: boolean;
  setTaskManagerOpen: (open: boolean) => void;
}

export const useWebOSStore = create<WebOSState>()(
  persist(
    (set) => ({
      // Boot
      bootStage: 'boot',
      setBootStage: (stage) => set({ bootStage: stage }),
      
      // User
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Windows
      windows: [],
      setWindows: (windows) => set({ windows }),
      
      // Apps
      installedApps: [],
      registerApp: (app) => {
        windowManager.registerApp(app);
        set((state) => ({
          installedApps: [...state.installedApps.filter(a => a.id !== app.id), app]
        }));
      },
      
      // Store
      storeApps: [],
      setStoreApps: (apps) => set({ storeApps: apps }),
      purchasedApps: [],
      addPurchasedApp: (appId) => set((state) => ({
        purchasedApps: [...state.purchasedApps, appId]
      })),
      
      // Settings
      settings: {
        theme: 'dark',
        accentColor: '#0078d4',
        wallpaper: 'gradient-1',
        scale: 1,
        brightness: 80,
        nightLight: false,
        animations: true,
        transparency: true,
        soundEnabled: true,
        notifications: true
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: Date.now()
        }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      // Start Menu
      startMenuOpen: false,
      setStartMenuOpen: (open) => set({ startMenuOpen: open }),
      
      // Context Menu
      contextMenu: { visible: false, x: 0, y: 0, items: [] },
      setContextMenu: (menu) => set({ contextMenu: menu }),
      
      // Task Manager
      taskManagerOpen: false,
      setTaskManagerOpen: (open) => set({ taskManagerOpen: open })
    }),
    {
      name: 'webos-storage',
      partialize: (state) => ({
        settings: state.settings,
        purchasedApps: state.purchasedApps,
        currentUser: state.currentUser
      })
    }
  )
);

// Window actions
export const windowActions = {
  openApp: (appId: string, options?: Partial<WindowState>) => {
    const window = windowManager.createWindow(appId, options);
    if (window) {
      useWebOSStore.getState().setWindows(windowManager.getAllWindows());
    }
    return window;
  },
  
  closeWindow: (id: string) => {
    windowManager.closeWindow(id);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  },
  
  focusWindow: (id: string) => {
    windowManager.focusWindow(id);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  },
  
  minimizeWindow: (id: string) => {
    windowManager.minimizeWindow(id);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  },
  
  restoreWindow: (id: string) => {
    windowManager.restoreWindow(id);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  },
  
  toggleMaximize: (id: string) => {
    windowManager.toggleMaximize(id);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  },
  
  moveWindow: (id: string, x: number, y: number) => {
    windowManager.moveWindow(id, x, y);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  },
  
  resizeWindow: (id: string, width: number, height: number) => {
    windowManager.resizeWindow(id, width, height);
    useWebOSStore.getState().setWindows(windowManager.getAllWindows());
  }
};

// Notification helper
export const notify = (icon: string, title: string, message?: string, type: Notification['type'] = 'info') => {
  useWebOSStore.getState().addNotification({
    icon,
    title,
    message: message || '',
    type,
    duration: 3000
  });
};
