import type { FileSystemNode } from '@/types';

export class VirtualFileSystem {
  private root: FileSystemNode;
  private watchers: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.root = this.createInitialFileSystem();
  }

  private createInitialFileSystem(): FileSystemNode {
    return {
      name: 'C:',
      type: 'folder',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      permissions: { read: true, write: true, execute: true },
      children: {
        'Users': {
          name: 'Users',
          type: 'folder',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          permissions: { read: true, write: true, execute: true },
          children: {
            'Usuario': {
              name: 'Usuario',
              type: 'folder',
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              permissions: { read: true, write: true, execute: true },
              children: {
                'Escritorio': {
                  name: 'Escritorio',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {
                    'readme.txt': {
                      name: 'readme.txt',
                      type: 'file',
                      ext: 'txt',
                      content: 'Bienvenido a WebOS Professional!\n\nEste es tu escritorio virtual.\n\nCaracterísticas:\n- Sistema de archivos completo\n- Tienda de aplicaciones integrada\n- Sistema de pagos con verificación\n- Ventanas profesionales tipo Windows 11\n\n© 2026 WebOS Corporation',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 256,
                      permissions: { read: true, write: true, execute: false }
                    },
                    'notas.txt': {
                      name: 'notas.txt',
                      type: 'file',
                      ext: 'txt',
                      content: 'Lista de tareas:\n\n[ ] Explorar WebOS\n[ ] Abrir el terminal\n[ ] Usar el explorador de archivos\n[ ] Visitar la tienda de apps\n[ ] Personalizar el escritorio',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 128,
                      permissions: { read: true, write: true, execute: false }
                    },
                    'proyecto.wpx': {
                      name: 'proyecto.wpx',
                      type: 'file',
                      ext: 'wpx',
                      content: '{"type": "project", "name": "Mi Proyecto", "version": "1.0.0"}',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 64,
                      permissions: { read: true, write: true, execute: false }
                    }
                  }
                },
                'Documentos': {
                  name: 'Documentos',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {
                    'proyecto.txt': {
                      name: 'proyecto.txt',
                      type: 'file',
                      ext: 'txt',
                      content: 'Documento del proyecto.\n\nAquí puedes escribir tus ideas y documentación.',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 96,
                      permissions: { read: true, write: true, execute: false }
                    },
                    'datos.csv': {
                      name: 'datos.csv',
                      type: 'file',
                      ext: 'csv',
                      content: 'nombre,edad,ciudad\nJuan,25,Madrid\nAna,30,Barcelona\nLuis,28,Valencia\nMaría,35,Sevilla\nCarlos,22,Bilbao',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 112,
                      permissions: { read: true, write: true, execute: false }
                    },
                    'Informes': {
                      name: 'Informes',
                      type: 'folder',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      permissions: { read: true, write: true, execute: true },
                      children: {
                        'informe2025.txt': {
                          name: 'informe2025.txt',
                          type: 'file',
                          ext: 'txt',
                          content: 'Informe Anual 2025\n\nResumen Ejecutivo:\n\nWebOS ha experimentado un crecimiento significativo este año.\n\n- Nuevos usuarios: +150%\n- Apps publicadas: +300%\n- Ingresos de desarrolladores: +250%\n\nProyecciones para 2026 son muy positivas.',
                          createdAt: new Date().toISOString(),
                          modifiedAt: new Date().toISOString(),
                          size: 256,
                          permissions: { read: true, write: true, execute: false }
                        }
                      }
                    }
                  }
                },
                'Imágenes': {
                  name: 'Imágenes',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {
                    'foto1.png': {
                      name: 'foto1.png',
                      type: 'file',
                      ext: 'png',
                      content: '[imagen binaria]',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 2048,
                      permissions: { read: true, write: true, execute: false }
                    },
                    'captura.png': {
                      name: 'captura.png',
                      type: 'file',
                      ext: 'png',
                      content: '[imagen binaria]',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 1536,
                      permissions: { read: true, write: true, execute: false }
                    },
                    'Vacaciones': {
                      name: 'Vacaciones',
                      type: 'folder',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      permissions: { read: true, write: true, execute: true },
                      children: {}
                    }
                  }
                },
                'Música': {
                  name: 'Música',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {
                    'playlist.m3u': {
                      name: 'playlist.m3u',
                      type: 'file',
                      ext: 'm3u',
                      content: '#EXTM3U\n#EXTINF:240,Chill Vibes\ncancion1.mp3\n#EXTINF:180,Work Focus\ncancion2.mp3',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 96,
                      permissions: { read: true, write: true, execute: false }
                    }
                  }
                },
                'Vídeos': {
                  name: 'Vídeos',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {}
                },
                'Descargas': {
                  name: 'Descargas',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {
                    'app-instalador.vpx': {
                      name: 'app-instalador.vpx',
                      type: 'file',
                      ext: 'vpx',
                      content: '[aplicación WebOS]',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 5120,
                      permissions: { read: true, write: true, execute: true }
                    }
                  }
                },
                'Apps': {
                  name: 'Apps',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: true, execute: true },
                  children: {}
                }
              }
            }
          }
        },
        'Windows': {
          name: 'Windows',
          type: 'folder',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          permissions: { read: true, write: false, execute: true },
          children: {
            'System32': {
              name: 'System32',
              type: 'folder',
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              permissions: { read: true, write: false, execute: true },
              children: {
                'drivers': {
                  name: 'drivers',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: false, execute: true },
                  children: {}
                },
                'config': {
                  name: 'config',
                  type: 'folder',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  permissions: { read: true, write: false, execute: true },
                  children: {
                    'system.ini': {
                      name: 'system.ini',
                      type: 'file',
                      ext: 'ini',
                      content: '[system]\nOS=WebOS Professional\nVersion=11.0\nBuild=26100\nEdition=Pro\n\n[boot]\nFastBoot=1\nAnimation=1\n\n[display]\nDPI=96\nScaling=1.0\n\n[security]\nFirewall=1\nDefender=1\nUpdates=automatic',
                      createdAt: new Date().toISOString(),
                      modifiedAt: new Date().toISOString(),
                      size: 192,
                      permissions: { read: true, write: false, execute: false }
                    }
                  }
                }
              }
            },
            'Fonts': {
              name: 'Fonts',
              type: 'folder',
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              permissions: { read: true, write: false, execute: true },
              children: {}
            }
          }
        },
        'Program Files': {
          name: 'Program Files',
          type: 'folder',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          permissions: { read: true, write: false, execute: true },
          children: {
            'WebOS': {
              name: 'WebOS',
              type: 'folder',
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              permissions: { read: true, write: false, execute: true },
              children: {
                'notepad.exe': {
                  name: 'notepad.exe',
                  type: 'file',
                  ext: 'exe',
                  content: '[sistema]',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  size: 1024,
                  permissions: { read: true, write: false, execute: true }
                },
                'calc.exe': {
                  name: 'calc.exe',
                  type: 'file',
                  ext: 'exe',
                  content: '[sistema]',
                  createdAt: new Date().toISOString(),
                  modifiedAt: new Date().toISOString(),
                  size: 1024,
                  permissions: { read: true, write: false, execute: true }
                }
              }
            }
          }
        }
      }
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/$/, '') || 'C:';
  }

  private getPathParts(path: string): string[] {
    const normalized = this.normalizePath(path);
    return normalized.split('/').filter(p => p && p !== 'C:');
  }

  resolve(path: string): FileSystemNode | null {
    const parts = this.getPathParts(path);
    let current: FileSystemNode = this.root;

    for (const part of parts) {
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }

    return current;
  }

  list(path: string): FileSystemNode[] {
    const node = this.resolve(path);
    if (!node || node.type !== 'folder' || !node.children) {
      return [];
    }

    return Object.values(node.children).sort((a, b) => {
      // Folders first, then alphabetical
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  read(path: string): string | null {
    const node = this.resolve(path);
    if (!node || node.type !== 'file') {
      return null;
    }
    return node.content || '';
  }

  write(path: string, content: string): boolean {
    const parts = this.getPathParts(path);
    const fileName = parts.pop();
    
    if (!fileName) return false;

    let parent = this.root;
    for (const part of parts) {
      if (!parent.children || !parent.children[part]) {
        // Create intermediate folders
        if (!parent.children) parent.children = {};
        parent.children[part] = {
          name: part,
          type: 'folder',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          permissions: { read: true, write: true, execute: true },
          children: {}
        };
      }
      parent = parent.children[part];
    }

    if (!parent.children) parent.children = {};

    const ext = fileName.includes('.') ? fileName.split('.').pop() : undefined;
    
    if (parent.children[fileName]) {
      // Update existing file
      parent.children[fileName].content = content;
      parent.children[fileName].modifiedAt = new Date().toISOString();
      parent.children[fileName].size = content.length;
    } else {
      // Create new file
      parent.children[fileName] = {
        name: fileName,
        type: 'file',
        ext,
        content,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        size: content.length,
        permissions: { read: true, write: true, execute: false }
      };
    }

    this.notifyWatchers(path);
    return true;
  }

  mkdir(path: string): boolean {
    const parts = this.getPathParts(path);
    const folderName = parts.pop();
    
    if (!folderName) return false;

    let parent = this.root;
    for (const part of parts) {
      if (!parent.children || !parent.children[part]) {
        return false;
      }
      parent = parent.children[part];
    }

    if (!parent.children) parent.children = {};
    
    if (parent.children[folderName]) {
      return false; // Already exists
    }

    parent.children[folderName] = {
      name: folderName,
      type: 'folder',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      permissions: { read: true, write: true, execute: true },
      children: {}
    };

    this.notifyWatchers(path);
    return true;
  }

  delete(path: string): boolean {
    const parts = this.getPathParts(path);
    const name = parts.pop();
    
    if (!name) return false;

    let parent = this.root;
    for (const part of parts) {
      if (!parent.children || !parent.children[part]) {
        return false;
      }
      parent = parent.children[part];
    }

    if (!parent.children || !parent.children[name]) {
      return false;
    }

    delete parent.children[name];
    this.notifyWatchers(path);
    return true;
  }

  exists(path: string): boolean {
    return this.resolve(path) !== null;
  }

  getParent(path: string): string {
    const parts = this.getPathParts(path);
    parts.pop();
    return parts.length === 0 ? 'C:' : 'C:/' + parts.join('/');
  }

  getName(path: string): string {
    const parts = this.getPathParts(path);
    return parts[parts.length - 1] || 'C:';
  }

  getExt(path: string): string | undefined {
    const name = this.getName(path);
    return name.includes('.') ? name.split('.').pop() : undefined;
  }

  rename(oldPath: string, newName: string): boolean {
    const node = this.resolve(oldPath);
    if (!node) return false;

    const parentPath = this.getParent(oldPath);
    const parent = this.resolve(parentPath);
    if (!parent || !parent.children) return false;

    const oldName = node.name;
    node.name = newName;
    node.modifiedAt = new Date().toISOString();

    if (node.type === 'file' && newName.includes('.')) {
      node.ext = newName.split('.').pop();
    }

    parent.children[newName] = node;
    delete parent.children[oldName];

    this.notifyWatchers(oldPath);
    return true;
  }

  copy(src: string, dest: string): boolean {
    const srcNode = this.resolve(src);
    if (!srcNode) return false;

    const content = srcNode.type === 'file' ? srcNode.content : undefined;
    
    if (srcNode.type === 'file') {
      return this.write(dest, content || '');
    } else {
      // Copy folder recursively
      this.mkdir(dest);
      const children = this.list(src);
      for (const child of children) {
        this.copy(`${src}/${child.name}`, `${dest}/${child.name}`);
      }
      return true;
    }
  }

  move(src: string, dest: string): boolean {
    if (this.copy(src, dest)) {
      return this.delete(src);
    }
    return false;
  }

  getStats(path: string): { size: number; created: string; modified: string } | null {
    const node = this.resolve(path);
    if (!node) return null;

    return {
      size: node.size || 0,
      created: node.createdAt,
      modified: node.modifiedAt
    };
  }

  search(query: string, path: string = 'C:/Users/Usuario'): FileSystemNode[] {
    const results: FileSystemNode[] = [];
    const lowerQuery = query.toLowerCase();

    const searchRecursive = (currentPath: string) => {
      const items = this.list(currentPath);
      for (const item of items) {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
        if (item.type === 'folder') {
          searchRecursive(`${currentPath}/${item.name}`);
        }
      }
    };

    searchRecursive(path);
    return results;
  }

  watch(path: string, callback: () => void): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set());
    }
    this.watchers.get(path)!.add(callback);

    return () => {
      const watchers = this.watchers.get(path);
      if (watchers) {
        watchers.delete(callback);
        if (watchers.size === 0) {
          this.watchers.delete(path);
        }
      }
    };
  }

  private notifyWatchers(path: string): void {
    // Notify watchers for this path and all parent paths
    let currentPath = path;
    while (currentPath !== 'C:') {
      const watchers = this.watchers.get(currentPath);
      if (watchers) {
        watchers.forEach(cb => cb());
      }
      currentPath = this.getParent(currentPath);
    }
  }

  // Tree view for terminal
  tree(path: string = 'C:/Users/Usuario', prefix: string = ''): string[] {
    const lines: string[] = [];
    const items = this.list(path);

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = item.type === 'folder' ? '📁' : getFileIcon(item.ext);
      lines.push(`${prefix}${connector}${icon} ${item.name}`);

      if (item.type === 'folder') {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        lines.push(...this.tree(`${path}/${item.name}`, newPrefix));
      }
    });

    return lines;
  }
}

export function getFileIcon(ext?: string): string {
  const icons: Record<string, string> = {
    txt: '📄',
    csv: '📊',
    ini: '⚙️',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    mp3: '🎵',
    mp4: '🎬',
    zip: '📦',
    rar: '📦',
    exe: '⚡',
    html: '🌐',
    htm: '🌐',
    js: '📜',
    ts: '📘',
    py: '🐍',
    java: '☕',
    cpp: '🔧',
    c: '🔧',
    json: '📋',
    xml: '📋',
    css: '🎨',
    scss: '🎨',
    md: '📝',
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    xls: '📗',
    xlsx: '📗',
    ppt: '📙',
    pptx: '📙',
    wpx: '📦',
    vpx: '📦',
    m3u: '🎵',
    default: '📄'
  };
  return icons[ext || ''] || icons.default;
}

export const vfs = new VirtualFileSystem();
