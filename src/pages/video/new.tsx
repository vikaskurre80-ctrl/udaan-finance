import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Alert } from '@/components/Alert';
import { useRouter } from 'next/router';

interface Client {
  id: string;
  name: string;
  shopName: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export default function AddVideoPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [assignments, setAssignments] = useState({
    shooterId: '',
    editorId: '',
    smmId: '',
    adsId: '',
    clientManagerId: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, teamRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/team')
        ]);

        if (clientsRes.ok) setClients(await clientsRes.json());
        if (teamRes.ok) setTeamMembers(await teamRes.json());
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }
    if (!formData.title) {
      setError('Video title is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assignments,
        }),
      });

      if (!response.ok) throw new Error('Failed to save video');

      setShowSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving video:', err);
      setError(err.message || 'Failed to save video. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Add Video" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        {showSuccess && (
          <div className="mb-6"><Alert type="success" title="Video Logged!" message="Video created and tasks assigned. Awaiting Admin Approval." /></div>
        )}
        {error && (
          <div className="mb-6"><Alert type="error" title="Error" message={error} onClose={() => setError(null)} /></div>
        )}

        <div className="card p-6 md:p-8 mt-2">
          <h2 className="text-2xl font-bold text-apple-text mb-2">Log New Video</h2>
          <p className="text-apple-text-secondary mb-8">Assign roles to team members. Payments will be held pending Admin Approval.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Select Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="input-field w-full"
                  required
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.shopName || client.name}</option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Video Name *"
                placeholder="e.g. Kurta Promo Reel"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-apple-text mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div className="divider" />
            <h3 className="text-lg font-semibold text-apple-text">Assign Team</h3>
            <div className="bg-apple-bg border border-apple-border rounded-apple-lg p-6 grid gap-4">

              <div className="flex items-center justify-between">
                <span className="font-medium text-apple-text w-1/3">Shooter (₹100)</span>
                <select
                  className="input-field w-2/3 py-2"
                  value={assignments.shooterId}
                  onChange={e => setAssignments({...assignments, shooterId: e.target.value})}
                >
                  <option value="">-- Assign Shooter --</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-apple-text w-1/3">Editor (₹150)</span>
                <select
                  className="input-field w-2/3 py-2"
                  value={assignments.editorId}
                  onChange={e => setAssignments({...assignments, editorId: e.target.value})}
                >
                  <option value="">-- Assign Editor --</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-apple-text w-1/3">SMM (₹50)</span>
                <select
                  className="input-field w-2/3 py-2"
                  value={assignments.smmId}
                  onChange={e => setAssignments({...assignments, smmId: e.target.value})}
                >
                  <option value="">-- Assign SMM --</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-apple-text w-1/3">Ads (₹50)</span>
                <select
                  className="input-field w-2/3 py-2"
                  value={assignments.adsId}
                  onChange={e => setAssignments({...assignments, adsId: e.target.value})}
                >
                  <option value="">-- Assign Ads --</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-apple-text w-1/3">Client Manager (₹50)</span>
                <select
                  className="input-field w-2/3 py-2"
                  value={assignments.clientManagerId}
                  onChange={e => setAssignments({...assignments, clientManagerId: e.target.value})}
                >
                  <option value="">-- Assign Manager --</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">Notes (Optional)</label>
              <textarea
                placeholder="Any special instructions..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="flex-1">
                Submit Video for Approval
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => router.push('/dashboard')} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
