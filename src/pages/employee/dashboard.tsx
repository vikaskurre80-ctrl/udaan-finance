import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { DollarSign, TrendingUp, Clock, CheckCircle, LogOut, Video } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { formatCurrency } from '@/utils/calculations';

interface EmployeeEarnings {
  teamMemberId: string;
  teamMemberName: string;
  teamMemberRole: string;
  todayEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingAmount: number;
  paidAmount: number;
  videosCount: number;
  submissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
}

interface WorkSubmission {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  quantity: number;
  status: string;
  createdAt: string;
  approval?: {
    status: string;
    paidStatus: string;
  };
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [earnings, setEarnings] = useState<EmployeeEarnings | null>(null);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newWork, setNewWork] = useState({ title: '', description: '', quantity: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user || user.isAdmin) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.email) {
      fetchEarnings();
    }
  }, [user?.email]);

  const fetchEarnings = async () => {
    if (!user?.email) return;

    try {
      const [earningsRes, submissionsRes] = await Promise.all([
        fetch(`/api/employee/earnings?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/work-entries/list`),
      ]);

      if (earningsRes.ok) {
        setEarnings(await earningsRes.json());
      }

      if (submissionsRes.ok) {
        const data = await submissionsRes.json();
        const filtered = data.filter((e: any) => e.teamMember?.email === user.email);
        setSubmissions(filtered);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWork.title || newWork.quantity < 1) {
      setMessage('⚠️ Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/work-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          name: user?.name,
          title: newWork.title,
          description: newWork.description,
          quantity: newWork.quantity,
          ratePerTask: 0,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit work');

      setMessage('✅ Work submitted successfully!');
      setNewWork({ title: '', description: '', quantity: 0 });
      setShowForm(false);
      setTimeout(() => {
        fetchEarnings();
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage('⚠️ Failed to submit work');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    router.push('/login');
  };

  if (!user || user.isAdmin || loading) return null;

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      shoot: 'Production Manager',
      edit: 'Editor',
      smm: 'Social Media Manager',
      ads: 'Marketing Expert',
      client_manager: 'Client Manager',
    };
    return roleMap[role] || role.toUpperCase();
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-apple-text tracking-tight">👤 My Dashboard</h1>
          <p className="text-apple-text-secondary mt-2">Welcome, {user.name} • <span className="text-apple-blue font-semibold">{getRoleDisplayName(user.role)}</span></p>
        </div>
        <Button variant="secondary" size="md" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {message && (
        <Alert
          type={message.includes('✅') ? 'success' : 'warning'}
          title="Status"
          message={message}
        />
      )}

      {/* Main Stats Cards */}
      {earnings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Today's Earnings */}
          <div className="card p-6 stat-card-gradient-green">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-apple-green text-sm font-semibold tracking-wider uppercase">Today's Earnings</p>
                <p className="text-3xl font-bold text-apple-text mt-2">
                  {formatCurrency(earnings.todayEarnings)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-apple-green/60" />
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="card p-6 stat-card-gradient-blue">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-apple-blue text-sm font-semibold tracking-wider uppercase">Monthly Earnings</p>
                <p className="text-3xl font-bold text-apple-text mt-2">
                  {formatCurrency(earnings.monthlyEarnings)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-apple-blue/60" />
            </div>
          </div>

          {/* Total Earnings */}
          <div className="card p-6 stat-card-gradient-purple">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-apple-purple text-sm font-semibold tracking-wider uppercase">Total Earned</p>
                <p className="text-3xl font-bold text-apple-text mt-2">
                  {formatCurrency(earnings.totalEarnings)}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-apple-purple/60" />
            </div>
          </div>

          {/* Videos Count */}
          <div className="card p-6 stat-card-gradient-orange">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-apple-orange text-sm font-semibold tracking-wider uppercase">Completed Work</p>
                <p className="text-3xl font-bold text-apple-text mt-2">{earnings.videosCount}</p>
              </div>
              <Video className="w-10 h-10 text-apple-orange/60" />
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Cards */}
      {earnings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Pending Payments */}
          <div className="card p-6 stat-card-gradient-red">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-apple-red text-sm font-semibold tracking-wider uppercase">Pending Payment</p>
                <p className="text-4xl font-bold text-apple-text mt-2">
                  {formatCurrency(earnings.pendingAmount)}
                </p>
                <p className="text-sm text-apple-text-secondary mt-2">{earnings.pendingSubmissions} unapproved or unpaid submissions</p>
              </div>
              <Clock className="w-12 h-12 text-apple-red/40" />
            </div>
          </div>

          {/* Paid Payments */}
          <div className="card p-6 stat-card-gradient-green">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-apple-green text-sm font-semibold tracking-wider uppercase">Paid Payment</p>
                <p className="text-4xl font-bold text-apple-text mt-2">
                  {formatCurrency(earnings.paidAmount)}
                </p>
                <p className="text-sm text-apple-text-secondary mt-2">{earnings.approvedSubmissions} approved submissions</p>
              </div>
              <CheckCircle className="w-12 h-12 text-apple-green/40" />
            </div>
          </div>
        </div>
      )}

      {/* Submit Work Section */}
      <div className="card p-8 bg-gradient-to-br from-apple-blue-light/40 to-transparent border-apple-blue/15 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-apple-text tracking-tight">📝 Submit Work</h2>
          <Button
            variant={showForm ? 'secondary' : 'primary'}
            size="md"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Submission'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitWork} className="space-y-6 bg-apple-surface p-6 rounded-apple-lg border border-apple-border">
            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">Work Title *</label>
              <input
                type="text"
                placeholder="e.g., Video Editing Completed"
                value={newWork.title}
                onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">Description</label>
              <textarea
                placeholder="Describe the work completed..."
                rows={3}
                value={newWork.description}
                onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-text mb-2">Videos/Items Completed *</label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={newWork.quantity}
                onChange={(e) => setNewWork({ ...newWork, quantity: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth className="mt-4">
              Submit for Approval
            </Button>
          </form>
        )}
      </div>

      {/* Work History */}
      <div className="card p-8 border-apple-border">
        <h2 className="text-2xl font-bold text-apple-text mb-6 tracking-tight">📋 Work History</h2>
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-5 border border-apple-border rounded-apple-lg bg-apple-bg hover:border-apple-border-strong transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-apple-text text-lg">{submission.title}</h3>
                    {submission.description && <p className="text-sm text-apple-text-secondary mt-1">{submission.description}</p>}
                  </div>
                  <span
                    className={`badge ${
                      submission.status === 'APPROVED'
                        ? 'badge-success'
                        : submission.status === 'PENDING'
                        ? 'badge-warning'
                        : 'badge-error'
                    }`}
                  >
                    {submission.status === 'APPROVED' ? '✓ Approved' : submission.status === 'PENDING' ? '⏳ Pending' : '✗ Rejected'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-apple-text-secondary border-t border-apple-border pt-3 mt-2">
                  <div className="flex items-center gap-4">
                    <span>{submission.quantity} items</span>
                    <span>{new Date(submission.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                   
                   {submission.approval && (
                     <div className="flex items-center gap-2">
                       <span className="text-xs uppercase tracking-wide text-apple-text-tertiary">Payment:</span>
                       <span className={`badge ${
                         submission.approval.paidStatus === 'PAID' 
                           ? 'badge-success' 
                           : 'badge-warning'
                       }`}>
                         {submission.approval.paidStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                       </span>
                     </div>
                   )}
                </div>
                <p className="text-xl font-bold text-apple-text mt-3">
                  {formatCurrency(submission.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-apple-bg rounded-apple-lg border border-apple-border border-dashed">
            <p className="text-apple-text-tertiary text-lg">No work submissions yet. Submit your first work above!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
