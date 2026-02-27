import React, { useEffect, useState } from 'react';
import { useWebOSStore } from '@/store';

export const BootScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Iniciando WebOS...');
  const { setBootStage } = useWebOSStore();

  useEffect(() => {
    const stages = [
      { progress: 10, status: 'Iniciando kernel...', delay: 500 },
      { progress: 25, status: 'Cargando drivers...', delay: 800 },
      { progress: 40, status: 'Inicializando sistema de archivos...', delay: 600 },
      { progress: 55, status: 'Cargando servicios...', delay: 700 },
      { progress: 70, status: 'Iniciando interfaz de usuario...', delay: 800 },
      { progress: 85, status: 'Cargando configuración...', delay: 600 },
      { progress: 100, status: 'Listo', delay: 500 },
    ];

    let currentStage = 0;
    
    const runStage = () => {
      if (currentStage >= stages.length) {
        setTimeout(() => setBootStage('login'), 500);
        return;
      }

      const stage = stages[currentStage];
      setProgress(stage.progress);
      setStatus(stage.status);
      
      setTimeout(() => {
        currentStage++;
        runStage();
      }, stage.delay);
    };

    runStage();
  }, [setBootStage]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100000]">
      {/* Logo */}
      <div className="mb-12">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500 rounded-lg grid grid-cols-2 gap-1 p-1.5 animate-pulse">
            <div className="bg-blue-500 rounded-sm" />
            <div className="bg-blue-500 rounded-sm" />
            <div className="bg-blue-500 rounded-sm" />
            <div className="bg-blue-500 rounded-sm" />
          </div>
          <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full" />
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="relative mb-8">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin" />
      </div>

      {/* Status */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4">{status}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-600 text-xs">WebOS 11 Professional</p>
        <p className="text-gray-700 text-xs">Build 26100.3476</p>
      </div>
    </div>
  );
};
