import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { useFinanceStore } from '@/store/finance';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Trash2, Wallet, Briefcase, Plus, CheckCircle, TrendingUp, Users, Bell } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#FBBF24'];

interface TeamSalary {
  id: string;
  name: string;
  role: string;
  earned: number;
  paid: number;
  pending: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const { videos, expenses, fetchData } = useFinanceStore();

  const [teamSalaries, setTeamSalaries] = useState<TeamSalary[]>([]);
  const [loadingSalaries, setLoadingSalaries] = useState(true);
  const notificationCount = 3;

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    fetchData();
    fetchTeamSalaries();
  }, []);

  const fetchTeamSalaries = async () => {
    try {
      const res = await fetch('/api/admin/team-salaries');
      if (res.ok) {
        const data = await res.json();
        setTeamSalaries(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSalaries(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  if (!user || !isAdmin) return null;

  const totalCompanyFund = videos.reduce((acc, v) => acc + (v.companyFund || 100), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingCompanyFund = totalCompanyFund - totalExpenses;
  const totalRevenue = videos.length * 500;
  const totalSalaryPending = teamSalaries.reduce((acc, s) => acc + s.pending, 0);
  const totalSalaryPaid = teamSalaries.reduce((acc, s) => acc + s.paid, 0);

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const expenseChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category.replace(/_/g, ' ').toUpperCase(),
    value: amount,
  }));

  const StatCard = ({ icon: Icon, label, value, subtext, trend, color }: any) => {
    const colorClasses: any = {
      blue: 'from-blue-50/80 to-transparent border-blue-200/30',
      green: 'from-emerald-50/80 to-transparent border-emerald-200/30',
      red: 'from-red-50/80 to-transparent border-red-200/30',
      purple: 'from-purple-50/80 to-transparent border-purple-200/30',
      orange: 'from-orange-50/80 to-transparent border-orange-200/30',
      indigo: 'from-indigo-50/80 to-transparent border-indigo-200/30',
    };

    const iconColors: any = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-emerald-100 text-emerald-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };

    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color] || colorClasses.blue}`} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColors[color] || iconColors.blue}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {subtext && <p className="text-sm text-gray-500 mt-2">{subtext}</p>}
          {trend && (
            <div className={`inline-flex items-center mt-3 text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  UW
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">UdaanWorks Finance Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 pl-10 rounded-xl border border-gray-200/60 bg-white/80 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 backdrop-blur-sm transition-all"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notificationCount}
                  </span>
                )}
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            <StatCard icon={Wallet} label="Company Fund" value={formatCurrency(remainingCompanyFund)} subtext={`${formatCurrency(totalCompanyFund)} total`} color="blue" />
            <StatCard icon={TrendingUp} label="Total Revenue" value={formatCurrency(totalRevenue)} subtext={`${videos.length} videos`} color="green" trend={12} />
            <StatCard icon={Wallet} label="Total Expenses" value={formatCurrency(totalExpenses)} subtext={`${expenses.length} entries`} color="red" />
            <StatCard icon={Users} label="Pending Salaries" value={formatCurrency(totalSalaryPending)} subtext="Unpaid" color="orange" />
            <StatCard icon={CheckCircle} label="Paid Salaries" value={formatCurrency(totalSalaryPaid)} subtext="All time" color="indigo" />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Salary Tracker */}
            <div className="lg:col-span-2 rounded-3xl border border-gray-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Team Salary Tracker</h2>
                  <p className="text-sm text-gray-500 mt-1">Track earnings and payments</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => router.push('/admin/work-approvals')}>
                  Approve Work & Pay
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/60">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Member</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Earned</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {loadingSalaries ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">Loading tracking data...</td>
                      </tr>
                    ) : teamSalaries.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.role.replace('_', ' ')}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatCurrency(s.earned)}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(s.paid)}</td>
                        <td className="px-6 py-4 text-right font-semibold text-orange-600">{formatCurrency(s.pending)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-gray-200/60 bg-gradient-to-br from-purple-50/80 to-white p-6 shadow-sm backdrop-blur-xl">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    className="justify-start"
                    onClick={() => router.push('/admin/work-approvals')}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Pending Work
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    className="justify-start"
                    onClick={() => router.push('/video/new')}
                  >
                    <Plus className="w-4 h-4" /> Add Revenue
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    className="justify-start"
                    onClick={() => router.push('/expenses/new')}
                  >
                    <Wallet className="w-4 h-4" /> Add Expense
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    className="justify-start"
                    onClick={() => router.push('/admin/reports')}
                  >
                    <Briefcase className="w-4 h-4" /> Monthly Report
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Expenses Overview</h2>
                {expenseChartData.length > 0 ? (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '16px',
                            fontSize: '13px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No expenses logged</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Revenue */}
          <div className="rounded-3xl border border-gray-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Revenue</h2>
                <p className="text-sm text-gray-500 mt-1">Latest video entries and revenue</p>
              </div>
              <Button variant="secondary" onClick={() => router.push('/video/new')}>
                + Add Video
              </Button>
            </div>
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.slice(-5).reverse().map((video) => (
                  <div
                    key={video.id}
                    className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50/80 border border-gray-200/40 hover:bg-white hover:shadow-md hover:border-gray-300/60 transition-all duration-300"
                  >
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{video.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(video.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • +₹100 Company Fund
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-semibold border border-emerald-200/60">
                        +₹500
                      </span>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50/80 rounded-2xl border-2 border-dashed border-gray-200/60">
                <p className="text-gray-400 text-lg">No revenue videos logged yet</p>
                <Button variant="primary" className="mt-4" onClick={() => router.push('/video/new')}>
                  Add Your First Video
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
