import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';

const ROLE_RATES: Record<string, number> = {
  shoot: 100,
  edit: 150,
  smm: 50,
  ads: 50,
  client_manager: 50,
  founder: 100,
};

const ROLE_LABELS: Record<string, string> = {
  shoot: 'Shooter',
  edit: 'Editor',
  smm: 'SMM',
  ads: 'Ads',
  client_manager: 'Client Manager',
  founder: 'Company Fund',
};

export default function SubmitWorkPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]));
  }, []);

  if (!user) return null;

  const userRole = user.role || 'shoot';
  const ratePerTask = ROLE_RATES[userRole] || 100;
  const totalAmount = (parseInt(quantity || '0', 10) || 0) * ratePerTask;

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!selectedClientId) {
      setErrors(prev => ({ ...prev, client: 'Please select a client' }));
      return;
    }
    if (!quantity || isNaN(parseInt(quantity))) {
      setErrors(prev => ({ ...prev, quantity: 'Valid quantity is required' }));
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/work-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          title: `${ROLE_LABELS[userRole] || userRole} - ${selectedClient?.name || 'Client'}`,
          description: `${ROLE_LABELS[userRole] || userRole} work for ${selectedClient?.name || 'Client'}`,
          quantity: parseInt(quantity, 10),
          ratePerTask,
          clientId: selectedClientId,
          date: new Date(date).toISOString(),
          role: userRole,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit work');

      setShowSuccess(true);
      setQuantity('1');
      setSelectedClientId('');
      setTimeout(() => {
        router.push(user.isAdmin ? '/admin/approvals' : '/member/dashboard');
      }, 1500);
    } catch (err) {
      setErrors(prev => ({ ...prev, form: 'Failed to submit work. Try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Submit Work" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        {showSuccess && (
          <Alert type="success" title="Work Submitted!" message="Submitted successfully. Redirecting..." closable={false} />
        )}

        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-apple-text mb-1">Submit Work</h2>
          <p className="text-apple-text-secondary mb-8">
            {ROLE_LABELS[userRole] || userRole} • ₹{ratePerTask} per unit
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Client */}
            <div>
              <label className="block text-sm font-semibold text-apple-text mb-2">Select Client *</label>
              <select
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className={`input-field ${errors.client ? 'border-apple-red' : ''}`}
              >
                <option value="">-- Choose Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.shopName || c.name}</option>
                ))}
              </select>
              {errors.client && <p className="text-apple-red text-sm mt-1">{errors.client}</p>}
            </div>

            {/* Step 2: Auto Client Data */}
            {selectedClient && (
              <div className="bg-apple-bg border border-apple-border rounded-apple-lg p-5 grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                <div>
                  <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider mb-1">Location</p>
                  <p className="font-semibold text-apple-text">{selectedClient.location || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider mb-1">Package</p>
                  <p className="font-semibold text-apple-text">₹{selectedClient.packagePrice?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider mb-1">Total Reels</p>
                  <p className="font-semibold text-apple-text">{selectedClient.totalReels}</p>
                </div>
                <div>
                  <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider mb-1">Completed</p>
                  <p className="font-semibold text-apple-green">{selectedClient.completedReels}</p>
                </div>
                <div>
                  <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider mb-1">Pending</p>
                  <p className="font-semibold text-apple-orange">{(selectedClient.totalReels || 0) - (selectedClient.completedReels || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider mb-1">Avg Reel Price</p>
                  <p className="font-semibold text-apple-text">₹{selectedClient.pricePerReel}</p>
                </div>
              </div>
            )}

            {/* Step 3: Work Entry Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-apple-text mb-2">Role</label>
                <input
                  type="text"
                  value={ROLE_LABELS[userRole] || userRole}
                  disabled
                  className="input-field bg-apple-bg text-apple-text-secondary font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-apple-text mb-2">Price Per Unit</label>
                <input
                  type="text"
                  value={`₹${ratePerTask}`}
                  disabled
                  className="input-field bg-apple-bg text-apple-text-secondary font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-apple-text mb-2">Quantity *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className={`input-field text-lg ${errors.quantity ? 'border-apple-red' : ''}`}
              />
              {errors.quantity && <p className="text-apple-red text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div className="bg-apple-green-light border border-apple-green/15 rounded-apple p-4 flex items-center justify-between">
              <span className="text-apple-green font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-apple-green">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-apple-text mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>

            {errors.form && <Alert type="error" title="Error" message={errors.form} />}

            <div className="flex gap-4 pt-2">
              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="flex-1">
                Submit Work
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
