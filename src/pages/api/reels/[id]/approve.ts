import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    const { action } = req.body;

    try {
      const reel = await prisma.reelBatch.findUnique({
        where: { id: String(id) },
        include: { client: true },
      });

      if (!reel) return res.status(404).json({ message: 'Reel batch not found' });

      if (action === 'approve') {
        await prisma.reelBatch.update({
          where: { id: reel.id },
          data: { status: 'COMPLETED' },
        });

        if (reel.clientId) {
          await prisma.client.update({
            where: { id: reel.clientId },
            data: { completedReels: { increment: 1 } },
          });
        }

        return res.status(200).json({ success: true, message: 'Reel batch approved' });
      }

      if (action === 'reject') {
        await prisma.reelBatch.update({
          where: { id: reel.id },
          data: { status: 'REJECTED' },
        });
        return res.status(200).json({ success: true, message: 'Reel batch rejected' });
      }

      return res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const reel = await prisma.reelBatch.findUnique({
        where: { id: String(id) },
        include: { client: true },
      });
      if (!reel) return res.status(404).json({ message: 'Reel batch not found' });
      return res.status(200).json(reel);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
