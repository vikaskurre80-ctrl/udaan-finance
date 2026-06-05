import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { useRouter } from 'next/router';
import { Alert } from '@/components/Alert';

interface Client {
  id: string;
  name: string;
  shopName: string;
  location: string;
  packagePrice: number;
  totalReels: number;
  completedReels: number;
  totalReceived: number;
  status: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Clients" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-apple-text">Client Management</h1>
            <p className="text-apple-text-secondary mt-1">Track packages, reels, and payments.</p>
          </div>
          <Button variant="primary" onClick={() => router.push('/admin/clients/new')}>
            + Add Client
          </Button>
        </div>

        {error && <div className="mb-6"><Alert type="error" title="Error" message={error} /></div>}

        {isLoading ? (
          <div className="text-center py-12 text-apple-text-secondary">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="card p-12 text-center">
            <h3 className="text-lg font-medium text-apple-text mb-2">No clients found</h3>
            <p className="text-apple-text-secondary mb-6">Get started by adding your first client.</p>
            <Button variant="primary" onClick={() => router.push('/admin/clients/new')}>
              Add First Client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const pendingAmount = client.packagePrice - client.totalReceived;
              const progressPercentage = Math.round((client.completedReels / client.totalReels) * 100) || 0;

              return (
                <div key={client.id} className="card p-6 flex flex-col h-full cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => router.push(`/admin/clients/${client.id}`)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-apple-text text-lg truncate">{client.shopName || client.name}</h3>
                      <p className="text-sm text-apple-text-secondary">{client.location}</p>
                    </div>
                    <span className={`badge ${client.status === 'ACTIVE' ? 'badge-info' : 'badge-success'}`}>
                      {client.status}
                    </span>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between text-sm">
                      <span className="text-apple-text-secondary">Package Value:</span>
                      <span className="font-semibold text-apple-text">₹{client.packagePrice}</span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-apple-text-secondary">Reels Completed:</span>
                        <span className="font-medium text-apple-text">{client.completedReels} / {client.totalReels}</span>
                      </div>
                      <div className="w-full bg-apple-bg rounded-full h-2">
                        <div
                          className="bg-apple-blue h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="divider"></div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-apple-text-secondary mb-1">Received</p>
                        <p className="font-semibold text-apple-green">₹{client.totalReceived}</p>
                      </div>
                      <div>
                        <p className="text-xs text-apple-text-secondary mb-1">Pending</p>
                        <p className="font-semibold text-apple-orange">₹{pendingAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
