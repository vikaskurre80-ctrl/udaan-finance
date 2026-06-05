import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { useFinanceStore } from '@/store/finance';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#007AFF', '#5AC8FA', '#34C759', '#FF9500', '#FF3B30', '#A2845E'];

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const { videos, expenses, teamMembers } = useFinanceStore();

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) return null;

  // Extract all available months from data for the dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    videos.forEach(v => months.add(format(new Date(v.date || new Date()), 'yyyy-MM')));
    expenses.forEach(e => months.add(format(new Date(e.date || new Date()), 'yyyy-MM')));
    months.add(format(new Date(), 'yyyy-MM')); // Always include current month
    return Array.from(months).sort().reverse(); // Newest first
  }, [videos, expenses]);

  // Filter data by selected month
  const filteredVideos = useMemo(() => {
    if (selectedMonth === 'all') return videos;
    return videos.filter(v => format(new Date(v.date || new Date()), 'yyyy-MM') === selectedMonth);
  }, [videos, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'all') return expenses;
    return expenses.filter(e => format(new Date(e.date || new Date()), 'yyyy-MM') === selectedMonth);
  }, [expenses, selectedMonth]);

  // Calculate data based on filters
  const totalRevenue = filteredVideos.length * 500;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;

  // Monthly breakdown (always show all months trend)
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { month: string; revenue: number; expenses: number }>();
    
    videos.forEach(v => {
      const d = v.date ? new Date(v.date) : new Date();
      const monthStr = format(d, 'MMM');
      const sortKey = format(d, 'yyyy-MM');
      const key = `${sortKey}|${monthStr}`;
      
      if (!monthMap.has(key)) {
        monthMap.set(key, { month: monthStr, revenue: 0, expenses: 0 });
      }
      monthMap.get(key)!.revenue += 500;
    });

    expenses.forEach(e => {
      const d = e.date ? new Date(e.date) : new Date();
      const monthStr = format(d, 'MMM');
      const sortKey = format(d, 'yyyy-MM');
      const key = `${sortKey}|${monthStr}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { month: monthStr, revenue: 0, expenses: 0 });
      }
      monthMap.get(key)!.expenses += e.amount || 0;
    });

    const sortedKeys = Array.from(monthMap.keys()).sort();
    return sortedKeys.map(key => monthMap.get(key)!);
  }, [videos, expenses]);

  // Team earnings breakdown for filtered month
  const teamEarningsData = teamMembers.map((member) => ({
    name: member.name,
    earnings: filteredVideos.length * member.paymentPerVideo,
  }));

  // Expense categories for filtered month
  const expensesByCategory = filteredExpenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const expenseChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category.replace(/_/g, ' ').toUpperCase(),
    value: amount,
  }));

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Udaan_Finance_Report_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📊 Financial Reports</h1>
          <p className="text-gray-600 mt-2">Monthly financial analysis</p>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Time</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{format(new Date(month + '-01'), 'MMMM yyyy')}</option>
            ))}
          </select>

          <Button variant="primary" size="md" onClick={handleDownloadPDF} isLoading={isGenerating}>
            <Download className="w-4 h-4 mr-2" /> {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Wrapping the content for PDF generation */}
      <div id="report-content" className="bg-gray-50 p-4 -mx-4 sm:mx-0 sm:p-0">
        
        {/* Report Header (Visible mainly in PDF or as context) */}
        <div className="hidden print:block mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Udaan Finance Report</h1>
          <p className="text-gray-600 text-lg">
            Period: {selectedMonth === 'all' ? 'All Time' : format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <p className="text-blue-600 text-sm font-medium">Revenue ({selectedMonth === 'all' ? 'Total' : 'Monthly'})</p>
            <p className="text-4xl font-bold text-blue-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-blue-700 text-sm mt-2">{filteredVideos.length} videos</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <p className="text-red-600 text-sm font-medium">Expenses ({selectedMonth === 'all' ? 'Total' : 'Monthly'})</p>
            <p className="text-4xl font-bold text-red-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
            <p className="text-red-700 text-sm mt-2">{filteredExpenses.length} entries</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <p className="text-green-600 text-sm font-medium">Net Profit ({selectedMonth === 'all' ? 'Total' : 'Monthly'})</p>
            <p className="text-4xl font-bold text-green-900">₹{profit.toLocaleString('en-IN')}</p>
            <p className="text-green-700 text-sm mt-2">
              Margin: {totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expenses by Category */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h2>
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">No expense data for this period</p>
            )}
          </div>

          {/* Team Earnings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team Earnings Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamEarningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="earnings" fill="#007AFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Trends Chart (Always shows all-time data to give context) */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₹${Number(value).toFixed(0)}`} />
              <Line type="monotone" dataKey="revenue" stroke="#34C759" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#FF3B30" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All-Time Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900">Month</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-900">Revenue</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-900">Expenses</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-900">Profit</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-900">Margin</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, idx) => {
                  const prof = month.revenue - month.expenses;
                  const margin = month.revenue > 0 ? (prof / month.revenue * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedMonth !== 'all' && month.month === format(new Date(selectedMonth + '-01'), 'MMM') ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 px-4 font-medium">{month.month}</td>
                      <td className="text-right py-3 px-4 text-green-700">₹{month.revenue.toFixed(0)}</td>
                      <td className="text-right py-3 px-4 text-red-700">₹{month.expenses.toFixed(0)}</td>
                      <td className="text-right py-3 px-4 font-bold text-gray-900">₹{prof.toFixed(0)}</td>
                      <td className="text-right py-3 px-4">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Back Button */}
      <Button variant="secondary" onClick={() => router.push('/admin/dashboard')} className="mt-4">
        ← Back to Dashboard
      </Button>
    </Layout>
  );
}
