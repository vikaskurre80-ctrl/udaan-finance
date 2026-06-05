import React from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useRouter } from 'next/router';

export default function RevenueRoutePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    router.push('/dashboard');
  }, [router]);

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
          title="Revenue"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-8 flex items-center justify-center h-screen">
        <p className="text-apple-600">Redirecting...</p>
      </div>
    </Layout>
  );
}
