import { useState, useEffect } from 'react';
import { useWebOSStore, windowActions } from '@/store';
import { Power, User, Search, X } from 'lucide-react';

interface StartMenuProps {
  onClose: () => void;
}

const pinnedApps = [
  { id: 'ide', name: 'WebOS IDE', icon: '💻' },
  { id: 'explorer', name: 'Explorador', icon: '📁' },
  { id: 'notepad', name: 'Bloc de notas', icon: '📝' },
  { id: 'terminal', name: 'Terminal', icon: '💻' },
  { id: 'calculator', name: 'Calculadora', icon: '🔢' },
  { id: 'paint', name: 'Paint', icon: '🎨' },
  { id: 'browser', name: 'Navegador', icon: '🌐' },
  { id: 'settings', name: 'Configuración', icon: '⚙️' },
  { id: 'store', name: 'Tienda', icon: '🏪' },
  { id: 'player', name: 'Reproductor', icon: '🎵' },
  { id: 'taskmgr', name: 'Admin. Tareas', icon: '📊' },
];

const recommendedItems = [
  { name: 'README.md', subtitle: 'Hace 2 minutos', icon: '📄' },
  { name: 'proyecto.txt', subtitle: 'Hace 1 hora', icon: '📄' },
  { name: 'Documentos', subtitle: 'Ayer', icon: '📁' },
  { name: 'mi-app', subtitle: 'Ayer', icon: '💻' },
];

export const StartMenu: React.FC<StartMenuProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { setBootStage } = useWebOSStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredApps = pinnedApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (appId: string) => {
    windowActions.openApp(appId);
    onClose();
  };

  const handleShutdown = () => {
    setBootStage('boot');
    onClose();
  };

  return (
    <div 
      className={`
        fixed bg-[#1e1e2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-[10000] overflow-hidden animate-in slide-in-from-bottom-4 duration-200
        ${isMobile 
          ? 'bottom-16 left-2 right-2 max-h-[80vh]' 
          : 'bottom-12 left-2 w-[600px] max-h-[600px]'
        }
      `}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header con botón cerrar en móvil */}
      <div className="p-4 pb-2 flex items-center gap-2">
        {isMobile && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar aplicaciones, archivos y configuración"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2a2a3a] text-white pl-12 pr-4 py-3 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 pt-2 overflow-auto ${isMobile ? 'max-h-[50vh]' : 'max-h-[400px]'}`}>
        {searchQuery ? (
          // Search results
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Resultados</h3>
            {filteredApps.length > 0 ? (
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-4'}`}>
                {filteredApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className={`${isMobile ? 'text-2xl' : 'text-3xl'}`}>{app.icon}</span>
                    <span className="text-xs text-gray-300 text-center truncate w-full">{app.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No se encontraron resultados</p>
            )}
          </div>
        ) : (
          <>
            {/* Pinned Apps */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Ancladas</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300">Todas las aplicaciones</button>
              </div>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-5'}`}>
                {pinnedApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                  >
                    <span className={`group-hover:scale-110 transition-transform ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{app.icon}</span>
                    <span className="text-xs text-gray-300 text-center truncate w-full">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Recomendadas</h3>
              <div className="space-y-1">
                {recommendedItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{item.icon}</span>
                    <div className="text-left min-w-0">
                      <div className="text-sm text-white truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#1a1a28] border-t border-white/5 flex items-center justify-between">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm text-white hidden sm:block">Usuario</span>
        </button>

        <button 
          onClick={handleShutdown}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Apagar"
        >
          <Power className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
