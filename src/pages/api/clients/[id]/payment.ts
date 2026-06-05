import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    const { amount } = req.body;

    try {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: 'Invalid payment amount' });
      }

      const payment = await prisma.payment.create({
        data: {
          clientId: String(id),
          amount: Number(amount),
          dueDate: new Date(),
          paymentDate: new Date(),
          status: 'PAID',
        },
      });

      await prisma.client.update({
        where: { id: String(id) },
        data: {
          totalReceived: { increment: Number(amount) },
        },
      });

      return res.status(201).json(payment);
    } catch (error) {
      console.error('Error recording payment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const payments = await prisma.payment.findMany({
        where: { clientId: String(id) },
        orderBy: { paymentDate: 'desc' },
      });

      return res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
