import { useEffect } from 'react';
import { useWebOSStore } from '@/store';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Notification } from '@/types';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useWebOSStore();

  return (
    <div className="fixed top-4 right-4 z-[100000] space-y-2">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, notification.duration);
    return () => clearTimeout(timer);
  }, [notification.duration, onClose]);

  const icons = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
  };

  const borders = {
    info: 'border-blue-500/30',
    success: 'border-green-500/30',
    warning: 'border-yellow-500/30',
    error: 'border-red-500/30',
  };

  const borderClass = borders[notification.type];

  return (
    <div 
      className={`w-80 bg-[#2a2a3a]/95 backdrop-blur-lg border ${borderClass} rounded-lg shadow-xl p-4 animate-in slide-in-from-right-2 duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {notification.icon ? (
            <span className="text-xl">{notification.icon}</span>
          ) : (
            icons[notification.type]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
          )}
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
