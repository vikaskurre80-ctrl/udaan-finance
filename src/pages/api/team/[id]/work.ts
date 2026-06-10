import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const workEntries = await prisma.workEntry.findMany({
        where: { teamMemberId: id as string },
        include: { approval: true },
        orderBy: { date: 'desc' },
      });
      return res.status(200).json(workEntries);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch work entries' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}