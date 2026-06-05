import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { useFinanceStore } from '@/store/finance';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Users, Mail, DollarSign, Briefcase } from 'lucide-react';
import { distributeVideoPayments } from '@/utils/calculations';

export default function TeamManagementPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const { teamMembers, videos } = useFinanceStore();

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin) return null;

  // Team data with earnings (calculated using payment split mapping)
  const paymentSplits = distributeVideoPayments(videos, teamMembers);
  const teamDataWithEarnings = teamMembers.map((member) => {
    const split = paymentSplits.find((p) => p.teamMemberId === member.id);
    return {
      ...member,
      videosCompleted: split ? videos.length : videos.length,
      totalEarnings: split ? split.totalAmount : videos.length * member.paymentPerVideo,
    };
  });

  const roleLabels: Record<string, string> = {
    shoot: '🎬 Shooter',
    edit: '✂️ Editor',
    smm: '📱 Social Media Manager',
    ads: '📢 Ads Manager',
    client_manager: '💼 Client Manager',
    founder: '👑 Founder',
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">👥 Team Management</h1>
        <p className="text-gray-600 mt-2">View and manage team members and their earnings</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Team Members</p>
              <p className="text-3xl font-bold text-blue-700">{teamMembers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Paid Out</p>
              <p className="text-3xl font-bold text-green-700">
                ₹{teamDataWithEarnings.reduce((sum, t) => sum + t.totalEarnings, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Per Member</p>
              <p className="text-3xl font-bold text-purple-700">
                ₹
                {Math.round(
                  teamDataWithEarnings.reduce((sum, t) => sum + t.totalEarnings, 0) / teamMembers.length
                ).toLocaleString('en-IN')}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Active Videos</p>
              <p className="text-3xl font-bold text-orange-700">{videos.length}</p>
            </div>
            <span className="text-3xl">🎥</span>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Member</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Role</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-900">Email</th>
                <th className="text-right py-3 px-6 font-semibold text-gray-900">Rate/Video</th>
                <th className="text-right py-3 px-6 font-semibold text-gray-900">Total Earned</th>
                <th className="text-center py-3 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamDataWithEarnings.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-900">{member.name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {roleLabels[member.role] || member.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {member.email || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-semibold text-gray-900">₹{member.paymentPerVideo.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-lg font-bold text-green-600">
                      ₹{member.totalEarnings.toLocaleString('en-IN')}
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button variant="secondary" size="sm" onClick={() => alert('Feature coming soon!')}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Info Box */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">📋 Team Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium">Fixed Team Members:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
              <li>Vikas Kurre - Founder & Shooter (₹100/video)</li>
              <li>Dhanewar Nishad - Production Manager (₹100/video)</li>
              <li>Aishwarya Kurre - Editor (₹150/video)</li>
              <li>Pravin - Client Manager (₹50/video)</li>
              <li>Chitransh Mistra - SMM (₹50/video)</li>
              <li>Anurag - Ads Manager (₹50/video)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Payment Breakdown:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 mt-2">
              <li>Total per video: ₹500</li>
              <li>Team payout: ₹400</li>
              <li>Company fund: ₹100</li>
              <li>Payment method: Direct transfer</li>
              <li>Frequency: Monthly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Button variant="secondary" onClick={() => router.push('/admin/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>
    </Layout>
  );
}
