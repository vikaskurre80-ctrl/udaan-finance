import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await prisma.expense.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { description, amount, category, date, paymentMethod } = req.body;

    try {
      const expense = await prisma.expense.update({
        where: { id: String(id) },
        data: {
          description,
          amount: parseFloat(amount),
          category: category.toUpperCase(),
          date: new Date(date),
          paymentMethod,
        },
      });

      return res.status(200).json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}