import { useState, useEffect } from 'react';
import { 
  Cpu, MemoryStick, HardDrive, Activity, 
  X
} from 'lucide-react';
import { useWebOSStore, windowActions } from '@/store';

export const TaskManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'services'>('processes');
  const windows = useWebOSStore(state => state.windows);
  const [processes, setProcesses] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    cpu: number;
    memory: number;
    status: 'running' | 'suspended';
  }>>([]);

  useEffect(() => {
    // Generate process data from windows
    const windowProcesses = windows.map(w => ({
      id: w.id,
      name: w.title,
      icon: w.icon,
      cpu: Math.random() * 5,
      memory: Math.floor(Math.random() * 200) + 50,
      status: w.isMinimized ? 'suspended' as const : 'running' as const
    }));

    // Add system processes
    const systemProcesses = [
      { id: 'sys-1', name: 'WebOS Shell', icon: '🖥️', cpu: 1.2, memory: 85, status: 'running' as const },
      { id: 'sys-2', name: 'WebOS Compositor', icon: '🎨', cpu: 2.5, memory: 120, status: 'running' as const },
      { id: 'sys-3', name: 'Service Host', icon: '⚙️', cpu: 0.3, memory: 45, status: 'running' as const },
      { id: 'sys-4', name: 'Runtime Broker', icon: '🔧', cpu: 0.1, memory: 22, status: 'running' as const },
      { id: 'sys-5', name: 'System Idle', icon: '💤', cpu: 85, memory: 0, status: 'running' as const },
      { id: 'sys-6', name: 'WebOS Defender', icon: '🛡️', cpu: 0.8, memory: 95, status: 'running' as const },
      { id: 'sys-7', name: 'Search Indexer', icon: '🔍', cpu: 0.2, memory: 35, status: 'running' as const },
      { id: 'sys-8', name: 'Audio Service', icon: '🔊', cpu: 0.5, memory: 28, status: 'running' as const },
      { id: 'sys-9', name: 'Network Manager', icon: '🌐', cpu: 0.3, memory: 40, status: 'running' as const },
    ];

    setProcesses([...windowProcesses, ...systemProcesses]);
  }, [windows]);

  const endTask = (id: string) => {
    if (id.startsWith('win-')) {
      windowActions.closeWindow(id);
    }
    setProcesses(processes.filter(p => p.id !== id));
  };

  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0);
  const totalMemory = processes.reduce((sum, p) => sum + p.memory, 0);

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e]">
      {/* Tabs */}
      <div className="h-10 bg-[#252535] border-b border-white/5 flex items-center px-4">
        <button
          onClick={() => setActiveTab('processes')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'processes' 
              ? 'text-blue-400 border-blue-500' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Procesos
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'performance' 
              ? 'text-blue-400 border-blue-500' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Rendimiento
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'services' 
              ? 'text-blue-400 border-blue-500' 
              : 'text-gray-400 border-transparent hover:text-white'
          }`}
        >
          Servicios
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'processes' && (
          <div>
            <table className="w-full">
              <thead className="bg-[#1a1a28] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-normal text-gray-500 uppercase">Nombre</th>
                  <th className="text-right px-4 py-2 text-xs font-normal text-gray-500 uppercase">CPU</th>
                  <th className="text-right px-4 py-2 text-xs font-normal text-gray-500 uppercase">Memoria</th>
                  <th className="text-left px-4 py-2 text-xs font-normal text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {processes.map(process => (
                  <tr 
                    key={process.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{process.icon}</span>
                        <span className="text-gray-300 text-sm">{process.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-300 text-sm">
                      {process.cpu.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right text-gray-300 text-sm">
                      {process.memory.toFixed(0)} MB
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        process.status === 'running' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {process.status === 'running' ? 'En ejecución' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => endTask(process.id)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 bg-[#1a1a28] border-t border-white/5 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {processes.length} procesos en ejecución
              </span>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-400">
                  CPU: <span className="text-blue-400">{totalCpu.toFixed(1)}%</span>
                </span>
                <span className="text-gray-400">
                  Memoria: <span className="text-purple-400">{totalMemory.toFixed(0)} MB</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-6 space-y-6">
            <PerformanceCard 
              icon={Cpu}
              title="CPU"
              value={`${(totalCpu / 4).toFixed(1)}%`}
              subtitle="WebCore vCPU @ Browser"
              color="bg-blue-500"
              percent={Math.min(totalCpu / 4, 100)}
            />
            <PerformanceCard 
              icon={MemoryStick}
              title="Memoria"
              value={`${totalMemory.toFixed(0)} MB`}
              subtitle="Virtual (Ilimitada)"
              color="bg-purple-500"
              percent={Math.min(totalMemory / 10, 100)}
            />
            <PerformanceCard 
              icon={HardDrive}
              title="Disco"
              value="0%"
              subtitle="C: 128 GB libres"
              color="bg-green-500"
              percent={0}
            />
            <PerformanceCard 
              icon={Activity}
              title="Red"
              value="0 Mbps"
              subtitle="WebOS-Network"
              color="bg-orange-500"
              percent={5}
            />
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <table className="w-full">
              <thead className="bg-[#1a1a28] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-normal text-gray-500 uppercase">Nombre</th>
                  <th className="text-left px-4 py-2 text-xs font-normal text-gray-500 uppercase">Descripción</th>
                  <th className="text-left px-4 py-2 text-xs font-normal text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-4 py-2 text-xs font-normal text-gray-500 uppercase">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'WebAudio', desc: 'Servicio de audio', status: 'running', type: 'Automático' },
                  { name: 'WebNet', desc: 'Servicio de red', status: 'running', type: 'Automático' },
                  { name: 'WebDefender', desc: 'Servicio de seguridad', status: 'running', type: 'Automático' },
                  { name: 'WebUpdate', desc: 'Servicio de actualización', status: 'stopped', type: 'Manual' },
                  { name: 'WebPrint', desc: 'Cola de impresión', status: 'stopped', type: 'Manual' },
                  { name: 'WebSearch', desc: 'Indexación de búsqueda', status: 'running', type: 'Automático' },
                ].map(service => (
                  <tr 
                    key={service.name}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-2 text-gray-300 text-sm">{service.name}</td>
                    <td className="px-4 py-2 text-gray-400 text-sm">{service.desc}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        service.status === 'running' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {service.status === 'running' ? 'En ejecución' : 'Detenido'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-sm">{service.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const PerformanceCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  percent: number;
}> = ({ icon: Icon, title, value, subtitle, color, percent }) => (
  <div className="bg-[#252535] rounded-lg p-4">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white font-medium">{title}</span>
          <span className="text-2xl font-light text-white">{value}</span>
        </div>
        <div className="text-sm text-gray-400 mb-2">{subtitle}</div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);
