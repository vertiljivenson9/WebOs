import { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, Home, 
  Search, Star, Lock
} from 'lucide-react';

interface BrowserProps {
  initialUrl?: string;
}

export const Browser: React.FC<BrowserProps> = ({ initialUrl = 'webos://home' }) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pages: Record<string, React.ReactNode> = {
    'webos://home': (
      <div className="flex flex-col items-center justify-center min-h-full p-8">
        <div className="text-6xl mb-6">🌐</div>
        <h1 className="text-3xl font-light text-gray-800 mb-2">WebOS Browser</h1>
        <p className="text-gray-500 mb-8">Tu navegador integrado en WebOS Professional</p>
        
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en la web o escribir URL..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-blue-500 focus:outline-none shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (value) navigateTo(`https://www.google.com/search?q=${encodeURIComponent(value)}`);
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
          <QuickLink 
            title="WebOS Store" 
            url="webos://store" 
            icon="🏪"
            onClick={navigateTo}
          />
          <QuickLink 
            title="Documentación" 
            url="webos://docs" 
            icon="📚"
            onClick={navigateTo}
          />
          <QuickLink 
            title="Noticias" 
            url="webos://news" 
            icon="📰"
            onClick={navigateTo}
          />
          <QuickLink 
            title="Comunidad" 
            url="webos://community" 
            icon="👥"
            onClick={navigateTo}
          />
        </div>
      </div>
    ),
    'webos://store': (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-gray-800 mb-6">🏪 WebOS Store</h1>
        <p className="text-gray-600 mb-8">Descubre y descarga aplicaciones para tu WebOS.</p>
        
        <div className="grid grid-cols-3 gap-4">
          {['Productividad', 'Entretenimiento', 'Desarrollo', 'Diseño', 'Juegos', 'Utilidades'].map(cat => (
            <div key={cat} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium text-gray-800">{cat}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    'webos://news': (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-light text-gray-800 mb-6">📰 Noticias WebOS</h1>
        
        <div className="space-y-4">
          <NewsCard 
            title="WebOS 11 Pro lanzado oficialmente"
            date="28 Feb 2026"
            summary="La nueva versión trae mejoras significativas en rendimiento y nuevas características para desarrolladores."
          />
          <NewsCard 
            title="Nuevo sistema de tienda de aplicaciones"
            date="25 Feb 2026"
            summary="Los desarrolladores ahora pueden monetizar sus aplicaciones con integración de pagos."
          />
          <NewsCard 
            title="Actualización de seguridad importante"
            date="20 Feb 2026"
            summary="Se han parcheado varias vulnerabilidades críticas. Se recomienda actualizar inmediatamente."
          />
        </div>
      </div>
    ),
    'webos://docs': (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-light text-gray-800 mb-6">📚 Documentación</h1>
        
        <div className="space-y-6">
          <DocSection title="Guía de inicio rápido" content="Aprende los conceptos básicos de WebOS y cómo navegar por el sistema." />
          <DocSection title="Desarrollo de aplicaciones" content="Crea aplicaciones para WebOS usando nuestra API y framework." />
          <DocSection title="API Reference" content="Documentación completa de la API del sistema." />
          <DocSection title="Mejores prácticas" content="Consejos para crear aplicaciones de alta calidad." />
        </div>
      </div>
    ),
    'webos://community': (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-light text-gray-800 mb-6">👥 Comunidad WebOS</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <CommunityCard title="Foro" description="Discute con otros usuarios y desarrolladores" icon="💬" />
          <CommunityCard title="Discord" description="Únete a nuestro servidor oficial" icon="🎮" />
          <CommunityCard title="GitHub" description="Contribuye al código abierto" icon="🐙" />
          <CommunityCard title="Twitter" description="Sigue las últimas noticias" icon="🐦" />
        </div>
      </div>
    )
  };

  function navigateTo(newUrl: string) {
    if (pages[newUrl] || newUrl.startsWith('http')) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setUrl(newUrl);
      setInputUrl(newUrl);
    } else {
      setUrl('error');
    }
  }

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setUrl(history[historyIndex - 1]);
      setInputUrl(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setUrl(history[historyIndex + 1]);
      setInputUrl(history[historyIndex + 1]);
    }
  };

  const refresh = () => {
    setUrl(url);
  };

  const goHome = () => {
    navigateTo('webos://home');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputUrl;
    if (!targetUrl.includes('://') && !targetUrl.startsWith('webos://')) {
      targetUrl = `https://${targetUrl}`;
    }
    navigateTo(targetUrl);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="h-12 bg-[#f8f9fa] border-b border-gray-200 flex items-center px-3 gap-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={refresh}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <RotateCw className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={goHome}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center">
          <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-1.5 mx-2">
            {url.startsWith('https') && <Lock className="w-4 h-4 text-green-500 mr-2" />}
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <Star className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {pages[url] || (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl mb-2">No se puede acceder a este sitio</h2>
            <p className="text-gray-400">{url}</p>
            <p className="text-sm text-gray-400 mt-2">Este es un navegador virtual de WebOS</p>
            <button 
              onClick={goHome}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickLink: React.FC<{
  title: string;
  url: string;
  icon: string;
  onClick: (url: string) => void;
}> = ({ title, url, icon, onClick }) => (
  <button
    onClick={() => onClick(url)}
    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
  >
    <span className="text-2xl">{icon}</span>
    <span className="font-medium text-gray-700">{title}</span>
  </button>
);

const NewsCard: React.FC<{
  title: string;
  date: string;
  summary: string;
}> = ({ title, date, summary }) => (
  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
    <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
    <p className="text-xs text-gray-400 mb-2">{date}</p>
    <p className="text-sm text-gray-600">{summary}</p>
  </div>
);

const DocSection: React.FC<{
  title: string;
  content: string;
}> = ({ title, content }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
    <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{content}</p>
  </div>
);

const CommunityCard: React.FC<{
  title: string;
  description: string;
  icon: string;
}> = ({ title, description, icon }) => (
  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-medium text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);
