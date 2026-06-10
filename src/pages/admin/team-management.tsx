import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { useFinanceStore } from '@/store/finance';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Plus } from 'lucide-react';
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

export default function TeamManagementPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const { teamMembers } = useFinanceStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [workEntries, setWorkEntries] = useState<Record<string, WorkEntry[]>>({});
  const [newWork, setNewWork] = useState({
    memberId: teamMembers[0]?.id || '',
    type: 'shoot',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    // Initialize work entries from videos
    const entries: Record<string, WorkEntry[]> = {};
    teamMembers.forEach(m => {
      entries[m.id] = [];
    });
    setWorkEntries(entries);
  }, [teamMembers]);

  if (!user || !isAdmin) return null;

  const getMemberStats = (member: typeof teamMembers[0]) => {
    const entries = workEntries[member.id] || [];
    const shootCount = entries.filter(e => e.type === 'shoot').reduce((sum, e) => sum + e.quantity, 0);
    const editCount = entries.filter(e => e.type === 'edit').reduce((sum, e) => sum + e.quantity, 0);
    const postCount = entries.filter(e => e.type === 'post').reduce((sum, e) => sum + e.quantity, 0);
    const scriptCount = entries.filter(e => e.type === 'script').reduce((sum, e) => sum + e.quantity, 0);
    
    const earned = entries.reduce((sum, e) => sum + (e.status === 'APPROVED' ? e.total : 0), 0);
    const pending = entries.reduce((sum, e) => sum + (e.status === 'PENDING' ? e.total : 0), 0);
    const paid = entries.reduce((sum, e) => sum + (e.paymentStatus === 'PAID' ? e.total : 0), 0);

    return { shootCount, editCount, postCount, scriptCount, earned, pending, paid };
  };

  const handleAddWork = () => {
    if (!newWork.memberId) return;
    
    const entry: WorkEntry = {
      id: Date.now().toString(),
      date: new Date(newWork.date),
      type: newWork.type as any,
      quantity: newWork.quantity,
      rate: WORK_TYPES[newWork.type as keyof typeof WORK_TYPES].rate,
      total: WORK_TYPES[newWork.type as keyof typeof WORK_TYPES].rate * newWork.quantity,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    };

    setWorkEntries(prev => ({
      ...prev,
      [newWork.memberId]: [...(prev[newWork.memberId] || []), entry]
    }));
    
    setNewWork({ ...newWork, memberId: teamMembers[0]?.id || '' });
    setShowAddWork(false);
  };

  const handleApprove = (memberId: string, entryId: string) => {
    setWorkEntries(prev => ({
      ...prev,
      [memberId]: prev[memberId].map(e => 
        e.id === entryId ? { ...e, status: 'APPROVED' } : e
      )
    }));
  };

  const handlePay = (memberId: string, entryId: string) => {
    setWorkEntries(prev => ({
      ...prev,
      [memberId]: prev[memberId].map(e => 
        e.id === entryId ? { ...e, paymentStatus: 'PAID' } : e
      )
    }));
  };

  const roleColors: Record<string, string> = {
    shoot: 'badge-info',
    edit: 'badge-purple',
    smm: 'badge-error',
    ads: 'badge-warning',
    client_manager: 'badge-success',
    founder: 'badge-info',
  };

  const selectedMemberData = teamMembers.find(m => m.id === selectedMember);
  const selectedStats = selectedMember ? getMemberStats(selectedMemberData!) : null;

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Team Management" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-apple-text">Team Members</h2>
          <button
            onClick={() => setShowAddWork(true)}
            className="flex items-center gap-2 px-4 py-2 bg-apple-blue text-white rounded-lg font-medium text-sm hover:bg-apple-blue-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Work
          </button>
        </div>

        {showAddWork && (
          <div className="mb-6 p-4 rounded-xl bg-apple-bg border border-apple-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newWork.memberId}
                onChange={(e) => setNewWork({ ...newWork, memberId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Member</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <select
                value={newWork.type}
                onChange={(e) => setNewWork({ ...newWork, type: e.target.value as any })}
                className="input-field"
              >
                {Object.entries(WORK_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label} (₹{val.rate})</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={newWork.quantity}
                onChange={(e) => setNewWork({ ...newWork, quantity: Number(e.target.value) })}
                className="input-field"
              />
              <input
                type="date"
                value={newWork.date}
                onChange={(e) => setNewWork({ ...newWork, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAddWork} className="px-4 py-2 bg-apple-green text-white rounded-lg text-sm font-medium">
                Add Work
              </button>
              <button onClick={() => setShowAddWork(false)} className="px-4 py-2 bg-apple-text-secondary text-white rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teamMembers.map((member) => {
            const stats = getMemberStats(member);
            return (
              <div 
                key={member.id} 
                className="p-5 rounded-xl bg-apple-surface border border-apple-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMember(member.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg text-apple-text">{member.name}</p>
                    <span className={`badge ${roleColors[member.role] || 'badge-info'} mt-1`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-apple-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-apple-text-secondary">🎬 Shoots: {stats.shootCount}</span>
                    <span className="text-apple-text-secondary">✂️ Edits: {stats.editCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-apple-text-secondary">📤 Posts: {stats.postCount}</span>
                    <span className="text-apple-text-secondary">📝 Scripts: {stats.scriptCount}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-apple-text-secondary">Earned:</span>
                    <span className="font-semibold text-apple-green">{formatCurrency(stats.earned)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-apple-text-secondary">Pending:</span>
                    <span className="font-semibold text-apple-orange">{formatCurrency(stats.pending)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-apple-text-secondary">Paid:</span>
                    <span className="font-semibold text-apple-blue">{formatCurrency(stats.paid)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedMember && selectedStats && (
          <div className="bg-white rounded-2xl p-6 border border-apple-border shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-apple-text">
                {selectedMemberData?.name}'s Work Log
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="px-3 py-1 text-sm text-apple-text-secondary hover:text-apple-blue"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-apple-border">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-apple-text-secondary uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-apple-text-secondary uppercase">Type</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-apple-text-secondary uppercase">Amount</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-apple-text-secondary uppercase">Status</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-apple-text-secondary uppercase">Payment</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-apple-text-secondary uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-border">
                  {workEntries[selectedMember]?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-apple-text-secondary">No work entries</td>
                    </tr>
                  ) : (
                    workEntries[selectedMember]?.map((entry) => (
                      <tr key={entry.id} className="hover:bg-apple-bg transition-colors">
                        <td className="px-4 py-2 text-sm text-apple-text">
                          {new Date(entry.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {WORK_TYPES[entry.type].label}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-apple-text">
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
                              onClick={() => handleApprove(selectedMember, entry.id)}
                              className="px-3 py-1 bg-apple-green text-white rounded text-xs hover:bg-apple-green-hover"
                            >
                              Approve
                            </button>
                          )}
                          {entry.status === 'APPROVED' && entry.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handlePay(selectedMember, entry.id)}
                              className="px-3 py-1 bg-apple-blue text-white rounded text-xs hover:bg-apple-blue-hover"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}