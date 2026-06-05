import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { description, amount, category, date } = req.body;

  try {
    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category: category.toUpperCase(),
        date: new Date(date),
      },
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
