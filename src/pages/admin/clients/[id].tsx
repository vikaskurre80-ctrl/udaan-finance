import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { FormInput } from '@/components/FormInput';
import { formatDate } from '@/utils/calculations';

export default function ClientDashboard() {
  const router = useRouter();
  const { id } = router.query;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id || Array.isArray(id) || String(id).includes('[')) {
      router.replace('/admin/clients');
      return;
    }
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error('Failed to load client details');
      const data = await res.json();
      setClient(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add payment');
      }
      setShowPaymentModal(false);
      setPaymentAmount('');
      fetchClient();
    } catch (err: any) {
      alert(err.message || 'Failed to add payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoAction = async (videoId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`Failed to ${action} video`);
      fetchClient();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <Layout sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />} header={<Header title="Loading..." />}>
        <div className="p-8 text-center text-apple-text-secondary">Loading client data...</div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />} header={<Header title="Error" />}>
        <div className="p-8">
          <Alert type="error" title="Error" message={error || 'Client not found'} />
          <Button variant="secondary" onClick={() => router.push('/admin/clients')} className="mt-4">Back to Clients</Button>
        </div>
      </Layout>
    );
  }

  const totalEarned = (client.completedReels || 0) * (client.pricePerReel || 500);
  const pendingCollection = totalEarned - (client.totalReceived || 0);
  const progressPercentage = client.totalReels > 0 ? Math.round(((client.completedReels || 0) / client.totalReels) * 100) : 0;

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title={client.shopName || client.name} showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-apple-900">{client.shopName || client.name}</h1>
            <p className="text-apple-500">Client Dashboard & Finance Tracker</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/admin/clients')}>&larr; Back</Button>
            <Button variant="primary" onClick={() => router.push('/video/new')}>+ Add Video</Button>
            <Button variant="primary" onClick={() => setShowPaymentModal(true)}>+ Payment</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="card p-4">
            <p className="text-sm text-apple-500 mb-1">Package Value</p>
            <h3 className="text-2xl font-bold text-apple-900">₹{client.packagePrice?.toLocaleString() || 0}</h3>
          </div>
          <div className="card p-4">
            <p className="text-sm text-apple-500 mb-1">Total Earned</p>
            <h3 className="text-2xl font-bold text-apple-green">₹{totalEarned.toLocaleString()}</h3>
          </div>
          <div className="card p-4">
            <p className="text-sm text-apple-500 mb-1">Total Received</p>
            <h3 className="text-2xl font-bold text-apple-900">₹{client.totalReceived?.toLocaleString() || 0}</h3>
          </div>
          <div className="card p-4 bg-orange-50 border-orange-200">
            <p className="text-sm text-apple-orange mb-1 font-medium">Pending Collection</p>
            <h3 className="text-2xl font-bold text-apple-orange">₹{Math.max(pendingCollection, 0).toLocaleString()}</h3>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-lg font-bold text-apple-900 mb-1">Reels Progress</h3>
              <p className="text-sm text-apple-500">{client.completedReels || 0} of {client.totalReels || 0} completed</p>
            </div>
            <span className="text-2xl font-bold text-brand-accent">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-apple-100 rounded-full h-4 mb-2">
            <div
              className="bg-brand-accent h-4 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-apple-400">
            <span>0</span>
            <span>{client.totalReels || 0} Reels</span>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="p-6 border-b border-apple-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-apple-900">Video History</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/video/new')}>+ Log Video</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-apple-50 text-apple-500 text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Video Title</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Revenue</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-100">
                {!client.videos || client.videos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-apple-500">No videos logged yet.</td>
                  </tr>
                ) : (
                  client.videos.map((video: any) => (
                    <tr key={video.id} className="hover:bg-apple-50/50 transition-colors">
                      <td className="p-4 text-sm text-apple-600">{formatDate(video.date)}</td>
                      <td className="p-4 font-medium text-apple-900">{video.title}</td>
                      <td className="p-4">
                        <span className={`badge ${
                          video.status === 'COMPLETED' ? 'badge-success'
                          : video.status === 'PENDING' ? 'badge-warning'
                          : 'badge-error'
                        }`}>
                          {video.status}
                        </span>
                      </td>
                      <td className="p-4 text-apple-green font-medium">
                        +₹{(video.totalRevenue || 500).toLocaleString()}
                      </td>
                      <td className="p-4">
                        {video.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleVideoAction(video.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleVideoAction(video.id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-xl font-bold text-apple-900 mb-2">Record Payment</h3>
            <p className="text-sm text-apple-500 mb-6">Log amount received from {client.shopName || client.name}.</p>

            <form onSubmit={handleAddPayment}>
              <FormInput
                label="Amount Received (₹)"
                type="number"
                placeholder="e.g. 2000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
                min="1"
              />
              <div className="flex gap-4 mt-6">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                  Save Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}
