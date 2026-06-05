import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

const ROLE_STATUS_FIELDS: Record<string, { status: string; idField: string }> = {
  shoot: { status: 'shooterStatus', idField: 'shooterId' },
  edit: { status: 'editorStatus', idField: 'editorId' },
  smm: { status: 'smmStatus', idField: 'smmId' },
  ads: { status: 'adsStatus', idField: 'adsId' },
  client_manager: { status: 'cmStatus', idField: 'cmId' },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const reelBatches = await prisma.reelBatch.findMany({
        include: { client: { select: { name: true, shopName: true, location: true, packagePrice: true, totalReels: true, pricePerReel: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(reelBatches);
    } catch (error) {
      console.error('Error fetching reel batches:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { clientId, description, role, teamMemberId, date } = req.body;

    try {
      const field = ROLE_STATUS_FIELDS[role] || ROLE_STATUS_FIELDS['shoot'];

      let batch = await prisma.reelBatch.findFirst({
        where: { clientId, status: { not: 'COMPLETED' } },
        orderBy: { createdAt: 'desc' },
      });

      if (!batch) {
        batch = await prisma.reelBatch.create({
          data: {
            clientId,
            description: description || `${role} work`,
            quantity: 1,
            date: date ? new Date(date) : new Date(),
            [field.status]: 'COMPLETED',
            [field.idField]: teamMemberId,
          },
        });
      } else {
        batch = await prisma.reelBatch.update({
          where: { id: batch.id },
          data: {
            [field.status]: 'COMPLETED',
            [field.idField]: teamMemberId,
          },
        });
      }

      const allDone = [batch.shooterStatus, batch.editorStatus, batch.smmStatus, batch.adsStatus, batch.cmStatus]
        .every(s => s === 'COMPLETED');

      if (allDone) {
        batch = await prisma.reelBatch.update({
          where: { id: batch.id },
          data: { status: 'READY_FOR_APPROVAL' },
        });
      }

      return res.status(201).json(batch);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
