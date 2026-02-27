// WebOS Types

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  isResizable: boolean;
  zIndex: number;
  prevState?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AppDefinition {
  id: string;
  name: string;
  title: string;
  icon: string;
  description?: string;
  category: 'system' | 'utility' | 'media' | 'development' | 'game';
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  singleton?: boolean;
  requiresVerification?: boolean;
  permissions?: string[];
  isResizable?: boolean;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'folder';
  ext?: string;
  content?: string;
  children?: Record<string, FileSystemNode>;
  createdAt: string;
  modifiedAt: string;
  size?: number;
  permissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
}

export interface StoreApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  isPaid: boolean;
  developer: string;
  developerId: string;
  developerPaypal?: string;
  developerWhatsApp?: string;
  version: string;
  category: string;
  downloads: number;
  rating: number;
  createdAt: string;
  screenshots: string[];
  permissions: string[];
  size: string;
}

export interface Purchase {
  id: string;
  appId: string;
  userId: string;
  status: 'pending' | 'verified' | 'failed';
  verificationCode?: string;
  createdAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  isDeveloper: boolean;
  developerProfile?: {
    companyName: string;
    paypalEmail: string;
    whatsappNumber: string;
    website: string;
    verified: boolean;
  };
  purchasedApps: string[];
}

export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[], terminal: TerminalInstance) => void;
}

export interface TerminalInstance {
  cwd: string;
  history: string[];
  print: (text: string, type?: 'info' | 'error' | 'success' | 'warning') => void;
  clear: () => void;
  setCwd: (path: string) => void;
}

export interface Notification {
  id: string;
  icon: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  duration: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  action?: () => void;
}

export interface TaskbarItem {
  windowId: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isFocused: boolean;
}

export interface Wallpaper {
  id: string;
  name: string;
  type: 'gradient' | 'image' | 'solid';
  value: string;
  thumbnail: string;
}

export interface SystemSettings {
  theme: 'dark' | 'light' | 'auto';
  accentColor: string;
  wallpaper: string;
  scale: number;
  brightness: number;
  nightLight: boolean;
  animations: boolean;
  transparency: boolean;
  soundEnabled: boolean;
  notifications: boolean;
}
