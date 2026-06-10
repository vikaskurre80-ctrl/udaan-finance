import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma/generated/prisma/index.js';

(async () => {
  try {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const newMember = await prisma.teamMember.create({
      data: {
        userId: 'test-uid-1',
        name: 'Test User via Script',
        role: 'shoot',
        email: 'test-scripter@example.com',
        paymentPerVideo: 100,
      },
    });
    console.log('Created teamMember', newMember.id);

    const workEntry = await prisma.workEntry.create({
      data: {
        userId: 'test-uid-1',
        teamMemberId: newMember.id,
        title: 'Node created work',
        description: 'test',
        quantity: 2,
        ratePerTask: 50,
        totalAmount: 100,
        status: 'PENDING',
      },
    });
    console.log('Created workEntry', workEntry.id);

    await prisma.$disconnect();
  } catch (e) {
    console.error('Error in script:', e);
    process.exit(1);
  }
})();
