import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  X,
  DollarSign,
  Film,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const router = useRouter();

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Clients', href: '/admin/clients' },
    { icon: TrendingUp, label: 'Revenue', href: '/revenue' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: DollarSign, label: 'Salaries', href: '/admin/work-approvals' },
    { icon: Film, label: 'Reel Approvals', href: '/admin/reels/approvals' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-xl border-r border-apple-border shadow-apple-sm z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-apple-border">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-apple-text tracking-tight">
              Udaan<span className="text-apple-blue">Works</span>
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-apple-bg text-apple-text-secondary rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-apple-text-tertiary uppercase tracking-widest font-semibold mt-2">
            Finance Dashboard
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item: any, idx) => {
            if (item.type === 'separator') {
              return <div key={idx} className="my-4 border-t border-apple-border" />;
            }

            if (item.type === 'section') {
              return (
                <div key={idx} className="px-4 py-2 mt-6 mb-2">
                  <p className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-widest">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-apple transition-all cursor-pointer block ${
                  isActive
                    ? 'bg-apple-blue-light text-apple-blue font-semibold'
                    : 'text-apple-text-secondary hover:bg-apple-bg hover:text-apple-text'
                }`}
                onClick={() => onClose?.()}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-apple-blue' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-apple-border">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-apple text-apple-text-secondary hover:bg-apple-bg hover:text-apple-text transition-colors cursor-pointer block"
            onClick={() => onClose?.()}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
