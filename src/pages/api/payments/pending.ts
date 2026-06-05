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
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        client: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    return res.status(200).json(pendingPayments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
