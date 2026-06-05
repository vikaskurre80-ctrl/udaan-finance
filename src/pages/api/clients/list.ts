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
    const clients = await prisma.client.findMany({
      include: {
        videos: {
          where: { status: 'COMPLETED' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

  const clientsWithProgress = await Promise.all(
    clients.map(async (client) => {
      const completedVideos = await prisma.video.count({
        where: {
          clientId: client.id,
          status: 'COMPLETED',
        },
      });

      return {
        ...client,
        completedReels: completedVideos,
        pendingReels: client.totalReels - completedVideos,
        totalEarned: completedVideos * client.pricePerReel,
        pendingCollection: client.packagePrice - client.totalReceived,
      };
    })
  );

  return res.status(200).json(clientsWithProgress);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
