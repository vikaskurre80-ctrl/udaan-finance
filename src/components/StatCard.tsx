import React from 'react';

interface StatCardProps {
  icon?: React.ReactNode;
  label?: string;
  title?: string;
  value: string | number;
  subtext?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  className?: string;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-gradient-to-br from-apple-blue-light to-transparent border-apple-blue/15',
  green: 'bg-gradient-to-br from-apple-green-light to-transparent border-apple-green/15',
  orange: 'bg-gradient-to-br from-apple-orange-light to-transparent border-apple-orange/15',
  purple: 'bg-gradient-to-br from-apple-purple-light to-transparent border-apple-purple/15',
  red: 'bg-gradient-to-br from-apple-red-light to-transparent border-apple-red/15',
};

const iconColorClasses: Record<string, string> = {
  blue: 'text-apple-blue',
  green: 'text-apple-green',
  orange: 'text-apple-orange',
  purple: 'text-apple-purple',
  red: 'text-apple-red',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  title,
  value,
  subtext,
  subtitle,
  trend,
  trendValue,
  color = 'blue',
  className = '',
}) => {
  const displayLabel = label || title || '';
  const displaySubtext = subtext || subtitle || '';
  const bgClass = colorClasses[color];
  const iconColorClass = iconColorClasses[color];

  return (
    <div className={`card p-6 ${bgClass} ${className} relative overflow-hidden group`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className={`text-xs font-semibold tracking-wider uppercase ${iconColorClass} mb-2`}>{displayLabel}</div>
          <div className="text-3xl font-bold text-apple-text mb-1">{value}</div>
          {displaySubtext && <div className="text-xs text-apple-text-secondary font-medium">{displaySubtext}</div>}
          {trend && trendValue && (
            <div
              className={`text-sm font-bold mt-3 px-2 py-1 inline-block rounded-apple bg-apple-bg border border-apple-border ${
                trend === 'up'
                  ? 'text-apple-green border-apple-green/20'
                  : trend === 'down'
                  ? 'text-apple-red border-apple-red/20'
                  : 'text-apple-text-secondary border-apple-border'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`ml-4 p-3 rounded-apple bg-apple-bg border border-apple-border group-hover:scale-110 transition-transform ${iconColorClass}`}>
            {Icon}
          </div>
        )}
      </div>
    </div>
  );
};
