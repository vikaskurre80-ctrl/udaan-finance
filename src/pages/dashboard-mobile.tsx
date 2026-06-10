import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Calendar, DollarSign, TrendingUp, PieChart, LogOut, Video, Plus } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { formatCurrency } from '@/utils/calculations';

interface WorkEntry {
  id: string;
  date: Date;
  type: 'shoot' | 'edit' | 'post' | 'script';
  projectName: string;
  quantity: number;
  amount: number;
  status: 'PENDING' | 'APPROVED';
  paymentStatus: 'PENDING' | 'PAID';
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function MobileDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'shoot', quantity: '1' });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i);

  useEffect(() => {
    if (!user) return;
    fetchWorkEntries();
  }, [user]);

  const fetchWorkEntries = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/work-entries/list');
      if (res.ok) {
        const data = await res.json();
        setWorkEntries(data.map((w: any) => ({
          id: w.id,
          date: new Date(w.date),
          type: w.role?.toLowerCase().includes('edit') ? 'edit' :
                w.role?.toLowerCase().includes('post') ? 'post' :
                w.role?.toLowerCase().includes('script') ? 'script' : 'shoot',
          projectName: w.title,
          quantity: w.quantity || 1,
          amount: w.totalAmount,
          status: w.approval?.status || 'PENDING',
          paymentStatus: w.approval?.paidStatus || 'PENDING',
        })).filter((e: WorkEntry) => 
          e.date.getMonth() === selectedMonth && e.date.getFullYear() === selectedYear
        ));
      }
    } catch (e) { console.error(e); }
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-apple-text-secondary">Loading...</p>
        </div>
      </Layout>
    );
  }

  const stats = useMemo(() => {
    const earned = workEntries.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
    const approved = earned;
    const paid = workEntries.filter(e => e.paymentStatus === 'PAID').reduce((sum, e) => sum + e.amount, 0);
    const pending = workEntries.filter(e => e.status === 'APPROVED' && e.paymentStatus === 'PENDING').reduce((sum, e) => sum + e.amount, 0);
    
    const shootCount = workEntries.filter(e => e.type === 'shoot').reduce((sum, e) => sum + e.quantity, 0);
    const editCount = workEntries.filter(e => e.type === 'edit').reduce((sum, e) => sum + e.quantity, 0);
    const postCount = workEntries.filter(e => e.type === 'post').reduce((sum, e) => sum + e.quantity, 0);
    const scriptCount = workEntries.filter(e => e.type === 'script').reduce((sum, e) => sum + e.quantity, 0);

    return { earned, approved, paid, pending, shootCount, editCount, postCount, scriptCount, workCount: workEntries.length };
  }, [workEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateMap = { shoot: 100, edit: 150, post: 80, script: 120 };
    const qty = parseInt(formData.quantity || '1', 10);
    
    try {
      await fetch('/api/work-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title,
          description: '',
          quantity: qty,
          ratePerTask: rateMap[formData.type as keyof typeof rateMap],
          role: formData.type,
          date: new Date().toISOString(),
        }),
      });
      setMessage('✅ Work submitted!');
      setShowForm(false);
      setFormData({ title: '', type: 'shoot', quantity: '1' });
      setTimeout(() => setMessage(''), 3000);
      fetchWorkEntries();
    } catch {
      setMessage('⚠️ Failed to submit');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-apple-bg pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-apple-text">Udaan Finance</h1>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-apple-text-secondary" />
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="text-sm bg-transparent">
              {MONTHS.map((m, i) => <option key={m} value={i}>{m.slice(0, 3)}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="text-sm bg-transparent">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {message && <Alert type={message.includes('✅') ? 'success' : 'warning'} message={message} />}

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Today Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(workEntries.reduce((s, e) => s + e.amount, 0))}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Monthly Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.earned)}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2">
              <PieChart className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xs text-gray-500">Expenses</p>
            <p className="text-lg font-bold text-gray-900">-</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Profit</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.earned)}</p>
          </div>
        </div>

        {/* Work Count */}
        <div className="bg-white rounded-2xl p-4 border border-black/5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">This Month Work</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg">🎬</p>
              <p className="text-xs font-bold">{stats.shootCount}</p>
            </div>
            <div>
              <p className="text-lg">✂️</p>
              <p className="text-xs font-bold">{stats.editCount}</p>
            </div>
            <div>
              <p className="text-lg">📤</p>
              <p className="text-xs font-bold">{stats.postCount}</p>
            </div>
            <div>
              <p className="text-lg">📝</p>
              <p className="text-xs font-bold">{stats.scriptCount}</p>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <Button variant="primary" size="lg" className="w-full py-4 text-base" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" /> Log Work
        </Button>

        {/* Work Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-4 border border-black/5">
            <h3 className="font-semibold mb-3">Submit Work</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Project Name" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full input-field" required />
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="w-full input-field">
                <option value="shoot">🎬 Shoot</option>
                <option value="edit">✂️ Edit</option>
                <option value="post">📤 Post</option>
                <option value="script">📝 Script</option>
              </select>
              <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full input-field" placeholder="Quantity" />
              <div className="flex gap-2">
                <Button type="submit" variant="primary" className="flex-1">Submit</Button>
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Work Log */}
        <div className="bg-white rounded-2xl p-4 border border-black/5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Work</h2>
          {workEntries.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No work logged</p>
          ) : (
            <div className="space-y-2">
              {workEntries.slice(0, 5).map(e => (
                <div key={e.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{e.projectName}</p>
                    <p className="text-xs text-gray-500">{MONTHS[e.date.getMonth()]} {e.date.getDate()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    e.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                    e.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {e.paymentStatus === 'PAID' ? 'Paid' : e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-black/5 z-50">
        <div className="grid grid-cols-4 h-16">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center ${activeTab === 'dashboard' ? 'text-apple-blue' : 'text-gray-500'}`}>
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => setActiveTab('team')} className={`flex flex-col items-center justify-center ${activeTab === 'team' ? 'text-apple-blue' : 'text-gray-500'}`}>
            <Video className="w-5 h-5" />
            <span className="text-xs">Team</span>
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center justify-center ${activeTab === 'reports' ? 'text-apple-blue' : 'text-gray-500'}`}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Reports</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center text-gray-500">
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}