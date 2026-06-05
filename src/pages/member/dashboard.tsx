import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { StatCard } from '@/components/StatCard';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { TrendingUp, DollarSign, LogOut, Video } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { formatCurrency } from '@/utils/calculations';
import { format } from 'date-fns';

interface WorkSubmission {
  id: string;
  title: string;
  description: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  paidStatus?: 'PAID' | 'PENDING';
  submittedAt: Date;
  clientId?: string;
  clientName?: string;
  role?: string;
}

export default function MemberDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', quantity: '1' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/work-entries/list');
      if (res.ok) {
        const data: any[] = await res.json();
        const userSubmissions = data.filter((e) => e.userId === user.id || e.teamMember?.userId === user.id);
        const formatted = userSubmissions.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          amount: s.totalAmount,
          quantity: s.quantity,
          status: ((s.status || 'PENDING').toLowerCase()) as 'pending' | 'approved' | 'rejected',
          paidStatus: s.approval?.paidStatus || 'PENDING',
          submittedAt: new Date(s.createdAt),
          clientId: s.clientId,
          clientName: s.client?.name || s.client?.shopName || 'Unknown',
          role: s.role,
        }));
        setSubmissions(formatted);
      }
    } catch (e) { console.error('Error fetching submissions:', e); }
  };

  if (!user || user.isAdmin) return null;

  const role = String(user.role || 'shoot');
  const roleRate = role === 'edit' ? 150 : role === 'client_manager' ? 50 : role === 'smm' || role === 'ads' ? 50 : 100;

  const approvedAmount = submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.amount, 0);
  const pendingAmount = submissions.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!formData.title) {
      setMessage('⚠️ Please enter work title');
      return;
    }
    const qty = parseInt(formData.quantity || '1', 10);
    if (isNaN(qty) || qty < 1) {
      setMessage('⚠️ Quantity must be at least 1');
      return;
    }

    try {
      const response = await fetch('/api/work-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          title: formData.title,
          description: formData.description,
          quantity: qty,
          ratePerTask: roleRate,
          clientId: '',
          role,
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit work');

      setMessage('✅ Work submitted for approval!');
      setShowForm(false);
      setFormData({ title: '', description: '', quantity: '1' });
      setTimeout(() => setMessage(''), 4000);
      fetchSubmissions();
    } catch (error) {
      setMessage('⚠️ Failed to submit. Please try again.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  const getRoleLabel = () => {
    const map: Record<string, string> = { shoot: 'Shooter', edit: 'Editor', smm: 'SMM', ads: 'Ads Manager', client_manager: 'Client Manager', founder: 'Founder' };
    return map[role] || role.toUpperCase();
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-apple-text tracking-tight">👤 {getRoleLabel()} Dashboard</h1>
          <p className="text-apple-text-secondary mt-1">Welcome, {user.name}</p>
        </div>
        <Button variant="secondary" size="md" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {message && <Alert type={message.includes('✅') ? 'success' : 'warning'} message={message} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={<DollarSign className="w-7 h-7" />}
          label="Total Earned"
          value={formatCurrency(approvedAmount)}
          subtext="All approved work"
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-7 h-7" />}
          label="Pending Approval"
          value={formatCurrency(pendingAmount)}
          subtext={`${submissions.filter(s => s.status === 'pending').length} submissions`}
          color="orange"
        />
        <StatCard
          icon={<Video className="w-7 h-7" />}
          label="Per Unit Rate"
          value={`₹${roleRate}`}
          subtext={getRoleLabel()}
          color="blue"
        />
      </div>

      {/* Submit Work */}
      <div className="card p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-apple-text">Submit Work</h2>
            <p className="text-sm text-apple-text-secondary mt-1">Log your completed work per client</p>
          </div>
          <Button variant={showForm ? 'secondary' : 'primary'} size="md" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Submission'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-5 bg-apple-bg p-6 rounded-apple-lg border border-apple-border">
            <div className="bg-apple-blue-light/50 border border-apple-blue/15 rounded-apple p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider">Role</p>
                <p className="font-semibold text-apple-text">{getRoleLabel()}</p>
              </div>
              <div>
                <p className="text-xs text-apple-text-tertiary font-bold uppercase tracking-wider">Rate Per Unit</p>
                <p className="font-bold text-apple-blue text-xl">₹{roleRate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-apple-text mb-2">Work Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Boyzone Kurta Shoot"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-apple-text mb-2">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-apple-text mb-2">Description</label>
              <textarea
                placeholder="Describe work completed..."
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" variant="primary" size="lg" className="flex-1">Submit for Approval</Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </form>
        )}
      </div>

      {/* History */}
      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-bold text-apple-text mb-6">Submissions History</h2>
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-apple border border-apple-border hover:border-apple-blue/30 transition-colors">
                <div>
                  <p className="font-semibold text-apple-text">{s.title}</p>
                  <p className="text-sm text-apple-text-secondary">{format(s.submittedAt, 'dd MMM yyyy')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${
                    s.status === 'approved' ? 'badge-success' : s.status === 'pending' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {s.status === 'approved' ? '✓ Approved' : s.status === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                  </span>
                  <span className="font-bold text-apple-text">₹{s.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-apple-text-secondary py-12">No submissions yet</p>
        )}
      </div>
    </Layout>
  );
}
