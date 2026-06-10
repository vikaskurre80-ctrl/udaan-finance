import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const members = await prisma.teamMember.findMany();
      return res.status(200).json(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { name, role, paymentPerVideo, email } = req.body;

    try {
      const member = await prisma.teamMember.create({
        data: {
          name,
          role,
          paymentPerVideo: parseInt(paymentPerVideo),
          email: email || undefined,
        },
      });

      return res.status(201).json(member);
    } catch (error) {
      console.error('Error creating team member:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}