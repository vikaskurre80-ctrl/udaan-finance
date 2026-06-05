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
    const videos = await prisma.video.findMany();
    const expenses = await prisma.expense.findMany();

    const totalRevenue = videos.reduce((acc, v) => acc + v.totalRevenue, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const companyFund = videos.reduce((acc, v) => acc + v.companyFund, 0);

    const now = new Date();
    const todayRevenue = videos
      .filter((v) => new Date(v.date).toDateString() === now.toDateString())
      .reduce((acc, v) => acc + v.totalRevenue, 0);

    const monthlyRevenue = videos
      .filter((v) => {
        const d = new Date(v.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, v) => acc + v.totalRevenue, 0);

    return res.status(200).json({
      totalRevenue,
      totalExpenses,
      netProfit,
      companyFund,
      totalVideos: videos.length,
      todayRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
