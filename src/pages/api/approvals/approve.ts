import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { workEntryId, approverId, action, approverEmail, approverName } = req.body;

  try {
    // Ensure approver user exists to satisfy FK
    if (approverId && approverEmail) {
      await prisma.user.upsert({
        where: { id: approverId },
        update: { email: approverEmail, name: approverName ?? undefined },
        create: { id: approverId, email: approverEmail, name: approverName ?? '', role: 'team_member', isAdmin: false },
      });
    } else if (approverId) {
      const exists = await prisma.user.findUnique({ where: { id: approverId } });
      if (!exists) {
        return res.status(400).json({ message: 'Approver not found and approverEmail not provided' });
      }
    }

    const workEntry = await prisma.workEntry.findUnique({
      where: { id: workEntryId },
    });

    if (!workEntry) {
      return res.status(404).json({ message: 'Work entry not found' });
    }

    const approval = await prisma.approval.upsert({
      where: { workEntryId },
      update: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedAt: action === 'approve' ? new Date() : null,
      },
      create: {
        workEntryId,
        approverId,
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedAt: action === 'approve' ? new Date() : null,
      },
    });

    if (action === 'approve') {
      await prisma.workEntry.update({
        where: { id: workEntryId },
        data: { status: 'APPROVED' },
      });
    } else if (action === 'reject') {
      await prisma.workEntry.update({
        where: { id: workEntryId },
        data: { status: 'REJECTED' },
      });
    }

    return res.status(200).json(approval);
  } catch (error) {
    console.error('Error processing approval:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
