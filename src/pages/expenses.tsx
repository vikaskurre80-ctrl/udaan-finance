import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/Button';
import { useFinanceStore } from '@/store/finance';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import { getExpenseCategoryLabel, formatCurrency, formatDate } from '@/utils/calculations';
import { useRouter } from 'next/router';

export default function ExpensesPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const expenses = useFinanceStore((state) => state.expenses);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        });
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
          title="Expenses"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6 stat-card-gradient-red">
            <p className="text-apple-red text-sm font-semibold mb-1">Total Expenses</p>
            <h2 className="text-3xl font-bold text-apple-text">
              {formatCurrency(totalExpenses)}
            </h2>
          </div>
          <div className="card p-6 stat-card-gradient-blue">
            <p className="text-apple-blue text-sm font-semibold mb-1">Total Entries</p>
            <h2 className="text-3xl font-bold text-apple-text">{expenses.length}</h2>
          </div>
          <div className="card p-6 stat-card-gradient-purple">
            <p className="text-apple-purple text-sm font-semibold mb-1">Categories</p>
            <h2 className="text-3xl font-bold text-apple-text">
              {Object.keys(expensesByCategory).length}
            </h2>
          </div>
        </div>

        {/* Add Button */}
        <Button
          variant="primary"
          className="mb-6 gap-2"
          onClick={() => router.push('/expenses/new')}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>

        {/* Expenses Table */}
        <div className="card overflow-hidden border-apple-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-apple-border bg-apple-bg">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-apple-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-apple-text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-apple-text-secondary uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-apple-text-secondary uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-apple-text-secondary uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-apple-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-apple-text-tertiary">No expenses recorded yet</p>
                      <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={() => router.push('/expenses/new')}
                      >
                        Add your first expense
                      </Button>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-apple-bg transition-colors table-row"
                    >
                      <td className="px-6 py-4 text-sm text-apple-text font-medium">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="badge badge-info">
                          {getExpenseCategoryLabel(expense.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-apple-text-secondary">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-apple-text">
                        {formatCurrency(expense.amount || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-apple-text-secondary capitalize">
                        {(expense.paymentMethod || 'cash').replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 hover:bg-apple-red-light rounded-lg transition-colors text-apple-red"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
