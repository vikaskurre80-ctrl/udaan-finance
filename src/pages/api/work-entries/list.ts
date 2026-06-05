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
    const workEntries = await prisma.workEntry.findMany({
      include: {
        teamMember: true,
        approval: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const clients = await prisma.client.findMany();
    const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

    const entriesWithClient = workEntries.map(entry => ({
      ...entry,
      client: entry.clientId ? clientMap[entry.clientId] : null
    }));

    return res.status(200).json(entriesWithClient);
  } catch (error) {
    console.error('Error fetching work entries:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
