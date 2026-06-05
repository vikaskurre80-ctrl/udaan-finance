import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, totalReels, packagePrice } = req.body;

  if (!name || !totalReels || !packagePrice) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pricePerReel = Math.floor(packagePrice / totalReels);

    const client = await prisma.client.create({
      data: {
        name,
        totalReels: Number(totalReels),
        packagePrice: Number(packagePrice),
        pricePerReel,
      },
    });

    return res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
