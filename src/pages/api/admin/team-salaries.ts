import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const teamMembers = await prisma.teamMember.findMany();
    
    const workEntries = await prisma.workEntry.findMany({
      include: { approval: true }
    });

    const salaries = teamMembers.map(member => {
      const memberEntries = workEntries.filter(e => e.teamMemberId === member.id && e.status === 'APPROVED');
      
      let earned = 0;
      let paid = 0;

      memberEntries.forEach(entry => {
        earned += entry.totalAmount;
        if (entry.approval?.paidStatus === 'PAID') {
          paid += entry.totalAmount;
        }
      });

      return {
        id: member.id,
        name: member.name,
        role: member.role,
        earned,
        paid,
        pending: earned - paid,
      };
    });

    return res.status(200).json(salaries);
  } catch (error) {
    console.error('Error fetching team salaries:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
