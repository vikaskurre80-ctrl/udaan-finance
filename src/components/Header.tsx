import React from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { Menu, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showMenu = false,
  onMenuClick,
}) => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-apple-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-apple-bg rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-apple-text" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-apple-text tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 hover:bg-apple-bg rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-apple-text-secondary" />
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="p-2 hover:bg-apple-red-light rounded-lg transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-apple-red" />
          </button>
        </div>
      </div>
    </header>
  );
};
