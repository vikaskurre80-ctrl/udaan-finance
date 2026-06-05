import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { useRouter } from 'next/router';
import { Alert } from '@/components/Alert';

export default function AddClientPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    location: '',
    packagePrice: '',
    totalReels: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const pricePerReel = Number(formData.packagePrice) > 0 && Number(formData.totalReels) > 0 ? Math.round(Number(formData.packagePrice) / Number(formData.totalReels)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packagePrice: Number(formData.packagePrice),
          totalReels: Number(formData.totalReels),
          pricePerReel,
        }),
      });

      if (!response.ok) throw new Error('Failed to create client');
      router.push('/admin/clients');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="Add New Client" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {error && <div className="mb-6"><Alert type="error" title="Error" message={error} /></div>}

        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-apple-text mb-6">Client Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Client Name" placeholder="e.g. Rahul Kumar" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <FormInput label="Shop/Business Name" placeholder="e.g. Boyzone" value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} required />
              <FormInput label="Location" placeholder="e.g. Pandri" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input-field w-full" required />
              </div>
            </div>

            <div className="divider" />
            <h3 className="text-lg font-semibold text-apple-text">Package Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Total Package Price (₹)" type="number" placeholder="e.g. 6000" value={formData.packagePrice} onChange={(e) => setFormData({ ...formData, packagePrice: e.target.value })} required min="0" />
              <FormInput label="Total Reels" type="number" placeholder="e.g. 12" value={formData.totalReels} onChange={(e) => setFormData({ ...formData, totalReels: e.target.value })} required min="1" />
            </div>

            <div className="bg-apple-bg border border-apple-border rounded-apple-lg p-4 flex items-center justify-between">
              <span className="text-apple-text-secondary font-medium">Auto-calculated Price Per Reel:</span>
              <span className="text-xl font-bold text-apple-text">₹{pricePerReel}</span>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full md:w-auto">Save Client</Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => router.back()} className="w-full md:w-auto">Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
