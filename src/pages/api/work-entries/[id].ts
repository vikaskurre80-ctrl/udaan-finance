import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    try {
      const { action } = req.body;
      
      const workEntry = await prisma.workEntry.findUnique({
        where: { id: id as string },
        include: { approval: true },
      });

      if (!workEntry) return res.status(404).json({ error: 'Work entry not found' });

      if (action === 'approve') {
        if (workEntry.approval) {
          await prisma.approval.update({
            where: { workEntryId: id as string },
            data: { status: 'APPROVED', approvedAt: new Date() },
          });
        } else {
          await prisma.approval.create({
            data: {
              workEntryId: id as string,
              approverId: 'admin',
              status: 'APPROVED',
              approvedAt: new Date(),
            },
          });
        }
        return res.status(200).json({ success: true });
      }

      if (action === 'pay') {
        if (workEntry.approval) {
          await prisma.approval.update({
            where: { workEntryId: id as string },
            data: { paidStatus: 'PAID' },
          });
        }
        return res.status(200).json({ success: true });
      }

      if (action === 'delete') {
        await prisma.approval.deleteMany({ where: { workEntryId: id as string } });
        await prisma.workEntry.delete({ where: { id: id as string } });
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Operation failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}