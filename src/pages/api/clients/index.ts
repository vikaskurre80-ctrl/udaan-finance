import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, shopName, location, packagePrice, totalReels, pricePerReel, startDate } = req.body;

    try {
      const client = await prisma.client.create({
        data: {
          name,
          shopName,
          location,
          packagePrice,
          totalReels,
          pricePerReel,
          startDate: new Date(startDate),
        },
      });

      return res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      return res.status(500).json({ message: 'Error creating client' });
    }
  }

  if (req.method === 'GET') {
    try {
      const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      return res.status(500).json({ message: 'Error fetching clients' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
