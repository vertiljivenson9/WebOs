import { useState } from 'react';
import { 
  Monitor, Palette, Wifi, Shield, User, Bell, 
  Volume2, Power, Info, ChevronRight, Check 
} from 'lucide-react';
import { useWebOSStore } from '@/store';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const { settings, updateSettings } = useWebOSStore();

  const tabs = [
    { id: 'system', label: 'Sistema', icon: Monitor },
    { id: 'display', label: 'Pantalla', icon: Monitor },
    { id: 'personalize', label: 'Personalización', icon: Palette },
    { id: 'network', label: 'Red', icon: Wifi },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'accounts', label: 'Cuentas', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'sound', label: 'Sonido', icon: Volume2 },
    { id: 'power', label: 'Energía', icon: Power },
    { id: 'about', label: 'Acerca de', icon: Info },
  ];

  const wallpapers = [
    { id: 'gradient-1', name: 'Azul Profundo', style: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)' },
    { id: 'gradient-2', name: 'Verde Oscuro', style: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
    { id: 'gradient-3', name: 'Atardecer', style: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)' },
    { id: 'gradient-4', name: 'Púrpura', style: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
    { id: 'gradient-5', name: 'Azul Eléctrico', style: 'linear-gradient(135deg, #000428, #004e92)' },
    { id: 'gradient-6', name: 'Gris Azulado', style: 'linear-gradient(135deg, #141e30, #243b55)' },
  ];

  const accentColors = [
    '#0078d4', '#e81123', '#00cc6a', '#f7630c', 
    '#8764b8', '#ff8c00', '#e3008c', '#00b7c3'
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'system':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white mb-6">Sistema</h2>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Almacenamiento</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white">Disco Local (C:)</div>
                    <div className="text-sm text-gray-400">128 GB disponibles de 256 GB</div>
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Multitarea</h3>
              <SettingToggle 
                label="Anclar ventanas"
                description="Organiza ventanas automáticamente al arrastrar a los bordes"
                checked={true}
                onChange={() => {}}
              />
              <SettingToggle 
                label="Mostrar animaciones"
                description="Animaciones de ventanas y transiciones"
                checked={settings.animations}
                onChange={(v) => updateSettings({ animations: v })}
              />
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white mb-6">Pantalla</h2>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Brillo y color</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Brillo</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.brightness}
                    onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <SettingToggle 
                  label="Modo oscuro"
                  description="Usar tema oscuro en todo el sistema"
                  checked={settings.theme === 'dark'}
                  onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
                />
                <SettingToggle 
                  label="Luz nocturna"
                  description="Reduce la luz azul por la noche"
                  checked={settings.nightLight}
                  onChange={(v) => updateSettings({ nightLight: v })}
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Escala y diseño</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-white">Resolución</span>
                  <select className="bg-[#333] text-white px-3 py-1 rounded">
                    <option>1920 × 1080</option>
                    <option>2560 × 1440</option>
                    <option>3840 × 2160</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white">Escala</span>
                  <select 
                    className="bg-[#333] text-white px-3 py-1 rounded"
                    value={settings.scale}
                    onChange={(e) => updateSettings({ scale: Number(e.target.value) })}
                  >
                    <option value={1}>100%</option>
                    <option value={1.25}>125%</option>
                    <option value={1.5}>150%</option>
                    <option value={1.75}>175%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personalize':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white mb-6">Personalización</h2>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Fondo de escritorio</h3>
              <div className="grid grid-cols-3 gap-3">
                {wallpapers.map(wp => (
                  <button
                    key={wp.id}
                    onClick={() => updateSettings({ wallpaper: wp.id })}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      settings.wallpaper === wp.id ? 'border-blue-500' : 'border-transparent hover:border-white/30'
                    }`}
                    style={{ background: wp.style }}
                  >
                    {settings.wallpaper === wp.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                      {wp.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Color de acento</h3>
              <div className="flex gap-3 flex-wrap">
                {accentColors.map(c => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ accentColor: c })}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      settings.accentColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Transparencia</h3>
              <SettingToggle 
                label="Efectos de transparencia"
                description="Hacer transparentes ciertos elementos de fondo"
                checked={settings.transparency}
                onChange={(v) => updateSettings({ transparency: v })}
              />
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white mb-6">Red e Internet</h2>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Wi-Fi</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white">WebOS-Network</div>
                      <div className="text-sm text-gray-400">Conectado, segura</div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">Conectado</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-gray-300">Red-Vecino</div>
                      <div className="text-sm text-gray-500">Protegida</div>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">Disponible</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white mb-6">Acerca de</h2>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl">
                🖥️
              </div>
              <div>
                <h3 className="text-3xl font-light text-white">WebOS 11 Pro</h3>
                <p className="text-gray-400">Versión 24H2 (Compilación 26100.3476)</p>
                <p className="text-gray-500 text-sm mt-1">© 2026 WebOS Corporation. Todos los derechos reservados.</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              {[
                { label: 'Nombre del dispositivo', value: 'DESKTOP-WEBOS-PRO' },
                { label: 'Procesador', value: 'WebCore vCPU @ Browser' },
                { label: 'RAM instalada', value: 'Virtual (Navegador)' },
                { label: 'Tipo de sistema', value: 'Sistema operativo web de 64 bits' },
                { label: 'Plataforma', value: navigator.platform },
                { label: 'Navegador', value: navigator.userAgent.split(' ')[0] },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Info className="w-16 h-16 mb-4 opacity-30" />
            <p>Esta sección está en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex bg-[#1e1e2e]">
      {/* Sidebar */}
      <div className="w-56 bg-[#1a1a28] border-r border-white/5 overflow-y-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-500/20 text-blue-400 border-r-2 border-blue-500' 
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-sm">{tab.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {renderContent()}
      </div>
    </div>
  );
};

const SettingToggle: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="text-white">{label}</div>
      <div className="text-sm text-gray-400">{description}</div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative ${
        checked ? 'bg-blue-500' : 'bg-gray-600'
      }`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
        checked ? 'left-7' : 'left-1'
      }`} />
    </button>
  </div>
);
