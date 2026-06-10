import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { useFinanceStore } from '@/store/finance';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { formatCurrency } from '@/utils/calculations';

interface WorkEntry {
  id: string;
  date: Date;
  type: 'shoot' | 'edit' | 'post' | 'script';
  quantity: number;
  rate: number;
  total: number;
  status: 'PENDING' | 'APPROVED';
  paymentStatus: 'PENDING' | 'PAID';
}

const WORK_TYPES = {
  shoot: { label: '🎬 Shoot', rate: 100 },
  edit: { label: '✂️ Edit', rate: 150 },
  post: { label: '📤 Post', rate: 80 },
  script: { label: '📝 Script', rate: 120 },
};

export default function TeamMemberDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAdmin } = useAuthStore();
  const { teamMembers } = useFinanceStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }
    fetchWorkEntries();
  }, [user, isAdmin, router, id]);

  const fetchWorkEntries = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/team/${id}/work`);
      if (res.ok) {
        const data = await res.json();
        setWorkEntries(data.map((w: any) => ({
          id: w.id,
          date: new Date(w.date),
          type: w.role?.toLowerCase().includes('edit') ? 'edit' : 
                w.role?.toLowerCase().includes('post') ? 'post' :
                w.role?.toLowerCase().includes('script') ? 'script' : 'shoot',
          quantity: w.quantity || 1,
          rate: w.ratePerTask || WORK_TYPES[
            w.role?.toLowerCase().includes('edit') ? 'edit' :
            w.role?.toLowerCase().includes('post') ? 'post' :
            w.role?.toLowerCase().includes('script') ? 'script' : 'shoot'
          ].rate,
          total: w.totalAmount || 0,
          status: w.approval?.status || 'PENDING',
          paymentStatus: w.approval?.paidStatus || 'PENDING',
        })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const member = teamMembers.find(m => m.id === id);

  if (!user || !isAdmin) return null;
  if (!member) return <div className="p-8">Loading...</div>;

  const getStats = () => {
    const shootCount = workEntries.filter(e => e.type === 'shoot').reduce((sum, e) => sum + e.quantity, 0);
    const editCount = workEntries.filter(e => e.type === 'edit').reduce((sum, e) => sum + e.quantity, 0);
    const postCount = workEntries.filter(e => e.type === 'post').reduce((sum, e) => sum + e.quantity, 0);
    const scriptCount = workEntries.filter(e => e.type === 'script').reduce((sum, e) => sum + e.quantity, 0);
    
    const earned = workEntries.reduce((sum, e) => sum + (e.status === 'APPROVED' ? e.total : 0), 0);
    const pending = workEntries.reduce((sum, e) => sum + (e.status === 'PENDING' ? e.total : 0), 0);
    const paid = workEntries.reduce((sum, e) => sum + (e.paymentStatus === 'PAID' ? e.total : 0), 0);
    
    return { shootCount, editCount, postCount, scriptCount, earned, pending, paid };
  };

  const stats = getStats();

  const handleApprove = async (entryId: string) => {
    try {
      await fetch(`/api/work-entries/${entryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      fetchWorkEntries();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePay = async (entryId: string) => {
    try {
      await fetch(`/api/work-entries/${entryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay' }),
      });
      fetchWorkEntries();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Delete this work entry?')) {
      try {
        await fetch(`/api/work-entries/${entryId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete' }),
        });
        fetchWorkEntries();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title={member.name} showBack onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mt-2">
                {member.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">🎬 Shoots</p>
              <p className="text-xl font-bold text-gray-900">{stats.shootCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">✂️ Edits</p>
              <p className="text-xl font-bold text-gray-900">{stats.editCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">📤 Posts</p>
              <p className="text-xl font-bold text-gray-900">{stats.postCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">📝 Scripts</p>
              <p className="text-xl font-bold text-gray-900">{stats.scriptCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-xs text-gray-500">Earned</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(stats.earned)}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(stats.pending)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(stats.paid)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Log</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No work entries</td>
                  </tr>
                ) : workEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {WORK_TYPES[entry.type].label}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(entry.total)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.paymentStatus === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      {entry.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                      {entry.status === 'APPROVED' && entry.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => handlePay(entry.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}