import React, { useState, useEffect } from 'react';
import { useWebOSStore, notify } from '@/store';
import { Wifi, Volume2, Accessibility, Power } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setBootStage, setCurrentUser } = useWebOSStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!password) return;
    
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setCurrentUser({
      id: 'user-1',
      username: 'Usuario',
      email: 'usuario@webos.local',
      isDeveloper: false,
      purchasedApps: []
    });
    
    setIsLoading(false);
    setBootStage('desktop');
    notify('👋', 'Bienvenido a WebOS', 'Has iniciado sesión correctamente');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex flex-col z-[99999]">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div />
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Accessibility className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Wifi className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Volume2 className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Power className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Time */}
        <div className="text-center mb-12">
          <div className="text-8xl font-light text-white mb-2">
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-2xl text-white/80">
            {currentTime.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
        </div>

        {/* User Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-sm">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl border-4 border-white/30">
              👤
            </div>
          </div>

          {/* Username */}
          <h2 className="text-2xl font-medium text-white text-center mb-6">Usuario</h2>

          {/* Password Input */}
          <form onSubmit={handleLogin}>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Contraseña"
                className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-lg outline-none focus:bg-white/30 transition-colors"
                disabled={isLoading}
                autoFocus
              />
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={!password || isLoading}
              className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-white/50 text-sm mt-4">
            Cualquier contraseña funciona en modo demo
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="p-4 flex items-center justify-center gap-4">
        <button 
          onClick={() => setBootStage('boot')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <Power className="w-4 h-4" />
          <span className="text-sm">Apagar</span>
        </button>
      </div>
    </div>
  );
};
