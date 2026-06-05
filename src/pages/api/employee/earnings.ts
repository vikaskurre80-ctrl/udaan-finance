import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query as { email: string };

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the team member by email
    const teamMember = await prisma.teamMember.findUnique({
      where: { email: email as string },
    });

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Get all work entries for this team member
    const workEntries = await prisma.workEntry.findMany({
      where: { teamMemberId: teamMember.id },
      include: { approval: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Calculate earnings
    let todayEarnings = 0;
    let monthlyEarnings = 0;
    let totalEarnings = 0;
    let pendingAmount = 0;
    let paidAmount = 0;
    let videosCount = 0;

    for (const entry of workEntries) {
      if (entry.status === 'APPROVED') {
        totalEarnings += entry.totalAmount;

        const createdDate = new Date(entry.createdAt);
        createdDate.setHours(0, 0, 0, 0);

        if (createdDate.getTime() === today.getTime()) {
          todayEarnings += entry.totalAmount;
        }

        if (createdDate >= monthStart && createdDate <= monthEnd) {
          monthlyEarnings += entry.totalAmount;
        }

        // Check if payment is marked as paid
        if (entry.approval?.paidStatus === 'PAID') {
          paidAmount += entry.totalAmount;
        } else {
          pendingAmount += entry.totalAmount;
        }

        videosCount += entry.quantity || 1;
      }
    }

    res.status(200).json({
      teamMemberId: teamMember.id,
      teamMemberName: teamMember.name,
      teamMemberRole: teamMember.role,
      todayEarnings,
      monthlyEarnings,
      totalEarnings,
      pendingAmount,
      paidAmount,
      videosCount,
      submissions: workEntries.length,
      approvedSubmissions: workEntries.filter(e => e.status === 'APPROVED').length,
      pendingSubmissions: workEntries.filter(e => e.status === 'PENDING').length,
    });
  } catch (error) {
    console.error('Error fetching employee earnings:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
