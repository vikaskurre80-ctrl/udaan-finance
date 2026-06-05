import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

const TEAM = [
  { email: 'vikaskurre80@gmail.com', name: 'Vikas Kurre', role: 'shoot', payment: 100, isAdmin: true },
  { email: 'pravinchaturvedi40320@gmail.com', name: 'Pravin', role: 'client_manager', payment: 50, isAdmin: false },
  { email: 'dhaneshwarnishad780@gmail.com', name: 'Dhanewar Nishad', role: 'shoot', payment: 100, isAdmin: false },
  { email: 'starrock22648@gmail.com', name: 'Chitransh Mistra', role: 'smm', payment: 50, isAdmin: false },
  { email: 'aishwarayakurre@gmail.com', name: 'Aishwarya Kurre', role: 'edit', payment: 150, isAdmin: false },
  { email: 'anurag.op.ar@gmail.com', name: 'Anurag', role: 'ads', payment: 50, isAdmin: false },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = [];
    for (const member of TEAM) {
      const user = await prisma.user.upsert({
        where: { email: member.email },
        update: { name: member.name, role: member.role, isAdmin: member.isAdmin },
        create: { email: member.email, name: member.name, role: member.role, isAdmin: member.isAdmin },
      });

      await prisma.teamMember.upsert({
        where: { email: member.email },
        update: { name: member.name, role: member.role, paymentPerVideo: member.payment },
        create: { userId: user.id, email: member.email, name: member.name, role: member.role, paymentPerVideo: member.payment },
      });

      results.push({ name: member.name, email: member.email, payment: member.payment });
    }

    res.status(200).json({ message: 'Team setup complete', results });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed team', details: String(error) });
  }
}
