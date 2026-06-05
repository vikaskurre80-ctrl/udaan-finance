import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface WorkSubmission {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paidStatus?: 'PAID' | 'PENDING';
  submittedAt: Date;
}

export default function WorkApprovalsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/work-entries/list');
        if (response.ok) {
          const data = await response.json();
          // Map to WorkSubmission format
          const formattedSubmissions = data.map((entry: any) => ({
            id: entry.id,
            memberId: entry.teamMemberId,
            memberName: entry.teamMember?.name || 'Unknown',
            title: entry.title,
            description: entry.description,
            amount: entry.totalAmount,
            status: entry.status.toLowerCase(),
            paidStatus: entry.approval?.paidStatus || 'PENDING',
            submittedAt: new Date(entry.createdAt),
          }));
          setSubmissions(formattedSubmissions);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchSubmissions();
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) return null;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-gray-500 text-lg">Loading submissions...</p>
        </div>
      </Layout>
    );
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/approvals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workEntryId: id,
          approverId: user.id,
          approverEmail: user.email,
          approverName: user.name,
          action: 'approve',
        }),
      });

      if (response.ok) {
        setSubmissions(
          submissions.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))
        );
      }
    } catch (error) {
      console.error('Error approving work:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch('/api/approvals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workEntryId: id,
          approverId: user.id,
          approverEmail: user.email,
          approverName: user.name,
          action: 'reject',
        }),
      });

      if (response.ok) {
        setSubmissions(
          submissions.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
        );
      }
    } catch (error) {
      console.error('Error rejecting work:', error);
    }
  };

  const handleTogglePayment = async (id: string, currentStatus: 'PAID' | 'PENDING' | undefined) => {
    const newStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      const response = await fetch('/api/admin/mark-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workEntryId: id,
          paidStatus: newStatus,
        }),
      });

      if (response.ok) {
        setSubmissions(
          submissions.map((s) => (s.id === id ? { ...s, paidStatus: newStatus } : s))
        );
      }
    } catch (error) {
      console.error('Error toggling payment status:', error);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">📋 Work Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve team submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-700">{approvedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-700">{rejectedCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500"
          >
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{submission.title}</h3>
                  <p className="text-sm text-gray-600">By: {submission.memberName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    submission.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : submission.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {submission.status === 'approved'
                    ? '✓ Approved'
                    : submission.status === 'pending'
                    ? '⏳ Pending Review'
                    : '✗ Rejected'}
                </span>
              </div>
              <p className="text-gray-700">{submission.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>

            {/* Amount and Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 flex-wrap gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{submission.amount.toLocaleString('en-IN')}</p>
                {submission.status === 'approved' && (
                  <button
                    onClick={() => handleTogglePayment(submission.id, submission.paidStatus)}
                    className={`mt-2 px-3 py-1 text-xs font-medium rounded cursor-pointer transition ${
                      submission.paidStatus === 'PAID'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {submission.paidStatus === 'PAID' ? '✓ Paid' : '⏳ Mark as Paid'}
                  </button>
                )}
              </div>

              {submission.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(submission.id)}
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(submission.id)}
                  >
                    ✗ Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No submissions to review</p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <Button variant="secondary" onClick={() => router.push('/admin/dashboard')}>
          ← Back to Admin Dashboard
        </Button>
      </div>
    </Layout>
  );
}
