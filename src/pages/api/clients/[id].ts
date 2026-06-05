import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const client = await prisma.client.findUnique({
        where: { id: String(id) },
        include: {
          videos: {
            orderBy: { date: 'desc' },
            include: {
              assignments: {
                include: { teamMember: true }
              }
            }
          },
        }
      });

      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      return res.status(200).json(client);
    } catch (error) {
      console.error('Error fetching client:', error);
      return res.status(500).json({ message: 'Error fetching client' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
