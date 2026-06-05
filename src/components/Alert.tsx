import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  closable = true,
  onClose,
}) => {
  const iconClasses = 'w-5 h-5';
  const icons = {
    info: <Info className={`${iconClasses} text-apple-blue`} />,
    success: <CheckCircle className={`${iconClasses} text-apple-green`} />,
    warning: <AlertTriangle className={`${iconClasses} text-apple-orange`} />,
    error: <AlertCircle className={`${iconClasses} text-apple-red`} />,
  };

  const bgColors = {
    info: 'bg-apple-blue-light border-apple-blue/15',
    success: 'bg-apple-green-light border-apple-green/15',
    warning: 'bg-apple-orange-light border-apple-orange/15',
    error: 'bg-apple-red-light border-apple-red/15',
  };

  const textColors = {
    info: 'text-apple-blue',
    success: 'text-apple-green',
    warning: 'text-apple-orange',
    error: 'text-apple-red',
  };

  return (
    <div className={`card border-l-4 p-4 flex items-start gap-3 ${bgColors[type]}`}>
      {icons[type]}
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${textColors[type]} mb-1`}>{title}</h3>}
        <p className="text-sm text-apple-text-secondary">{message}</p>
      </div>
      {closable && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-apple-border rounded transition-colors"
        >
          <X className="w-4 h-4 text-apple-text-secondary" />
        </button>
      )}
    </div>
  );
};
