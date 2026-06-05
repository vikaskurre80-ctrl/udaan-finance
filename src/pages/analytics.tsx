import React, { useEffect, useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { format } from 'date-fns';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  PiggyBank,
} from 'lucide-react';
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
import { formatCurrency } from '@/utils/calculations';

interface MonthlyChartEntry {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const COLORS = ['#0071E3', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA'];

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyChartEntry[]>([]);
  const [expenseData, setExpenseData] = useState<{ name: string; value: number }[]>([]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    companyFund: 0,
    totalVideos: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [videosRes, expensesRes] = await Promise.all([
        fetch('/api/videos/list'),
        fetch('/api/expenses/list'),
      ]);

      const videos = videosRes.ok ? await videosRes.json() : [];
      const expenses = expensesRes.ok ? await expensesRes.json() : [];

      const totalRevenue = videos.reduce((acc: number, v: any) => acc + (v.totalRevenue || 500), 0);
      const totalExpenses = expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
      const companyFund = videos.reduce((acc: number, v: any) => acc + (v.companyFund || 100), 0);

      const now = new Date();
      const todayRevenue = videos
        .filter((v: any) => new Date(v.date || v.createdAt).toDateString() === now.toDateString())
        .reduce((acc: number, v: any) => acc + (v.totalRevenue || 500), 0);

      const monthlyRevenue = videos
        .filter((v: any) => {
          const d = new Date(v.date || v.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((acc: number, v: any) => acc + (v.totalRevenue || 500), 0);

      setStats({
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        companyFund,
        totalVideos: videos.length,
        todayRevenue,
        monthlyRevenue,
      });

      const monthMap: Record<string, { revenue: number; expenses: number }> = {};
      videos.forEach((v: any) => {
        const d = new Date(v.date || v.createdAt);
        const key = format(d, 'MMM yyyy');
        if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 };
        monthMap[key].revenue += v.totalRevenue || 500;
      });
      expenses.forEach((e: any) => {
        const d = new Date(e.date || e.createdAt);
        const key = format(d, 'MMM yyyy');
        if (!monthMap[key]) monthMap[key] = { revenue: 0, expenses: 0 };
        monthMap[key].expenses += e.amount || 0;
      });

      const sortedKeys = Object.keys(monthMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      const chartData: MonthlyChartEntry[] = sortedKeys.map(key => {
        const m = monthMap[key];
        return {
          month: key,
          revenue: m.revenue,
          expenses: m.expenses,
          profit: m.revenue - m.expenses,
        };
      });
      setMonthlyData(chartData);

      const catMap: Record<string, number> = {};
      expenses.forEach((e: any) => {
        const cat = e.category || 'OTHER';
        catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
      });
      setExpenseData(
        Object.entries(catMap).map(([name, value]) => ({
          name: name.replace(/_/g, ' ').toUpperCase(),
          value,
        }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const profitData = useMemo(
    () => monthlyData.map(m => ({ month: m.month, profit: m.revenue - m.expenses })),
    [monthlyData]
  );

  return (
    <Layout
      sidebar={<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      header={<Header title="Analytics" showMenu onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-apple-text tracking-tight">Analytics & Reports</h1>
          <p className="text-apple-text-secondary mt-1">Financial overview and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#0071E3]/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#0071E3]" />
              </div>
            </div>
            <p className="text-sm text-apple-text-secondary font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-apple-text tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-apple-text-secondary mt-2">{stats.totalVideos} videos</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#FF9500]/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#FF9500]" />
              </div>
            </div>
            <p className="text-sm text-apple-text-secondary font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-apple-text tracking-tight">{formatCurrency(stats.totalExpenses)}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#34C759]/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#34C759]" />
              </div>
            </div>
            <p className="text-sm text-apple-text-secondary font-medium mb-1">Net Profit</p>
            <p className="text-3xl font-bold text-apple-text tracking-tight">{formatCurrency(stats.netProfit)}</p>
            <p className="text-xs text-apple-text-secondary mt-2">
              {stats.totalRevenue > 0 ? `${((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}%` : '0%'} margin
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#AF52DE]/10 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-[#AF52DE]" />
              </div>
            </div>
            <p className="text-sm text-apple-text-secondary font-medium mb-1">Company Fund</p>
            <p className="text-3xl font-bold text-apple-text tracking-tight">{formatCurrency(stats.companyFund)}</p>
            <p className="text-xs text-apple-text-secondary mt-2">
              Today {formatCurrency(stats.todayRevenue)} • Month {formatCurrency(stats.monthlyRevenue)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-bold text-apple-text mb-6">Revenue & Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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

          <div className="card p-6">
            <h2 className="text-lg font-bold text-apple-text mb-6">Expenses Breakdown</h2>
            {expenseData.length > 0 ? (
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
            ) : (
              <p className="text-center text-apple-text-secondary py-20">No expense data</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-apple-text mb-6">Monthly Profit Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitData}>
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
      </div>
    </Layout>
  );
}
