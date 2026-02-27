import { useState } from 'react';
import { 
  Search, ShoppingCart, Star, Filter,
  ChevronRight, Check, ExternalLink, MessageCircle
} from 'lucide-react';
import { notify } from '@/store';
import type { StoreApp } from '@/types';

// Mock data - in production this would come from the API
const mockApps: StoreApp[] = [
  {
    id: 'app-1',
    name: 'Pro Editor',
    description: 'Editor de texto profesional con soporte para múltiples lenguajes de programación.',
    icon: '📝',
    price: 9.99,
    isPaid: true,
    developer: 'CodeMasters Inc.',
    developerId: 'dev-1',
    developerPaypal: 'codemasters',
    developerWhatsApp: '+1234567890',
    version: '2.1.0',
    category: 'Productividad',
    downloads: 15420,
    rating: 4.8,
    createdAt: '2026-01-15',
    screenshots: [],
    permissions: ['filesystem', 'network'],
    size: '15 MB'
  },
  {
    id: 'app-2',
    name: 'Pixel Art Studio',
    description: 'Crea increíbles pixel arts y sprites para tus juegos.',
    icon: '🎨',
    price: 4.99,
    isPaid: true,
    developer: 'ArtSoft',
    developerId: 'dev-2',
    developerPaypal: 'artsoft',
    developerWhatsApp: '+0987654321',
    version: '1.5.0',
    category: 'Diseño',
    downloads: 8930,
    rating: 4.6,
    createdAt: '2026-02-01',
    screenshots: [],
    permissions: ['filesystem'],
    size: '8 MB'
  },
  {
    id: 'app-3',
    name: 'Web Dev Tools',
    description: 'Herramientas esenciales para desarrolladores web.',
    icon: '🔧',
    price: 0,
    isPaid: false,
    developer: 'DevTools Team',
    developerId: 'dev-3',
    version: '3.0.0',
    category: 'Desarrollo',
    downloads: 45200,
    rating: 4.9,
    createdAt: '2025-12-10',
    screenshots: [],
    permissions: ['network'],
    size: '5 MB'
  },
  {
    id: 'app-4',
    name: 'Music Maker',
    description: 'Crea y edita música directamente en WebOS.',
    icon: '🎵',
    price: 14.99,
    isPaid: true,
    developer: 'AudioPro',
    developerId: 'dev-4',
    developerPaypal: 'audiopro',
    developerWhatsApp: '+1122334455',
    version: '1.0.0',
    category: 'Audio',
    downloads: 3200,
    rating: 4.5,
    createdAt: '2026-02-20',
    screenshots: [],
    permissions: ['audio', 'filesystem'],
    size: '25 MB'
  },
  {
    id: 'app-5',
    name: 'Task Master',
    description: 'Gestiona tus tareas y proyectos de forma eficiente.',
    icon: '✅',
    price: 0,
    isPaid: false,
    developer: 'Productivity Apps',
    developerId: 'dev-5',
    version: '2.0.0',
    category: 'Productividad',
    downloads: 28900,
    rating: 4.7,
    createdAt: '2026-01-20',
    screenshots: [],
    permissions: ['notifications'],
    size: '3 MB'
  }
];

