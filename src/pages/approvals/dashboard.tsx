import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';

interface WorkEntry {
  id: string;
  title: string;
  description: string;
  quantity: number;
  ratePerTask: number;
  totalAmount: number;
  status: string;
  date: string;
  teamMember: {
    name: string;
  };
}

export default function ApprovalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkEntries();
  }, []);

  const fetchWorkEntries = async () => {
    try {
      const res = await fetch('/api/work-entries/list');
      if (res.ok) {
        const data = await res.json();
        setWorkEntries(data);
      }
    } catch (error) {
      console.error('Error fetching work entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (workEntryId: string) => {
    setProcessingId(workEntryId);
    try {
      const res = await fetch('/api/approvals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workEntryId,
          approverId: '1',
          action: 'approve',
        }),
      });

      if (res.ok) {
        fetchWorkEntries();
      }
    } catch (error) {
      console.error('Error approving work:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (workEntryId: string) => {
    setProcessingId(workEntryId);
    try {
      const res = await fetch('/api/approvals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workEntryId,
          approverId: '1',
          action: 'reject',
        }),
      });

      if (res.ok) {
        fetchWorkEntries();
      }
    } catch (error) {
      console.error('Error rejecting work:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingEntries = workEntries.filter((e) => e.status === 'PENDING');
  const approvedEntries = workEntries.filter((e) => e.status === 'APPROVED');

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
          title="Work Approvals"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <p className="text-apple-600 text-sm mb-1">Pending Approvals</p>
            <h2 className="text-3xl font-bold text-orange-600">{pendingEntries.length}</h2>
          </div>
          <div className="card p-6">
            <p className="text-apple-600 text-sm mb-1">Approved</p>
            <h2 className="text-3xl font-bold text-green-600">{approvedEntries.length}</h2>
          </div>
          <div className="card p-6">
            <p className="text-apple-600 text-sm mb-1">Pending Payment</p>
            <h2 className="text-3xl font-bold text-brand-primary">
              {formatCurrency(pendingEntries.reduce((sum, e) => sum + e.totalAmount, 0))}
            </h2>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-apple-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Approvals
          </h3>

          {isLoading ? (
            <p className="text-apple-600">Loading...</p>
          ) : pendingEntries.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-apple-600">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEntries.map((entry) => (
                <div key={entry.id} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-apple-900">{entry.title}</h4>
                      <p className="text-sm text-apple-600">{entry.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span><strong>Employee:</strong> {entry.teamMember.name}</span>
                        <span><strong>Qty:</strong> {entry.quantity}</span>
                        <span><strong>Rate:</strong> ₹{entry.ratePerTask}</span>
                        <span className="font-semibold text-green-600"><strong>Total:</strong> {formatCurrency(entry.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(entry.id)}
                        isLoading={processingId === entry.id}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReject(entry.id)}
                        isLoading={processingId === entry.id}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {approvedEntries.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-apple-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Approved
            </h3>

            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-apple-200 bg-apple-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-apple-900">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-apple-900">Work</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-apple-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-apple-100 hover:bg-apple-50">
                      <td className="px-6 py-4 text-sm text-apple-900">{entry.teamMember.name}</td>
                      <td className="px-6 py-4 text-sm text-apple-900">{entry.title}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(entry.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
