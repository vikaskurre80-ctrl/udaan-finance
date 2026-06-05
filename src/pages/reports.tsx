import React from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useFinanceStore } from '@/store/finance';
import { formatCurrency } from '@/utils/calculations';
import { Download } from 'lucide-react';
import { Button } from '@/components/Button';

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const videos = useFinanceStore((state) => state.videos);
  const expenses = useFinanceStore((state) => state.expenses);
  const teamMembers = useFinanceStore((state) => state.teamMembers);

  const totalRevenue = videos.length * 500;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const teamEarnings = teamMembers.map((member) => ({
    name: member.name,
    role: member.role,
    perVideo: member.paymentPerVideo,
    total: videos.length * member.paymentPerVideo,
  }));

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
          title="Reports"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-apple-text">Monthly Report</h2>
          <Button variant="primary" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 stat-card-gradient-blue">
            <p className="text-apple-blue text-sm mb-2">Total Revenue</p>
            <h3 className="text-3xl font-bold text-apple-text">
              {formatCurrency(totalRevenue)}
            </h3>
            <p className="text-sm text-apple-text-secondary mt-2">{videos.length} videos</p>
          </div>
          <div className="card p-6 stat-card-gradient-orange">
            <p className="text-apple-orange text-sm mb-2">Total Expenses</p>
            <h3 className="text-3xl font-bold text-apple-text">
              {formatCurrency(totalExpenses)}
            </h3>
            <p className="text-sm text-apple-text-secondary mt-2">{expenses.length} entries</p>
          </div>
          <div className="card p-6 stat-card-gradient-green">
            <p className="text-apple-green text-sm mb-2">Net Profit</p>
            <h3 className="text-3xl font-bold text-apple-text">
              {formatCurrency(profit)}
            </h3>
            <p className="text-sm text-apple-text-secondary mt-2">
              {((profit / totalRevenue) * 100).toFixed(1)}% margin
            </p>
          </div>
        </div>

        {/* Team Earnings */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-apple-text mb-4">
            Team Earnings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-apple-border">
                  <th className="px-4 py-2 text-left text-apple-text-secondary">Name</th>
                  <th className="px-4 py-2 text-left text-apple-text-secondary">Role</th>
                  <th className="px-4 py-2 text-right text-apple-text-secondary">Per Video</th>
                  <th className="px-4 py-2 text-right text-apple-text-secondary">Total</th>
                </tr>
              </thead>
              <tbody>
                {teamEarnings.map((member, idx) => (
                  <tr key={idx} className="border-b border-apple-border hover:bg-apple-bg">
                    <td className="px-4 py-3 font-medium text-apple-text">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 capitalize text-apple-text-secondary">
                      {member.role.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-right text-apple-text-secondary">
                      {formatCurrency(member.perVideo)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-apple-text">
                      {formatCurrency(member.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
