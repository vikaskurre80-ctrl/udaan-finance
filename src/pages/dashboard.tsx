import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useFinanceStore } from '@/store/finance';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Search,
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';

interface TeamSalary {
  id: string;
  name: string;
  role: string;
  earned: number;
  paid: number;
  pending: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DashboardPage() {
  const router = useRouter();
  const videos = useFinanceStore((state) => state.videos);
  const expenses = useFinanceStore((state) => state.expenses);
  const teamMembers = useFinanceStore((state) => state.teamMembers);
  const fetchData = useFinanceStore((state) => state.fetchData);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [teamSalaries, setTeamSalaries] = useState<TeamSalary[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'shoot', paymentPerVideo: 100 });
  const [searchTerm, setSearchTerm] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    fetchData();
    fetchTeamSalaries();
  }, [fetchData, selectedMonth, selectedYear]);

  const fetchTeamSalaries = async () => {
    try {
      const res = await fetch('/api/admin/team-salaries');
      if (res.ok) {
        const data = await res.json();
        setTeamSalaries(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const d = new Date(v.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [videos, selectedMonth, selectedYear]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const getDateRange = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    return `${firstDay.getDate()} ${MONTHS[selectedMonth].slice(0, 3)} – ${lastDay.getDate()} ${MONTHS[selectedMonth].slice(0, 3)} ${selectedYear}`;
  };

  const stats = useMemo(() => {
    const videosCount = filteredVideos.length;
    const totalRevenue = videosCount * 500;
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = totalRevenue - totalExpenses;
    const companyFund = videosCount * 100;
    return {
      totalRevenue,
      totalExpenses,
      profit,
      companyFund,
      videosCount,
      expenseCount: filteredExpenses.length,
    };
  }, [filteredVideos, filteredExpenses]);

  const totalPendingSalary = teamSalaries.reduce((acc, s) => acc + s.pending, 0);

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        if (response.ok) {
          useFinanceStore.setState((state) => ({
            expenses: state.expenses.filter((e) => e.id !== id),
          }));
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          useFinanceStore.setState((state) => ({
            videos: state.videos.filter((v) => v.id !== id),
          }));
        }
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleApproveAllSalaries = async () => {
    if (confirm('Approve and mark all pending salaries as paid?')) {
      try {
        await fetch('/api/approvals/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'pay_all' }),
        });
        fetchTeamSalaries();
      } catch (error) {
        console.error('Error approving salaries:', error);
      }
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name) return;
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      if (response.ok) {
        const member = await response.json();
        useFinanceStore.setState((state) => ({
          teamMembers: [...state.teamMembers, member],
        }));
        setNewMember({ name: '', role: 'shoot', paymentPerVideo: 100 });
        setShowAddMember(false);
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Remove this team member?')) {
      try {
        await fetch(`/api/team/${id}`, { method: 'DELETE' });
        useFinanceStore.setState((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        }));
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };


  return (
    <div className="min-h-screen bg-apple-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-apple-bg rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-apple-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-apple-text tracking-tight">Dashboard</h1>
              <p className="text-xs text-apple-text-secondary mt-0.5">{getDateRange()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-apple-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-1.5 text-sm input-field w-64"
              />
            </div>
            <Calendar className="w-4 h-4 text-apple-text-secondary" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field text-sm py-1 px-3"
            >
              {MONTHS.map((month, i) => (
                <option key={month} value={i}>{month} {selectedYear}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field text-sm py-1 px-3"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12%
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.videosCount} videos logged</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-orange-600" />
              </div>
              <span className="flex items-center text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                {stats.expenseCount} entries
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
            <p className="text-xs text-gray-500 mt-2">Across {stats.expenseCount} transactions</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Net Profit</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.profit)}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.totalRevenue > 0 ? `${((stats.profit / stats.totalRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Company Fund</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.companyFund)}</p>
            <p className="text-xs text-gray-500 mt-2">Founder's share</p>
          </div>
        </div>

        {/* Salary Due Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Team Salary Tracker</h2>
                <p className="text-sm text-gray-500">Pending salaries for {MONTHS[selectedMonth]} {selectedYear}</p>
              </div>
              <button
                onClick={handleApproveAllSalaries}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg font-medium text-sm hover:bg-green-200 transition-colors"
              >
                Approve & Pay All
              </button>
            </div>
            <div className="space-y-3">
              {teamSalaries.length > 0 ? teamSalaries.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.role.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Earned: {formatCurrency(s.earned)}</p>
                    <p className="text-sm font-semibold text-orange-600">Pending: {formatCurrency(s.pending)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">No salary data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Summary</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-gray-500">Total Pending</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPendingSalary)}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-500">Total Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Entries</h2>
            <button
              onClick={() => router.push('/video/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No revenue entries for this month</td>
                  </tr>
                ) : filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(video.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{video.title}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">+{formatCurrency(video.totalRevenue || 500)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/video/edit/${video.id}`)}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expense Entries</h2>
            <button
              onClick={() => router.push('/expenses/new')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No expenses for this month</td>
                  </tr>
                ) : filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                        {expense.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">-{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/expenses/edit/${expense.id}`)}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          {showAddMember && (
            <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="input-field"
                />
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="input-field"
                >
                  <option value="shoot">Shooter</option>
                  <option value="edit">Editor</option>
                  <option value="smm">SMM</option>
                  <option value="ads">Ads</option>
                  <option value="client_manager">Client Manager</option>
                </select>
                <input
                  type="number"
                  placeholder="Payment per video"
                  value={newMember.paymentPerVideo}
                  onChange={(e) => setNewMember({ ...newMember, paymentPerVideo: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleAddMember} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Add
                </button>
                <button onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          )}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {teamMembers
               .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
               .map((member) => {
               const memberSalaries = teamSalaries.find(s => s.id === member.id);
               const earned = memberSalaries?.earned || 0;
               const pending = memberSalaries?.pending || 0;
               const paid = memberSalaries?.paid || 0;
               
               return (
               <div key={member.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => router.push(`/admin/team/${member.id}`)}>
                 <div>
                   <div className="flex items-start justify-between mb-3">
                     <div>
                       <p className="font-semibold text-gray-900">{member.name}</p>
                       <span className={`inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs mt-1`}>
                         {member.role.replace('_', ' ')}
                       </span>
                     </div>
<div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/admin/team/${member.id}`); }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id); }}
                          className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                   </div>
                   <div className="space-y-2 pt-3 border-t border-gray-200">
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-500">Earned:</span>
                       <span className="font-semibold text-green-600">{formatCurrency(earned)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-500">Pending:</span>
                       <span className="font-semibold text-orange-600">{formatCurrency(pending)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm text-gray-500">Paid:</span>
                       <span className="font-semibold text-blue-600">{formatCurrency(paid)}</span>
                     </div>
                   </div>
                 </div>
               </div>
               );
             })}
           </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Summary - {MONTHS[selectedMonth]} {selectedYear}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm text-gray-500 mb-2">Net P&L</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.profit)}</p>
              <p className="text-xs text-gray-500 mt-1">Revenue - Expenses</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-orange-50 border border-orange-200">
              <p className="text-sm text-gray-500 mb-2">Pending Salaries</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalPendingSalary)}</p>
              <p className="text-xs text-gray-500 mt-1">{teamSalaries.filter(s => s.pending > 0).length} members pending</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-gray-500 mb-2">Total Videos</p>
              <p className="text-3xl font-bold text-blue-600">{stats.videosCount}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.videosCount * 500} revenue potential</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}