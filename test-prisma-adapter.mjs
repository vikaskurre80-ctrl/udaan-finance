import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma/generated/prisma/index.js';

async function main() {
  try {
    const connectionString = process.env.DATABASE_URL;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    console.log("Prisma client created with adapter");
    const users = await prisma.user.findMany();
    console.log("Success:", users.length);
  } catch (e) {
    console.error("Error connecting/querying:", e.message);
  }
}
main();
