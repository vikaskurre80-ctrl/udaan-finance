import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { workEntryId } = req.body;

  try {
    const workEntry = await prisma.workEntry.findUnique({
      where: { id: workEntryId },
      include: { approval: true }
    });

    if (!workEntry || workEntry.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Work entry not found or not approved yet' });
    }

    const approval = await prisma.approval.upsert({
      where: { workEntryId },
      update: {
        paidStatus: 'PAID',
      },
      create: {
        workEntryId,
        approverId: workEntry.userId, // Fallback if no approver
        status: 'APPROVED',
        paidStatus: 'PAID',
        approvedAt: new Date(),
      },
    });

    return res.status(200).json(approval);
  } catch (error) {
    console.error('Error marking as paid:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
