import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { workEntryId, paidStatus } = req.body as { workEntryId: string; paidStatus: 'PAID' | 'PENDING' };

  if (!workEntryId || !paidStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!['PAID', 'PENDING'].includes(paidStatus)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }

  try {
    const approval = await prisma.approval.update({
      where: { workEntryId },
      data: { paidStatus },
    });

    res.status(200).json(approval);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
