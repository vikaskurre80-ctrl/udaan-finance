import React from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { useRouter } from 'next/router';

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <Layout
      sidebar={
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      }
      header={
        <Header
          title="Settings"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-apple-text mb-6">Settings</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-apple-text mb-4">
                Application
              </h3>
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded-md border-apple-border text-apple-blue focus:ring-apple-blue/20" defaultChecked />
                <span className="text-apple-text">Enable notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded-md border-apple-border text-apple-blue focus:ring-apple-blue/20" />
                <span className="text-apple-text-secondary">Dark mode</span>
              </label>
            </div>

            <div className="divider"></div>

            <div>
              <h3 className="text-lg font-semibold text-apple-text mb-4">
                Account
              </h3>
              <Button
                variant="secondary"
                onClick={() => {
                  router.push('/login');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
