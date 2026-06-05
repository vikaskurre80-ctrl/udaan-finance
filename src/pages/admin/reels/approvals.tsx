import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReelBatchRow {
  id: string;
  clientId: string;
  clientName: string;
  shopName: string;
  description: string;
  status: string;
  shooterStatus: string;
  editorStatus: string;
  smmStatus: string;
  adsStatus: string;
  cmStatus: string;
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  if (status === 'COMPLETED') return <span className="badge badge-success">Done</span>;
  if (status === 'PENDING') return <span className="badge badge-warning">Pending</span>;
  if (status === 'READY_FOR_APPROVAL') return <span className="badge badge-purple">Ready</span>;
  return <span className="badge badge-info">In Progress</span>;
};

export default function ReelApprovalsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [tasks, setTasks] = useState<ReelBatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) router.push('/login');
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetch('/api/reels')
      .then(r => r.json())
      .then((data: any[]) => {
        const ready = (Array.isArray(data) ? data : []).filter((r: any) => r.status === 'READY_FOR_APPROVAL');
        setTasks(ready.map((r: any) => ({
          ...r,
          clientName: r.client?.name || 'Unknown',
          shopName: r.client?.shopName || 'Unknown',
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  const handleApprove = async (reelId: string) => {
    try {
      const res = await fetch(`/api/reels/${reelId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) setTasks(prev => prev.filter(t => t.id !== reelId));
    } catch (e) { console.error(e); }
  };

  const handleReject = async (reelId: string) => {
    if (!confirm('Reject this reel batch?')) return;
    try {
      const res = await fetch(`/api/reels/${reelId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (res.ok) setTasks(prev => prev.filter(t => t.id !== reelId));
    } catch (e) { console.error(e); }
  };

  if (!user || !isAdmin) return null;

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-apple-text tracking-tight">🎬 Reel Approvals</h1>
            <p className="text-apple-text-secondary mt-1">Review reel work before final approval</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/admin/dashboard')}>← Back</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle className="w-16 h-16 text-apple-green mx-auto mb-4" />
            <h2 className="text-xl font-bold text-apple-text mb-2">All caught up!</h2>
            <p className="text-apple-text-secondary">No reels waiting for approval.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {tasks.map(task => (
              <div key={task.id} className="card p-6 md:p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-apple-text">{task.description}</h3>
                        <p className="text-apple-text-secondary mt-1">Client: {task.shopName || task.clientName}</p>
                      </div>
                      <span className="badge badge-purple">⚡ Ready</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                      {[
                        { label: 'Shooter', status: task.shooterStatus },
                        { label: 'Editor', status: task.editorStatus },
                        { label: 'SMM', status: task.smmStatus },
                        { label: 'Ads', status: task.adsStatus },
                        { label: 'Client Mgr', status: task.cmStatus },
                      ].map(({ label, status }) => (
                        <div key={label} className="bg-apple-bg rounded-apple p-3 text-center">
                          <p className="text-xs text-apple-text-tertiary font-bold uppercase mb-1">{label}</p>
                          {getStatusBadge(status)}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-apple-text-tertiary">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                    <Button variant="primary" className="flex-1 lg:flex-none gap-2" onClick={() => handleApprove(task.id)}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button variant="danger" className="flex-1 lg:flex-none gap-2" onClick={() => handleReject(task.id)}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
