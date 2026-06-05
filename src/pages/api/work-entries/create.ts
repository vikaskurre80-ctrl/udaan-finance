import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, title, description, quantity, ratePerTask, email, name, clientId, role, date } = req.body;

  try {
    let teamMember = await prisma.teamMember.findUnique({
      where: { email },
    });

    if (!teamMember) {
      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email, name: name ?? '', role: 'team_member', isAdmin: false },
        });
      }

      teamMember = await prisma.teamMember.create({
        data: {
          userId: user.id,
          name: name ?? `User ${email}`,
          role: role || 'Shooter',
          email,
          paymentPerVideo: ratePerTask || 100,
        },
      });
    }

    const workEntry = await prisma.workEntry.create({
      data: {
        userId: teamMember.userId || userId,
        teamMemberId: teamMember.id,
        title,
        description,
        quantity,
        ratePerTask,
        totalAmount: quantity * ratePerTask,
        status: 'PENDING',
        clientId,
        role,
        date: date ? new Date(date) : new Date()
      },
    });

    return res.status(201).json(workEntry);
  } catch (error) {
    console.error('Error creating work entry:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
