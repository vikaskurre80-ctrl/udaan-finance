import React, { useMemo } from 'react';
import { useFinanceStore } from '@/store/finance';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0071E3', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA'];

export default function DashboardPage() {
  const videos = useFinanceStore((state) => state.videos);
  const expenses = useFinanceStore((state) => state.expenses);

  const stats = useMemo(() => {
    const videosCount = videos.length;
    const totalRevenue = videosCount * 500;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalRevenue - totalExpenses;
    const companyFund = videosCount * 100;
    return {
      totalRevenue,
      totalExpenses,
      profit,
      companyFund,
      videosCount,
      expenseCount: expenses.length,
    };
  }, [videos, expenses]);

  const chartData = useMemo(() => {
    const monthMap = new Map();
    videos.forEach(v => {
      const d = new Date(v.date);
      const key = d.toLocaleString('default', { month: 'short' });
      if (!monthMap.has(key)) monthMap.set(key, { month: key, revenue: 0, expenses: 0 });
      monthMap.get(key).revenue += 500;
    });
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = d.toLocaleString('default', { month: 'short' });
      if (!monthMap.has(key)) monthMap.set(key, { month: key, revenue: 0, expenses: 0 });
      monthMap.get(key).expenses += e.amount || 0;
    });
    return Array.from(monthMap.values());
  }, [videos, expenses]);

  const expenseData = useMemo(() => {
    const catMap = new Map();
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      catMap.set(cat, (catMap.get(cat) || 0) + e.amount);
    });
    return Array.from(catMap.entries()).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toUpperCase(),
      value,
    }));
  }, [expenses]);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Dashboard</h1>
            <p className="text-xs text-[#6E6E73] mt-0.5">Welcome back • UdaanWorks Finance</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6E6E73]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#0071E3]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#0071E3]" />
              </div>
              <span className="flex items-center text-xs font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </span>
            </div>
            <p className="text-sm text-[#6E6E73] font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-[#6E6E73] mt-2">{stats.videosCount} videos logged</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#FF9500]/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#FF9500]" />
              </div>
              <span className="flex items-center text-xs font-semibold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-1 rounded-full">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                {stats.expenseCount} entries
              </span>
            </div>
            <p className="text-sm text-[#6E6E73] font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{formatCurrency(stats.totalExpenses)}</p>
            <p className="text-xs text-[#6E6E73] mt-2">Across {stats.expenseCount} transactions</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#34C759]/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#34C759]" />
              </div>
              <span className="flex items-center text-xs font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                15%
              </span>
            </div>
            <p className="text-sm text-[#6E6E73] font-medium mb-1">Net Profit</p>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{formatCurrency(stats.profit)}</p>
            <p className="text-xs text-[#6E6E73] mt-2">
              {stats.totalRevenue > 0 ? `${((stats.profit / stats.totalRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#AF52DE]/10 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-[#AF52DE]" />
              </div>
            </div>
            <p className="text-sm text-[#6E6E73] font-medium mb-1">Company Fund</p>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{formatCurrency(stats.companyFund)}</p>
            <p className="text-xs text-[#6E6E73] mt-2">Founder's share</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Revenue & Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" stroke="#A1A1A6" fontSize={12} />
                <YAxis stroke="#A1A1A6" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0071E3" strokeWidth={2.5} dot={{ fill: '#0071E3', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#FF3B30" strokeWidth={2.5} dot={{ fill: '#FF3B30', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Expenses Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseData.map((_e, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Chart */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Monthly Profit Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" stroke="#A1A1A6" fontSize={12} />
              <YAxis stroke="#A1A1A6" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="profit" fill="#34C759" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
