import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await prisma.teamMember.delete({
        where: { id: String(id) },
      });
      return res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { name, role, paymentPerVideo, email } = req.body;
    try {
      const member = await prisma.teamMember.update({
        where: { id: String(id) },
        data: {
          name,
          role,
          paymentPerVideo: parseInt(paymentPerVideo),
          email,
        },
      });
      return res.status(200).json(member);
    } catch (error) {
      console.error('Error updating team member:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}