export const AppStore: React.FC = () => {
  const [apps] = useState<StoreApp[]>(mockApps);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [purchasedApps, setPurchasedApps] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [appToPurchase, setAppToPurchase] = useState<StoreApp | null>(null);

  const categories = ['all', 'Productividad', 'Diseño', 'Desarrollo', 'Audio', 'Juegos', 'Utilidades'];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (app: StoreApp) => {
    if (app.isPaid) {
      setAppToPurchase(app);
      setShowVerificationDialog(true);
    } else {
      installApp(app);
    }
  };

  const installApp = (app: StoreApp) => {
    setPurchasedApps([...purchasedApps, app.id]);
    notify('✅', `${app.name} instalado correctamente`);
  };

  const openPayPal = (app: StoreApp) => {
    if (app.developerPaypal) {
      const paypalUrl = `https://paypal.me/${app.developerPaypal}/${app.price}`;
      window.open(paypalUrl, '_blank');
    }
  };

  const openWhatsApp = (app: StoreApp) => {
    if (app.developerWhatsApp) {
      const message = `Hola, acabo de comprar ${app.name} en WebOS Store. Mi código de verificación es: ${verificationCode}`;
      const whatsappUrl = `https://wa.me/${app.developerWhatsApp}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const verifyPurchase = () => {
    if (appToPurchase && verificationCode.length >= 16) {
      installApp(appToPurchase);
      setShowVerificationDialog(false);
      setVerificationCode('');
      setAppToPurchase(null);
    } else {
      notify('❌', 'Código de verificación inválido');
    }
  };

  if (selectedApp) {
    return (
      <AppDetail 
        app={selectedApp} 
        onBack={() => setSelectedApp(null)}
        onPurchase={handlePurchase}
        isPurchased={purchasedApps.includes(selectedApp.id)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Header */}
      <div className="h-16 bg-[#252535] border-b border-white/5 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl">
            🏪
          </div>
          <div>
            <h1 className="text-lg font-medium text-white">WebOS Store</h1>
            <p className="text-xs text-gray-400">Descubre aplicaciones increíbles</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar aplicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a28] text-white pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <ShoppingCart className="w-6 h-6 text-gray-300" />
        </button>
      </div>

      {/* Categories */}
      <div className="h-12 bg-[#1a1a28] border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-gray-400 ml-2" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps.map(app => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-[#252535] rounded-xl p-4 cursor-pointer hover:bg-[#2a2a3d] transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl">
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{app.name}</h3>
                  <p className="text-sm text-gray-400">{app.developer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-300">{app.rating}</span>
                    <span className="text-sm text-gray-500">({app.downloads.toLocaleString()})</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">{app.category}</span>
                <span className={`text-sm font-medium ${app.isPaid ? 'text-blue-400' : 'text-green-400'}`}>
                  {app.isPaid ? `$${app.price}` : 'Gratis'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Search className="w-16 h-16 mb-4 opacity-30" />
            <p>No se encontraron aplicaciones</p>
          </div>
        )}
      </div>

      {/* Verification Dialog */}
      {showVerificationDialog && appToPurchase && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#252535] rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-medium text-white mb-4">Verificar compra</h3>
            <p className="text-gray-400 mb-4">
              Para instalar <span className="text-white">{appToPurchase.name}</span>, completa el pago y verifica tu compra.
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => openPayPal(appToPurchase)}
                className="w-full py-3 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <span>Pagar con PayPal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => openWhatsApp(appToPurchase)}
                className="w-full py-3 bg-[#25d366] hover:bg-[#128c7e] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar desarrollador</span>
              </button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="text-sm text-gray-400 mb-2 block">
                Código de verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full bg-[#1a1a28] text-white px-4 py-2 rounded-lg border border-white/10 focus:border-blue-500 focus:outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerificationDialog(false)}
                  className="flex-1 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={verifyPurchase}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Verificar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppDetail: React.FC<{
  app: StoreApp;
  onBack: () => void;
  onPurchase: (app: StoreApp) => void;
  isPurchased: boolean;
}> = ({ app, onBack, onPurchase, isPurchased }) => (
  <div className="h-full flex flex-col bg-[#1e1e2e]">
    {/* Header */}
    <div className="h-16 bg-[#252535] border-b border-white/5 flex items-center px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Volver
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-8 mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-6xl">
            {app.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-medium text-white mb-2">{app.name}</h1>
            <p className="text-gray-400 mb-4">{app.developer}</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{app.rating}</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{app.downloads.toLocaleString()} descargas</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{app.size}</span>
            </div>
            <button
              onClick={() => onPurchase(app)}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isPurchased
                  ? 'bg-green-500/20 text-green-400 flex items-center gap-2'
                  : app.isPaid
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPurchased ? (
                <>
                  <Check className="w-5 h-5" />
                  Instalado
                </>
              ) : app.isPaid ? (
                `Comprar $${app.price}`
              ) : (
                'Instalar gratis'
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <h2 className="text-xl font-medium text-white mb-4">Descripción</h2>
            <p className="text-gray-300 leading-relaxed mb-6">{app.description}</p>
            
            <h2 className="text-xl font-medium text-white mb-4">Permisos</h2>
            <div className="flex flex-wrap gap-2">
              {app.permissions.map(perm => (
                <span key={perm} className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm">
                  {perm}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#252535] rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Información</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Versión</span>
                <span className="text-white">{app.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categoría</span>
                <span className="text-white">{app.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tamaño</span>
                <span className="text-white">{app.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Publicado</span>
                <span className="text-white">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
