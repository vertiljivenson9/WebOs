import { useState, useEffect } from 'react';
import { useWindows } from '@/hooks/useWindows';
import { useWebOSStore, windowActions } from '@/store';
import { Wifi, Volume2, Battery, Bell } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const windows = useWindows();
  const { startMenuOpen, setStartMenuOpen, settings } = useWebOSStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskbarItemClick = (windowId: string, isMinimized: boolean, isFocused: boolean) => {
    if (isMobile) {
      // En móvil: siempre restaurar y enfocar
      windowActions.restoreWindow(windowId);
      windowActions.focusWindow(windowId);
    } else if (isMinimized) {
      windowActions.restoreWindow(windowId);
    } else if (isFocused) {
      windowActions.minimizeWindow(windowId);
    } else {
      windowActions.focusWindow(windowId);
    }
  };

  // Solo mostrar iconos en la barra de tareas (sin texto en móvil)
  const visibleWindows = isMobile 
    ? windows.slice(0, 4) // Limitar iconos en móvil
    : windows;

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 flex items-center px-2 z-[9999]
        ${isMobile ? 'h-14' : 'h-12'}
      `}
      style={{
        background: settings.transparency ? 'rgba(26, 26, 46, 0.9)' : '#1a1a2e',
        backdropFilter: settings.transparency ? 'blur(20px)' : 'none',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Start Button */}
      <button
        onClick={() => setStartMenuOpen(!startMenuOpen)}
        className={`
          flex items-center justify-center rounded-lg transition-all
          ${startMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}
          ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}
        `}
      >
        <svg viewBox="0 0 24 24" className={`text-white ${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} fill="currentColor">
          <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
        </svg>
      </button>

      {/* Search - oculto en móvil muy pequeño */}
      {!isMobile && (
        <div className="w-48 lg:w-64 mx-2 hidden sm:block">
          <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query) {
                    windowActions.openApp('browser');
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Taskbar Items */}
      <div className={`
        flex-1 flex items-center justify-center overflow-x-auto
        ${isMobile ? 'gap-1 px-2' : 'gap-1 px-4'}
      `}>
        {visibleWindows.map(window => (
          <button
            key={window.id}
            onClick={() => handleTaskbarItemClick(window.id, window.isMinimized, window.isFocused)}
            className={`
              flex items-center justify-center rounded-lg transition-all
              ${window.isFocused 
                ? 'bg-white/20 border-b-2 border-blue-500' 
                : 'hover:bg-white/10'
              }
              ${isMobile 
                ? 'w-11 h-11 min-w-[44px]' 
                : 'h-10 px-3 min-w-[44px] max-w-[200px]'
              }
            `}
            title={window.title}
          >
            <span className={`${isMobile ? 'text-xl' : 'text-lg'}`}>{window.icon}</span>
            {!isMobile && (
              <span className="text-sm text-white truncate hidden lg:block ml-2">{window.title}</span>
            )}
          </button>
        ))}
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-1">
        {/* System Icons - simplificado en móvil */}
        <div className={`flex items-center px-1 ${isMobile ? 'gap-0.5' : 'gap-1'}`}>
          {!isMobile && (
            <>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Wifi className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Volume2 className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden sm:block">
                <Battery className="w-4 h-4 text-gray-300" />
              </button>
            </>
          )}
        </div>

        {/* Clock */}
        <button 
          onClick={() => setShowCalendar(!showCalendar)}
          className={`
            hover:bg-white/10 rounded-lg transition-colors text-right
            ${isMobile ? 'px-2 py-2' : 'px-3 py-1.5'}
          `}
        >
          <div className={`text-white ${isMobile ? 'text-sm' : ''}`}>
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          {!isMobile && (
            <div className="text-xs text-gray-400">
              {currentTime.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
            </div>
          )}
        </button>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <div 
          className={`
            absolute bottom-14 right-2 bg-[#2a2a3a] border border-white/10 rounded-xl shadow-2xl p-4 z-[10000]
            ${isMobile ? 'w-72' : 'w-80'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className={`font-light text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long' })}
            </div>
            <div className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {currentTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
              <div key={d} className="text-gray-500 py-1">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 5;
              const isToday = day === currentTime.getDate();
              return (
                <div 
                  key={i} 
                  className={`py-1 rounded ${
                    isToday 
                      ? 'bg-blue-500 text-white' 
                      : day > 0 && day <= 28 
                        ? 'text-gray-300 hover:bg-white/10' 
                        : 'text-gray-600'
                  }`}
                >
                  {day > 0 && day <= 31 ? day : ''}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
