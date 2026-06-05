import React from 'react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useFinanceStore } from '@/store/finance';
import { formatCurrency } from '@/utils/calculations';

export default function TeamPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const teamMembers = useFinanceStore((state) => state.teamMembers);

  const roleColors: Record<string, string> = {
    shoot: 'badge-info',
    edit: 'badge-purple',
    smm: 'badge-error',
    ads: 'badge-warning',
    client_manager: 'badge-success',
    founder: 'badge-info',
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
          title="Team Members"
          showMenu
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      }
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-apple-text">
                    {member.name}
                  </h3>
                  {member.email && (
                    <p className="text-sm text-apple-text-secondary">{member.email}</p>
                  )}
                </div>
                <span
                  className={`badge ${roleColors[member.role] || 'badge-info'}`}
                >
                  {member.role.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-apple-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-apple-text-secondary">Per Video:</span>
                  <span className="font-semibold text-apple-text">
                    {formatCurrency(member.paymentPerVideo)}
                  </span>
                </div>
              </div>

              {member.phone && (
                <div className="mt-4 pt-4 border-t border-apple-border">
                  <p className="text-sm text-apple-text-secondary">Phone: {member.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
